import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { LoginScreen } from "@/app/components/LoginScreen";
import { AddLogDialog } from "@/app/components/AddLogDialog";
import { ViewLogDialog } from "@/app/components/ViewLogDialog";
import { DesignLogCard } from "@/app/components/DesignLogCard";
import { DashboardStats } from "@/app/components/DashboardStats";
import { TimelineView } from "@/app/components/TimelineView";
import { Wiki } from "@/app/components/Wiki";
import { Resources } from "@/app/components/Resources";
import { Button } from "@/app/components/ui/button";
import { UserSettings } from "@/app/components/UserSettings";
import { AdminPanel } from "@/app/components/AdminPanel";
import { FilterBar } from "@/app/components/FilterBar";
import { TrashDialog } from "@/app/components/TrashDialog";
import { DesignLog, User } from "@/app/components/types";
import {
  Plus,
  LogOut,
  Settings,
  Users,
  FileText,
  Trash2,
  BookOpen,
  FolderOpen,
} from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs";
import {
  fetchLogs,
  createLog,
  updateLog,
  deleteLog,
  uploadImage,
  addComment,
  restoreLog,
  permanentDeleteLog,
} from "@/app/api/logs";
import {
  fetchUsers,
  updateUserPin,
  createUser,
  deleteUser,
} from "@/app/api/users";

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(
    null,
  );
  const [allLogs, setAllLogs] = useState<DesignLog[]>([]);
  const [logs, setLogs] = useState<DesignLog[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLog, setEditingLog] =
    useState<DesignLog | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingLog, setViewingLog] = useState<DesignLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [trashOpen, setTrashOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "timeline">(
    "card",
  );
  const [mainTab, setMainTab] = useState<"wiki" | "logs" | "resources">("logs");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadLogs();
    }
  }, [currentUser]);

  useEffect(() => {
    // Initialize selected tab when user logs in or users change
    if (currentUser && !selectedTab) {
      setSelectedTab(currentUser.id);
    }
  }, [currentUser, users]);

  useEffect(() => {
    // Filter logs based on selected tab, category, and sort
    if (selectedTab) {
      let filtered = allLogs.filter(
        (log) => log.userId === selectedTab && !log.deleted,
      );

      // Apply category filter
      if (selectedCategory !== "all") {
        filtered = filtered.filter(
          (log) => log.category === selectedCategory,
        );
      }

      // Apply sorting
      const sorted = [...filtered].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortBy === "newest"
          ? dateB - dateA
          : dateA - dateB;
      });

      setLogs(sorted);
    }
  }, [selectedTab, allLogs, selectedCategory, sortBy]);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const fetchedLogs = await fetchLogs();

      // Filter logs based on user role
      let filteredLogs = fetchedLogs;
      if (currentUser?.role !== "Admin") {
        filteredLogs = fetchedLogs.filter(
          (log) => log.userId === currentUser?.id,
        );
      }

      // Sort by date descending
      const sortedLogs = filteredLogs.sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime(),
      );
      setAllLogs(sortedLogs);
      setLogs(sortedLogs);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast.error("Failed to load design logs");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (user: User) => {
    // If user is setting PIN for first time, update it
    if (!user.pin || (user.pin && user.pin.length === 4)) {
      try {
        await updateUserPin(user.id, user.pin || "");
        await loadUsers(); // Reload users to get updated data
      } catch (error) {
        console.error("Error updating PIN:", error);
      }
    }
    setCurrentUser(user);
    toast.success(`Welcome, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLogs([]);
    toast.success("Logged out successfully");
  };

  const handleSaveLog = async (
    logData: Omit<DesignLog, "id"> | DesignLog,
    imageFile?: File | null,
  ) => {
    try {
      let imageUrl =
        "id" in logData ? logData.imageUrl : undefined;

      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const logWithImage = {
        ...logData,
        imageUrl,
        userId: currentUser!.id,
      };

      if ("id" in logData) {
        // Update existing log
        const updatedLog = await updateLog(
          logWithImage as DesignLog,
        );
        setAllLogs(
          allLogs.map((log) =>
            log.id === updatedLog.id ? updatedLog : log,
          ),
        );
        toast.success("Design log updated successfully");
        setEditingLog(null);
      } else {
        // Add new log
        const newLog = await createLog(logWithImage);
        setAllLogs([newLog, ...allLogs]);
        toast.success("Design log added successfully");
      }
    } catch (error) {
      console.error("Error saving log:", error);
      toast.error("Failed to save design log");
    }
  };

  const handleEditLog = (log: DesignLog) => {
    setEditingLog(log);
    setDialogOpen(true);
  };

  const handleViewLog = (log: DesignLog) => {
    setViewingLog(log);
    setViewDialogOpen(true);
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteLog(id);
      // Reload logs to get updated deleted status
      await loadLogs();
      toast.success("Design log moved to trash");
    } catch (error) {
      console.error("Error deleting log:", error);
      toast.error("Failed to delete design log");
    }
  };

  const handleOpenDialog = () => {
    setEditingLog(null);
    setDialogOpen(true);
  };

  const handleUpdatePin = async (newPin: string) => {
    try {
      await updateUserPin(currentUser!.id, newPin);
      const updatedUser = { ...currentUser!, pin: newPin };
      setCurrentUser(updatedUser);
      await loadUsers();
      toast.success("PIN updated successfully");
    } catch (error) {
      console.error("Error updating PIN:", error);
      toast.error("Failed to update PIN");
    }
  };

  const handleUpdateUserPin = async (
    userId: string,
    newPin: string,
  ) => {
    try {
      await updateUserPin(userId, newPin);
      await loadUsers();
      toast.success("User PIN updated successfully");
    } catch (error) {
      console.error("Error updating user PIN:", error);
      toast.error("Failed to update user PIN");
    }
  };

  const handleAddUser = async (name: string, role: string) => {
    try {
      await createUser(name, role);
      await loadUsers();
      toast.success("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      await loadUsers();
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleAddComment = async (
    logId: string,
    commentText: string,
  ) => {
    try {
      const updatedLog = await addComment(logId, {
        text: commentText,
        author: currentUser!.name,
        authorId: currentUser!.id,
      });
      setAllLogs(
        allLogs.map((log) =>
          log.id === updatedLog.id ? updatedLog : log,
        ),
      );
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleRestoreLog = async (id: string) => {
    try {
      const restoredLog = await restoreLog(id);
      setAllLogs(
        allLogs.map((log) =>
          log.id === restoredLog.id ? restoredLog : log,
        ),
      );
      toast.success("Design log restored successfully");
    } catch (error) {
      console.error("Error restoring log:", error);
      toast.error("Failed to restore design log");
    }
  };

  const handlePermanentDeleteLog = async (id: string) => {
    try {
      await permanentDeleteLog(id);
      setAllLogs(allLogs.filter((log) => log.id !== id));
      toast.success(
        "Design log permanently deleted successfully",
      );
    } catch (error) {
      console.error("Error permanently deleting log:", error);
      toast.error("Failed to permanently delete design log");
    }
  };

  // Get unique categories from logs based on selected tab
  const getAvailableCategories = (): string[] => {
    const tabLogs = allLogs.filter(
      (log) => log.userId === selectedTab && !log.deleted,
    );
    const categories = tabLogs
      .map((log) => log.category)
      .filter((category): category is string => !!category);
    return Array.from(new Set(categories));
  };

  // Get deleted logs for the current user
  const getDeletedLogs = (): DesignLog[] => {
    if (!currentUser) return [];
    return allLogs.filter(
      (log) => log.userId === currentUser.id && log.deleted,
    );
  };

  if (!currentUser) {
    return (
      <LoginScreen
        users={users}
        onLogin={handleLogin}
        loading={usersLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header and controls - contained */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Design Logs
                </h1>
                <p className="text-sm text-gray-600">
                  Logged in as:{" "}
                  <span className="font-semibold">
                    {currentUser.name}
                  </span>{" "}
                  ({currentUser.role})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenDialog}
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Log
              </Button>
              <Button
                onClick={() => setTrashOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Trash ({getDeletedLogs().length})
              </Button>
              <Button
                onClick={() => setSettingsOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Settings className="h-5 w-5" />
                Settings
              </Button>
              {currentUser.role === "Admin" && (
                <Button
                  onClick={() => setAdminPanelOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Users className="h-5 w-5" />
                  Admin Panel
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
          <p className="text-gray-600">
            Track your design work, research, and progress
          </p>
        </div>

        {/* Stats */}
        <DashboardStats logs={logs} />

        {/* Main Tabs: Wiki and Logs */}
        <Tabs
          value={mainTab}
          onValueChange={(value) =>
            setMainTab(value as "wiki" | "logs" | "resources")
          }
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="wiki" className="gap-2">
              <BookOpen className="h-4 w-4" />
              WIKI
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <FileText className="h-4 w-4" />
              LOGS
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              RESOURCES
            </TabsTrigger>
          </TabsList>

          {/* Wiki Tab Content */}
          <TabsContent value="wiki" className="mt-6">
            <Wiki currentUser={currentUser} />
          </TabsContent>

          {/* Logs Tab Content */}
          <TabsContent value="logs" className="mt-6">
            {/* User Tabs (Admin Only) */}
            {currentUser.role === "Admin" && users.length > 0 && (
              <div className="mb-6">
                <Tabs
                  value={selectedTab}
                  onValueChange={setSelectedTab}
                >
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value={currentUser.id}>
                      Me
                    </TabsTrigger>
                    {users
                      .filter((user) => user.id !== currentUser.id)
                      .map((user) => (
                        <TabsTrigger key={user.id} value={user.id}>
                          {user.name}
                        </TabsTrigger>
                      ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Filter Bar */}
            {!loading &&
              allLogs.filter((log) => log.userId === selectedTab)
                .length > 0 && (
                <FilterBar
                  categories={getAvailableCategories()}
                  selectedCategory={selectedCategory}
                  sortBy={sortBy}
                  onCategoryChange={setSelectedCategory}
                  onSortChange={setSortBy}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              )}
          </TabsContent>

          {/* Resources Tab Content */}
          <TabsContent value="resources" className="mt-6">
            <Resources currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Logs Display - full width for timeline, contained for card view */}
      {mainTab === "logs" && (
        <div className={viewMode === "timeline" ? "w-full" : "max-w-7xl mx-auto px-4"}>
          {loading ? (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Loading design logs
              </h3>
              <p className="text-gray-600 mb-4">
                Please wait while we load your logs
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No design logs yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start tracking your design work by adding your
                first log
              </p>
              <Button
                onClick={handleOpenDialog}
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Your First Log
              </Button>
            </div>
          ) : viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logs.map((log) => (
                <DesignLogCard
                  key={log.id}
                  log={log}
                  onEdit={handleEditLog}
                  onDelete={handleDeleteLog}
                  currentUser={currentUser}
                  onAddComment={handleAddComment}
                  allLogs={allLogs}
                />
              ))}
            </div>
          ) : (
            <TimelineView
              logs={logs}
              onSelectLog={handleViewLog}
            />
          )}
        </div>
      )}

      <AddLogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveLog}
        editingLog={editingLog}
        availableLogs={allLogs.filter(
          (log) =>
            !log.deleted && log.userId === currentUser.id,
        )}
      />
      <ViewLogDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        log={viewingLog}
        allLogs={allLogs}
      />
      <UserSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        currentUser={currentUser!}
        onUpdatePin={handleUpdatePin}
      />
      <AdminPanel
        open={adminPanelOpen}
        onOpenChange={setAdminPanelOpen}
        users={users}
        onUpdateUserPin={handleUpdateUserPin}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
      />
      <TrashDialog
        open={trashOpen}
        onOpenChange={setTrashOpen}
        deletedLogs={getDeletedLogs()}
        onRestore={handleRestoreLog}
        onPermanentDelete={handlePermanentDeleteLog}
      />
      <Toaster />
    </div>
  );
}