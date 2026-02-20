import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog"; // Dialog UI components
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  addedBy: string;
  addedDate: string; // ISO timestamp string
}

interface AddResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (resource: Omit<Resource, "id">) => void; // Called from Resources.tsx
  editingResource?: Resource | null; // For future edit functionality
}

// Predefined resource categories
const RESOURCE_CATEGORIES = [
  "Design Tools",
  "Documentation",
  "Inspiration",
  "Tutorials",
  "Assets",
  "References",
  "Other",
];

export function AddResourceDialog({
  open,
  onOpenChange,
  onSave,
  editingResource,
}: AddResourceDialogProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Design Tools");

  // Reset form when dialog opens/closes or editing resource changes
  useEffect(() => {
    if (editingResource) {
      setTitle(editingResource.title);
      setUrl(editingResource.url);
      setDescription(editingResource.description);
      setCategory(editingResource.category);
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
      setCategory("Design Tools");
    }
  }, [editingResource, open]);

  /**
   * Handle form submission
   * Creates resource object with ISO timestamp and passes to parent
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    onSave({
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      category,
      addedBy: "", // Will be set by Resources.tsx with currentUser.name
      addedDate: new Date().toISOString(), // Full timestamp for "17 Jan 2026, 6:09 PM" format
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingResource ? "Edit Resource" : "Add New Resource"}
          </DialogTitle>
          <DialogDescription>
            {editingResource
              ? "Make changes to your resource here."
              : "Add a new resource to your collection."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., UI Design System"
              required
            />
          </div>

          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the resource"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingResource ? "Update Resource" : "Add Resource"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}