import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner"; // Toast notifications
import { LoginScreen } from "@/app/components/LoginScreen"; // PIN authentication UI
import { AddLogDialog } from "@/app/components/AddLogDialog"; // Dialog for adding/editing logs
import { ViewLogDialog } from "@/app/components/ViewLogDialog"; // Dialog for viewing log details
import { DesignLogCard } from "@/app/components/DesignLogCard"; // Card view for individual logs
import { DashboardStats } from "@/app/components/DashboardStats"; // Statistics dashboard
import { TimelineView } from "@/app/components/TimelineView"; // Timeline view for logs
import { Wiki } from "@/app/components/Wiki"; // Wiki tab component
import { Resources } from "@/app/components/Resources"; // Resources tab component
import { Button } from "@/app/components/ui/button"; // UI component
import { UserSettings } from "@/app/components/UserSettings"; // User PIN management dialog
import { AdminPanel } from "@/app/components/AdminPanel"; // Admin user management dialog
import { FilterBar } from "@/app/components/FilterBar"; // Filtering and view mode controls
import { TrashDialog } from "@/app/components/TrashDialog"; // Deleted logs (trash bin) dialog
import { DesignLog, User } from "@/app/components/types"; // TypeScript interfaces
import {
  Plus,
  LogOut,
  Settings,
  Users,
  FileText,
  Trash2,
  BookOpen,
  FolderOpen,
} from "lucide-react"; // Icons
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs"; // Tab navigation component
import {
  fetchLogs,
  createLog,
  updateLog,
  deleteLog,
  uploadImage,
  addComment,
  restoreLog,
  permanentDeleteLog,
} from "@/app/api/logs"; // API functions for logs - connects to backend
import {
  fetchUsers,
  updateUserPin,
  createUser,
  deleteUser,
} from "@/app/api/users"; // API functions for users - connects to backend

export default function App() {
  // ===== STATE MANAGEMENT =====
  // User-related state
  const [users, setUsers] = useState<User[]>([]); // All users in system
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Currently logged in user
  
  // Log-related state
  const [allLogs, setAllLogs] = useState<DesignLog[]>([]); // All logs from backend (filtered by role)
  const [logs, setLogs] = useState<DesignLog[]>([]); // Filtered/sorted logs for display
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false); // Add/Edit log dialog
  const [editingLog, setEditingLog] = useState<DesignLog | null>(null); // Log being edited
  const [viewDialogOpen, setViewDialogOpen] = useState(false); // View log details dialog
  const [viewingLog, setViewingLog] = useState<DesignLog | null>(null); // Log being viewed
  const [settingsOpen, setSettingsOpen] = useState(false); // User settings dialog
  const [adminPanelOpen, setAdminPanelOpen] = useState(false); // Admin panel dialog
  const [trashOpen, setTrashOpen] = useState(false); // Trash bin dialog
  
  // Loading state
  const [loading, setLoading] = useState(true); // Logs loading state
  const [usersLoading, setUsersLoading] = useState(true); // Users loading state
  
  // Navigation and filtering
  const [selectedTab, setSelectedTab] = useState(""); // Selected user tab (Admin only)
  const [selectedCategory, setSelectedCategory] = useState("all"); // Category filter
  const [sortBy, setSortBy] = useState("newest"); // Sort order (newest/oldest)
  const [viewMode, setViewMode] = useState<"card" | "timeline">("card"); // View mode
  const [mainTab, setMainTab] = useState<"wiki" | "logs" | "resources">("logs"); // Top-level tab

  // ===== EFFECTS =====
  
  // Load users on app mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load logs when user logs in
  useEffect(() => {
    if (currentUser) {
      loadLogs();
    }
  }, [currentUser]);

  // Initialize selected tab when user logs in
  useEffect(() => {
    // Admin starts on their own tab, users don't have tabs
    if (currentUser && !selectedTab) {
      setSelectedTab(currentUser.id);
    }
    
    // Set default tab based on user's accessible tabs
    if (currentUser && currentUser.accessibleTabs) {
      const tabs = currentUser.accessibleTabs;
      // Default to first accessible tab
      if (!tabs.includes(mainTab)) {
        setMainTab(tabs[0] as "wiki" | "logs" | "resources");
      }
    }
  }, [currentUser, users]);

  // Filter and sort logs based on selected tab, category, and sort order
  useEffect(() => {
    if (selectedTab) {
      // Filter by selected user tab
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

  // ===== DATA LOADING FUNCTIONS =====
  
  /**
   * Load all users from backend
   * Connects to: /src/app/api/users.ts → /supabase/functions/server/index.tsx → KV store (user:*)
   */
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

  /**
   * Load design logs from backend
   * Connects to: /src/app/api/logs.ts → /supabase/functions/server/index.tsx → KV store (log:*)
   * 
   * ROLE-BASED FILTERING:
   * - Admin: Sees ALL logs from all users
   * - Regular users: See only their own logs
   */
  const loadLogs = async () => {
    try {
      setLoading(true);
      const fetchedLogs = await fetchLogs();

      // Filter logs based on user role
      let filteredLogs = fetchedLogs;
      if (currentUser?.role !== "Admin") {
        // Regular users only see their own logs
        filteredLogs = fetchedLogs.filter(
          (log) => log.userId === currentUser?.id,
        );
      }

      // Sort by date descending (newest first)
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

  // ===== EVENT HANDLERS =====
  
  /**
   * Handle user login
   * Called from: /src/app/components/LoginScreen.tsx
   * Updates user PIN if setting for first time
   */
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

  /**
   * Handle user logout
   * Clears currentUser state, which triggers LoginScreen to show
   */
  const handleLogout = () => {
    setCurrentUser(null);
    setLogs([]);
    toast.success("Logged out successfully");
  };

  /**
   * Handle save log (create or update)
   * Called from: /src/app/components/AddLogDialog.tsx
   * 
   * FLOW:
   * 1. Upload image to Supabase Storage if provided
   * 2. Create/update log with image URL
   * 3. Update local state
   * 4. Show toast notification
   */
  const handleSaveLog = async (
    logData: Omit<DesignLog, "id"> | DesignLog,
    imageFile?: File | null,
  ) => {
    try {
      let imageUrl =
        "id" in logData ? logData.imageUrl : undefined;

      // Upload image if provided
      // Connects to: /src/app/api/logs.ts → uploadImage() → Supabase Storage
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

  /**
   * Handle edit log
   * Opens AddLogDialog with log data pre-filled
   */
  const handleEditLog = (log: DesignLog) => {
    setEditingLog(log);
    setDialogOpen(true);
  };

  /**
   * Handle view log
   * Opens ViewLogDialog with log details
   */
  const handleViewLog = (log: DesignLog) => {
    setViewingLog(log);
    setViewDialogOpen(true);
  };

  /**
   * Handle delete log
   * Moves log to trash (soft delete)
   */
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

  /**
   * Handle open dialog
   * Opens AddLogDialog for creating a new log
   */
  const handleOpenDialog = () => {
    setEditingLog(null);
    setDialogOpen(true);
  };

  /**
   * Handle update PIN
   * Updates current user's PIN
   */
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

  /**
   * Handle update user PIN
   * Admin function to update another user's PIN
   */
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

  /**
   * Handle add user
   * Admin function to add a new user
   */
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

  /**
   * Handle delete user
   * Admin function to delete a user
   */
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

  /**
   * Handle add comment
   * Adds a comment to a log
   */
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

  /**
   * Handle restore log
   * Restores a log from trash
   */
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

  /**
   * Handle permanent delete log
   * Permanently deletes a log from the system
   */
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
        <DashboardStats logs={logs} currentUser={currentUser} />

        {/* Main Tabs: Wiki and Logs */}
        <Tabs
          value={mainTab}
          onValueChange={(value) =>
            setMainTab(value as "wiki" | "logs" | "resources")
          }
          className="mb-6"
        >
          <TabsList>
            {(!currentUser.accessibleTabs || currentUser.accessibleTabs.includes("wiki")) && (
              <TabsTrigger value="wiki" className="gap-2">
                <BookOpen className="h-4 w-4" />
                WIKI
              </TabsTrigger>
            )}
            {(!currentUser.accessibleTabs || currentUser.accessibleTabs.includes("logs")) && (
              <TabsTrigger value="logs" className="gap-2">
                <FileText className="h-4 w-4" />
                LOGS
              </TabsTrigger>
            )}
            {(!currentUser.accessibleTabs || currentUser.accessibleTabs.includes("resources")) && (
              <TabsTrigger value="resources" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                RESOURCES
              </TabsTrigger>
            )}
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
            <Resources currentUser={currentUser} allUsers={users} />
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