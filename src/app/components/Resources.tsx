import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { AddResourceDialog } from "@/app/components/AddResourceDialog";
import { FileText, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { User } from "@/app/components/types";

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  addedBy: string;
  addedDate: string;
}

interface ResourcesProps {
  currentUser: User;
}

export function Resources({ currentUser }: ResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const handleSaveResource = (resourceData: Omit<Resource, "id">) => {
    if (editingResource) {
      // Update existing resource
      setResources(
        resources.map((r) =>
          r.id === editingResource.id
            ? { ...resourceData, id: editingResource.id }
            : r
        )
      );
      setEditingResource(null);
    } else {
      // Add new resource
      const newResource: Resource = {
        ...resourceData,
        id: Date.now().toString(),
        addedBy: currentUser.name,
        addedDate: new Date().toLocaleDateString(),
      };
      setResources([newResource, ...resources]);
    }
  };

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingResource(null);
    setDialogOpen(true);
  };

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

      {/* Resources Display */}
      {resources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">{resource.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteResource(resource.id)}
                >
                  <Trash2 className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
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
                Added by {resource.addedBy} on {resource.addedDate}
              </div>
            </div>
          ))}
        </div>
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