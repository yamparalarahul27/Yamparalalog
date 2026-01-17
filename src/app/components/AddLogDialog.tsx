import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Spinner } from "@/app/components/ui/spinner";
import { Checkbox } from "@/app/components/ui/checkbox";
import { DesignLog } from "./types";
import { Upload, X, Link2, Trash2 } from "lucide-react";

interface AddLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (log: Omit<DesignLog, "id"> | DesignLog, imageFile?: File | null) => Promise<void>;
  editingLog?: DesignLog | null;
  availableLogs?: DesignLog[];
  readOnly?: boolean;
}

export function AddLogDialog({
  open,
  onOpenChange,
  onSave,
  editingLog,
  availableLogs,
  readOnly = false,
}: AddLogDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [linkedLogIds, setLinkedLogIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingLog) {
      setTitle(editingLog.title);
      setDescription(editingLog.description);
      setDate(editingLog.date);
      setCategory(editingLog.category || "");
      setLinkedLogIds(editingLog.linkedLogIds || []);
      setImagePreview(editingLog.imageUrl || "");
      setImageFile(null);
    } else {
      setTitle("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("");
      setLinkedLogIds([]);
      setImageFile(null);
      setImagePreview("");
    }
  }, [editingLog, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const logData = {
      title,
      description,
      date,
      category: category || undefined,
      linkedLogIds: linkedLogIds.length > 0 ? linkedLogIds : undefined,
    };

    setIsSaving(true);
    if (editingLog) {
      await onSave({ ...logData, id: editingLog.id, imageUrl: editingLog.imageUrl }, imageFile);
    } else {
      await onSave(logData, imageFile);
    }
    setIsSaving(false);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? "View Design Log" : editingLog ? "Edit Design Log" : "Add New Design Log"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter log title"
                required
                disabled={readOnly}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="[&::-webkit-calendar-picker-indicator]:invert-0 [&::-webkit-calendar-picker-indicator]:brightness-0"
                disabled={readOnly}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., UI Design, UX Research"
                disabled={readOnly}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your design work..."
                rows={4}
                required
                disabled={readOnly}
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Link to Other Logs
              </Label>
              {availableLogs && availableLogs.length > 0 ? (
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {availableLogs
                    .filter((log) => !log.deleted && log.id !== editingLog?.id)
                    .map((log) => (
                      <div key={log.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`link-${log.id}`}
                          checked={linkedLogIds.includes(log.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setLinkedLogIds([...linkedLogIds, log.id]);
                            } else {
                              setLinkedLogIds(linkedLogIds.filter((id) => id !== log.id));
                            }
                          }}
                          disabled={readOnly}
                        />
                        <label
                          htmlFor={`link-${log.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {log.title}
                        </label>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No other logs available to link
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image</Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={handleRemoveImage}
                    disabled={readOnly}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={readOnly}
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload an image
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {readOnly ? "Close" : "Cancel"}
            </Button>
            {!readOnly && (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    {imageFile ? "Uploading..." : "Saving..."}
                  </>
                ) : (
                  editingLog ? "Update Log" : "Add Log"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}