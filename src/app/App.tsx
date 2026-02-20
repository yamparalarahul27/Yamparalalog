/**
 * main/App.tsx
 * The root component of the Design Log Tracker application.
 * 
 * CORE RESPONSIBILITIES:
 * - State Management: Orchestrates users, logs, and UI states (dialogs, tabs, filters).
 * - Authentication: Handles login/logout via PIN verification.
 * - API Orchestration: Coordinates data fetching and updates between frontend and Supabase.
 * - Layout: Renders the primary navigation (Tabs) and conditional UI based on user role.
 * 
 * RELATIONSHIPS:
 * - Links to `src/app/api/*`: For all backend interactions (Logs and Users).
 * - Links to `src/app/components/*`: Uses all UI components for rendering the dashboard, wiki, and logs.
 * - Links to `src/app/components/types.ts`: Uses shared TypeScript interfaces for data consistency.
 */

import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner"; // Toast notifications
import { LoginScreen } from "@/app/components/LoginScreen"; // PIN authentication UI
import { AddLogDialog } from "@/app/components/AddLogDialog"; // Dialog for adding/editing logs
import { ViewLogDialog } from "@/app/components/ViewLogDialog"; // Dialog for viewing log details
import { DesignLogCard } from "@/app/components/DesignLogCard"; // Card view for individual logs
import { AppHeader } from "@/app/components/layout/AppHeader";
import { DashboardStats } from "@/app/components/DashboardStats"; // Statistics dashboard
import { TimelineView } from "@/app/components/TimelineView"; // Timeline view for logs
import { Wiki } from "@/app/components/Wiki"; // Wiki tab component
import { Resources } from "@/app/components/Resources"; // Resources tab component
import { Button } from "@/app/components/ui/button"; // UI component
import { UserSettings } from "@/app/components/UserSettings"; // User PIN management dialog
import { AdminPanel } from "@/app/components/AdminPanel"; // Admin user management dialog
import { FilterBar } from "@/app/components/FilterBar"; // Filtering and view mode controls
import { TrashDialog } from "@/app/components/TrashDialog"; // Deleted logs (trash bin) dialog
import UPIDialog from "@/app/components/UPIDialog"; // UPI Payment dialog
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
  ChevronDown,
  Lock,
} from "lucide-react"; // Icons
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs"; // Tab navigation component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";
import { apiClient } from "@/services/api-client"; // Centralized API client
import { Agentation } from "agentation"; // AI Feedback Tool
import { useAuth } from "@/app/hooks/useAuth";
import { useLogs } from "@/app/hooks/useLogs";


export default function App() {
  // ===== HOOKS & STATE =====
  const {
    users,
    currentUser,
    usersLoading,
    setCurrentUser,
    loadUsers,
    login,
    logout,
    updatePin,
    updateUserPin,
    addUser,
    updateUserAccess,
    deleteUser,
  } = useAuth();

  const {
    allLogs,
    loading,
    setAllLogs,
    loadLogs,
    saveLog,
    deleteLog,
    addComment,
    restoreLog,
    permanentDeleteLog,
  } = useLogs(currentUser);

  const [logs, setLogs] = useState<DesignLog[]>([]); // Filtered/sorted logs for display

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false); // Add/Edit log dialog
  const [editingLog, setEditingLog] = useState<DesignLog | null>(null); // Log being edited
  const [viewDialogOpen, setViewDialogOpen] = useState(false); // View log details dialog
  const [viewingLog, setViewingLog] = useState<DesignLog | null>(null); // Log being viewed
  const [settingsOpen, setSettingsOpen] = useState(false); // User settings dialog
  const [adminPanelOpen, setAdminPanelOpen] = useState(false); // Admin panel dialog
  const [trashOpen, setTrashOpen] = useState(false); // Trash bin dialog
  const [upiOpen, setUpiOpen] = useState(false); // UPI Payment dialog

  // Navigation and filtering
  const [selectedTab, setSelectedTab] = useState(""); // Selected user tab (Admin only)
  const [selectedCategory, setSelectedCategory] = useState("all"); // Category filter
  const [sortBy, setSortBy] = useState("newest"); // Sort order (newest/oldest)
  const [viewMode, setViewMode] = useState<"card" | "timeline">("card"); // View mode
  const [mainTab, setMainTab] = useState<"wiki" | "logs" | "resources">("resources"); // Top-level tab
  const [showLoginOverlay, setShowLoginOverlay] = useState(false); // Login screen overlay state

  // ===== EFFECTS =====

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (currentUser) {
      loadLogs();
    }
  }, [currentUser, loadLogs]);

  useEffect(() => {
    if (currentUser && !selectedTab) {
      setSelectedTab(currentUser.id);
    }
    if (currentUser && currentUser.accessibleTabs) {
      const tabs = currentUser.accessibleTabs;
      if (!tabs.includes(mainTab)) {
        setMainTab(tabs[0] as "wiki" | "logs" | "resources");
      }
    }
  }, [currentUser, users, mainTab, selectedTab]);

  useEffect(() => {
    if (selectedTab) {
      let filtered = allLogs.filter((log) => log.userId === selectedTab && !log.deleted);
      if (selectedCategory !== "all") {
        filtered = filtered.filter((log) => log.category === selectedCategory);
      }
      const sorted = [...filtered].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });
      setLogs(sorted);
    }
  }, [selectedTab, allLogs, selectedCategory, sortBy]);

  // ===== EVENT HANDLERS =====

  const handleSaveLog = async (logData: Omit<DesignLog, "id"> | DesignLog, imageFile?: File | null) => {
    await saveLog(logData, imageFile);
    setEditingLog(null);
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
    await deleteLog(id);
  };

  const handleOpenDialog = () => {
    setEditingLog(null);
    setDialogOpen(true);
  };

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

  // No longer returning LoginScreen early; it will be an overlay

  return (
    <div className="min-h-screen">
      {/* Header and controls - contained */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AppHeader
          onLoginClick={() => setShowLoginOverlay(true)}
          onSupportClick={() => setUpiOpen(true)}
        />

        {/* Stats - Hidden for Guest or when loading */}
        {currentUser && currentUser.id !== "guest" && (
          <DashboardStats logs={logs} currentUser={currentUser} />
        )}

        {/* Main Tabs: Wiki and Logs */}
        <Tabs
          value={mainTab}
          onValueChange={(value) =>
            setMainTab(value as "wiki" | "logs" | "resources")
          }
          className="mb-6"
        >

          {/* Main Navigation (Visible only to Admin) */}
          {currentUser?.id === "admin" && (
            <TabsList className="mb-4">
              <TabsTrigger value="resources" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2">
                <FileText className="h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="wiki" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Wiki
              </TabsTrigger>
            </TabsList>
          )}

          {/* Wiki Tab Content */}
          <TabsContent value="wiki" className="mt-6">
            {currentUser && <Wiki currentUser={currentUser} />}
          </TabsContent>

          {/* Logs Tab Content */}
          <TabsContent value="logs" className="mt-6">
            {/* User Tabs (Enabled if user has 'users' permission or is admin) */}
            {currentUser?.id === "admin" && users.length > 0 && (
              <div className="mb-6">
                <Tabs
                  value={selectedTab}
                  onValueChange={setSelectedTab}
                >
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value={currentUser?.id || ""}>
                      Me
                    </TabsTrigger>
                    {users
                      .filter((user) => user.id !== currentUser?.id && user.id !== "newjoin")
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
      {
        mainTab === "logs" && (
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
                    onAddComment={addComment}
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
        )
      }

      <AddLogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveLog}
        editingLog={editingLog}
        availableLogs={allLogs.filter(
          (log) =>
            !log.deleted && log.userId === currentUser?.id,
        )}
      />
      <ViewLogDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        log={viewingLog}
        allLogs={allLogs}
      />
      {
        currentUser && (
          <UserSettings
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            currentUser={currentUser}
            onUpdatePin={updatePin}
            onOpenSupport={() => setUpiOpen(true)}
          />
        )
      }
      <AdminPanel
        open={adminPanelOpen}
        onOpenChange={setAdminPanelOpen}
        users={users}
        onUpdateUserPin={updateUserPin}
        onAddUser={addUser}
        onDeleteUser={deleteUser}
        onUpdateUserAccess={updateUserAccess}
      />
      <TrashDialog
        open={trashOpen}
        onOpenChange={setTrashOpen}
        deletedLogs={getDeletedLogs()}
        onRestore={restoreLog}
        onPermanentDelete={permanentDeleteLog}
      />

      <UPIDialog
        open={upiOpen}
        onOpenChange={setUpiOpen}
        vpa="8897132717@pthdfc"
        payeeName="Yamparala Rahul"
        userName={currentUser?.name || "User"}
      />

      {/* Login Overlay */}
      {
        showLoginOverlay && (
          <div className="fixed inset-0 z-[1000] bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
            <LoginScreen
              users={users}
              onLogin={(user: User) => {
                login(user);
                setShowLoginOverlay(false);
              }}
              loading={usersLoading}
              onClose={() => setShowLoginOverlay(false)}
            />
          </div>
        )
      }

      <Toaster />
      {/* Agentation Visual Feedback (Development Only) */}
      {process.env.NODE_ENV === "development" && <Agentation />}
    </div >
  );
}