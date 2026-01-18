import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { AddResourceDialog } from "@/app/components/AddResourceDialog"; // Dialog for adding resources
import { FileText, Link as LinkIcon, Plus, Trash2, Filter } from "lucide-react"; // Icons
import { User } from "@/app/components/types"; // TypeScript interface for User
import { toast } from "sonner"; // Toast notifications
import {
  fetchResources,
  createResource,
  deleteResource,
  Resource,
} from "@/app/api/resources"; // API functions - connects to backend
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"; // Dropdown select component

interface ResourcesProps {
  currentUser: User; // Currently logged-in user
  allUsers: User[]; // All users in system (for filter dropdown)
}

export function Resources({ currentUser, allUsers }: ResourcesProps) {
  // ===== STATE MANAGEMENT =====
  const [resources, setResources] = useState<Resource[]>([]); // All resources from backend
  const [dialogOpen, setDialogOpen] = useState(false); // Add resource dialog state
  const [editingResource, setEditingResource] = useState<Resource | null>(null); // Resource being edited (future feature)
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedCategory, setSelectedCategory] = useState("all"); // Category filter
  const [selectedUser, setSelectedUser] = useState("all"); // User filter

  // ===== EFFECTS =====

  // Load resources on component mount
  useEffect(() => {
    loadResources();
  }, []);

  /**
   * Load all resources from backend
   * Connects to: /src/app/api/resources.ts → backend → KV store (resource:*)
   */
  const loadResources = async () => {
    try {
      setLoading(true);
      const fetchedResources = await fetchResources();
      setResources(fetchedResources);
    } catch (error) {
      console.error("Error loading resources:", error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle save resource
   * Creates a new resource with current user info and admin flag
   */
  const handleSaveResource = async (resourceData: Omit<Resource, "id">) => {
    try {
      const newResource = await createResource({
        ...resourceData,
        addedBy: currentUser.name,
        addedById: currentUser.id,
        isAdminResource: currentUser.id === "admin", // Flag for section separation
      });
      setResources([newResource, ...resources]);
      toast.success("Resource added successfully");
    } catch (error) {
      console.error("Error saving resource:", error);
      toast.error("Failed to save resource");
    }
  };

  /**
   * Handle delete resource
   * Removes resource from backend and updates local state
   */
  const handleDeleteResource = async (id: string) => {
    try {
      await deleteResource(id);
      setResources(resources.filter((r) => r.id !== id));
      toast.success("Resource deleted successfully");
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
    }
  };

  /**
   * Handle edit resource (future feature)
   */
  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setDialogOpen(true);
  };

  /**
   * Handle open dialog
   * Opens AddResourceDialog for creating a new resource
   */
  const handleOpenDialog = () => {
    setEditingResource(null);
    setDialogOpen(true);
  };

  // ===== FILTERING LOGIC =====

  // Separate resources into Admin and User sections
  const adminResources = resources.filter((r) => r.isAdminResource);
  const userResources = resources.filter((r) => !r.isAdminResource);

  /**
   * Apply filters to a list of resources
   * Filters by category and user (who added it)
   * Sorts by date (newest first)
   */
  const filterResources = (resourceList: Resource[]) => {
    let filtered = resourceList;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }

    // User filter
    if (selectedUser !== "all") {
      filtered = filtered.filter((r) => r.addedById === selectedUser);
    }

    // Sort by date (newest first)
    filtered = filtered.sort((a, b) => {
      return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
    });

    return filtered;
  };

  // Apply filters to both sections
  const filteredAdminResources = filterResources(adminResources);
  const filteredUserResources = filterResources(userResources);

  // Get unique categories from all resources
  const categories = Array.from(
    new Set(resources.map((r) => r.category))
  ).sort();

  /**
   * RESOURCE CARD COMPONENT
   * Displays individual resource with OG image preview
   * 
   * OG IMAGE FETCHING:
   * - Uses Microlink API to fetch Open Graph meta tags
   * - URL: https://api.microlink.io/?url={url}
   * - Returns og:image from website's meta tags
   * - Fallback to favicon if OG image not found
   */
  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <div
      key={resource.id}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* OG Image Preview - fetches Open Graph image from website */}
      <div className="relative h-40 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
        <img
          src={`https://api.microlink.io/?url=${encodeURIComponent(resource.url)}&embed=image.url`}
          alt={resource.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to favicon if OG image fails to load
            const target = e.target as HTMLImageElement;
            try {
              const domain = new URL(resource.url).hostname;
              target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
              target.className = "w-16 h-16 object-contain";
            } catch {
              // If all fails, hide the image
              target.style.display = "none";
            }
          }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <LinkIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <h3 className="font-semibold line-clamp-1">{resource.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteResource(resource.id)}
          >
            <Trash2 className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {resource.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {resource.category}
          </span>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Open Link
          </a>
        </div>
        <div className="text-xs text-gray-500 mt-3">
          Shared by {resource.addedBy}, {formatDateTime(resource.addedDate)}
        </div>
      </div>
    </div>
  );

  /**
   * Format date and time for display
   * Converts ISO timestamp to "17 Jan 2026, 6:09 PM" format
   */
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);

    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${day} ${month} ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <img
          src="/images/resource-folder-icon.png"
          alt="Loading..."
          className="w-24 h-24 object-contain mx-auto mb-4 animate-pulse opacity-80"
        />
        <p className="text-gray-600">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resources</h2>
          <p className="text-gray-600">
            Shared links, files, and helpful resources
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenDialog}>
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-4">
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category">Category</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedUser}
          onValueChange={(value) => setSelectedUser(value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="User">User</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {allUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resources Display */}
      {resources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <img
            src="/images/resource-folder-icon.png"
            alt="No resources"
            className="w-32 h-32 object-contain mx-auto mb-4 hover:scale-105 transition-transform duration-300"
          />
          <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
          <p className="text-gray-600 mb-4">
            Start adding useful links and resources for your team
          </p>
          <Button className="gap-2" onClick={handleOpenDialog}>
            <Plus className="h-5 w-5" />
            Add Your First Resource
          </Button>
        </div>
      ) : (
        <>
          {/* Admin Resources Section */}
          {filteredAdminResources.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent"></div>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  Team Resources
                </h3>
                <div className="h-px flex-1 bg-gradient-to-l from-blue-200 to-transparent"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAdminResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}

          {/* User Resources Section */}
          {filteredUserResources.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  User Resources
                </h3>
                <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUserResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}

          {/* No filtered results */}
          {filteredAdminResources.length === 0 && filteredUserResources.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters to see more resources
              </p>
            </div>
          )}
        </>
      )}

      <AddResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveResource}
        editingResource={editingResource}
      />
    </div>
  );
}