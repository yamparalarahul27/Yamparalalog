import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { BookOpen, Plus, Edit2, Trash2, Search, Upload, X, Image as ImageIcon, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import {
  fetchWikiPages,
  createWikiPage,
  updateWikiPage,
  deleteWikiPage,
  WikiPage,
  WikiComment,
} from "@/app/api/wiki";
import { User } from "@/app/components/types";

interface WikiProps {
  currentUser: User;
}

export function Wiki({ currentUser }: WikiProps) {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<WikiComment[]>([]);

  // Load wiki pages on mount
  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const loadedPages = await fetchWikiPages();
      setPages(loadedPages);
    } catch (error) {
      console.error("Error loading wiki pages:", error);
      toast.error("Failed to load wiki pages");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async () => {
    try {
      const newPage = await createWikiPage({
        title: "New Page",
        content: "Start writing your wiki content here...",
        category: "",
        images: [],
        comments: [],
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        lastModified: new Date().toISOString(),
      });
      setPages([newPage, ...pages]);
      setSelectedPage(newPage);
      setEditTitle(newPage.title);
      setEditContent(newPage.content);
      setEditCategory(newPage.category || "");
      setEditImages(newPage.images || []);
      setIsEditing(true);
      toast.success("New page created");
    } catch (error) {
      console.error("Error creating page:", error);
      toast.error("Failed to create page");
    }
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;

    try {
      const updatedPage = await updateWikiPage(selectedPage.id, {
        title: editTitle,
        content: editContent,
        category: editCategory,
        images: editImages,
        lastModified: new Date().toISOString(),
      });

      setPages(pages.map(p => p.id === selectedPage.id ? updatedPage : p));
      setSelectedPage(updatedPage);
      setIsEditing(false);
      toast.success("Page saved successfully");
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error("Failed to save page");
    }
  };

  const handleDeletePage = async (id: string) => {
    try {
      await deleteWikiPage(id);
      setPages(pages.filter(p => p.id !== id));
      if (selectedPage?.id === id) {
        setSelectedPage(null);
      }
      toast.success("Page deleted");
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Failed to delete page");
    }
  };

  const handleEditPage = (page: WikiPage) => {
    setSelectedPage(page);
    setEditTitle(page.title);
    setEditContent(page.content);
    setEditCategory(page.category || "");
    setEditImages(page.images || []);
    setIsEditing(true);
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImages([...editImages, reader.result as string]);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditImages(editImages.filter((_, i) => i !== index));
  };

  const handleAddComment = async () => {
    if (!selectedPage || !commentText.trim()) return;
    
    try {
      const newComment: WikiComment = {
        id: Date.now().toString(),
        text: commentText,
        author: currentUser.name,
        authorId: currentUser.id,
        date: new Date().toISOString(),
      };
      
      const updatedComments = [...(selectedPage.comments || []), newComment];
      const updatedPage = await updateWikiPage(selectedPage.id, {
        comments: updatedComments,
      });
      
      setPages(pages.map(p => p.id === selectedPage.id ? updatedPage : p));
      setSelectedPage(updatedPage);
      toast.success("Comment added");
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Sidebar - Page List */}
      <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Wiki Pages
            </h2>
            <Button size="sm" onClick={handleCreatePage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredPages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No pages yet. Create your first wiki page!
            </p>
          ) : (
            filteredPages.map((page) => (
              <Card
                key={page.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedPage?.id === page.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => {
                  setSelectedPage(page);
                  setIsEditing(false);
                }}
              >
                <h3 className="font-medium text-sm line-clamp-1">{page.title}</h3>
                {page.category && (
                  <p className="text-xs text-gray-500 mt-1">{page.category}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(page.lastModified).toLocaleDateString()}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="col-span-9 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto">
        {!selectedPage ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No page selected</h3>
            <p className="text-gray-600 mb-4">
              Select a page from the sidebar or create a new one
            </p>
            <Button onClick={handleCreatePage} className="gap-2">
              <Plus className="h-5 w-5" />
              Create New Page
            </Button>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Page title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category (optional)</label>
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="e.g., Design System, Guidelines, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Content</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your wiki content here..."
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
            
            {/* Images Section */}
            <div>
              <label className="text-sm font-medium mb-2 block">Images</label>
              <div className="space-y-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {editImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {editImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSavePage}>Save Changes</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(selectedPage.title);
                  setEditContent(selectedPage.content);
                  setEditCategory(selectedPage.category || "");
                  setEditImages(selectedPage.images || []);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{selectedPage.title}</h1>
                {selectedPage.category && (
                  <p className="text-sm text-gray-600 mb-1">
                    Category: {selectedPage.category}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Last modified: {new Date(selectedPage.lastModified).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditPage(selectedPage)}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                {/* Only show delete button if user is Admin or the creator */}
                {(currentUser.role === "Admin" || selectedPage.createdBy === currentUser.id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePage(selectedPage.id)}
                    className="gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {selectedPage.content}
              </div>
            </div>
            {selectedPage.images && selectedPage.images.length > 0 && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Images ({selectedPage.images.length})
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {selectedPage.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                        onClick={() => window.open(image, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
              </h3>
              <div className="space-y-4">
                {(selectedPage.comments || []).map(comment => (
                  <div key={comment.id} className="flex items-start">
                    <div className="bg-gray-100 rounded-full p-2 mr-3">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{comment.author}</p>
                      <p className="text-xs text-gray-500">{new Date(comment.date).toLocaleString()}</p>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center">
                  <div className="bg-gray-100 rounded-full p-2 mr-3">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <Textarea
                    placeholder="Add a comment..."
                    className="min-h-[50px] font-mono text-sm flex-1"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddComment}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}