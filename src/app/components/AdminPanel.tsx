import { useState } from "react";
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
import { User } from "./types";
import { Pencil, UserPlus, Trash2 } from "lucide-react";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onUpdateUserPin: (userId: string, newPin: string) => void;
  onAddUser: (name: string, role: string) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUserAccess: (userId: string, tab: string, enabled: boolean) => void;
}

export function AdminPanel({
  open,
  onOpenChange,
  users,
  onUpdateUserPin,
  onAddUser,
  onDeleteUser,
  onUpdateUserAccess,
}: AdminPanelProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPin, setNewPin] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("");

  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  const handleUpdatePin = () => {
    if (editingUser && newPin.length === 4) {
      onUpdateUserPin(editingUser.id, newPin);
      setEditingUser(null);
      setNewPin("");
    }
  };

  const handleAddUser = () => {
    if (newUserName && newUserRole) {
      // Default new users to only have Resources access
      onAddUser(newUserName, newUserRole);
      setShowAddUser(false);
      setNewUserName("");
      setNewUserRole("");
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Admin Panel - User Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Users</h3>
            <Button
              size="sm"
              onClick={() => setShowAddUser(!showAddUser)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {showAddUser && (
            <div className="p-4 border rounded-lg space-y-3 bg-blue-50">
              <div className="space-y-2">
                <Label htmlFor="new-user-name">Name</Label>
                <Input
                  id="new-user-name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Enter user name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-role">Role</Label>
                <Input
                  id="new-user-role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  placeholder="e.g., UI Designer, Developer"
                />
              </div>
              <div className="text-xs text-gray-500">
                * New users will default to "Resources" access only. You can enable other features after creating the user.
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddUser} size="sm">
                  Add User
                </Button>
                <Button
                  onClick={() => {
                    setShowAddUser(false);
                    setNewUserName("");
                    setNewUserRole("");
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-left bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-2 font-medium">User</th>
                  <th className="p-2 font-medium">Role</th>
                  <th className="p-2 font-medium text-center">Wiki</th>
                  <th className="p-2 font-medium text-center">Logs</th>
                  <th className="p-2 font-medium text-center">Resources</th>
                  <th className="p-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="p-2">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">
                        PIN: {user.pin ? "Set (****)" : "Not set"}
                      </div>
                    </td>
                    <td className="p-2 text-gray-600">{user.role}</td>

                    {/* Feature Toggles */}
                    {["wiki", "logs", "resources"].map((feature) => {
                      const hasAccess = user.accessibleTabs?.includes(feature) ?? (user.id === "admin");
                      const isAdmin = user.id === "admin";

                      return (
                        <td key={feature} className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={hasAccess}
                            disabled={isAdmin}
                            onChange={() => {
                              onUpdateUserAccess(user.id, feature, !hasAccess);
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                          />
                        </td>
                      );
                    })}

                    <td className="p-2 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => {
                          setEditingUser(user);
                          setNewPin("");
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        PIN
                      </Button>
                      {user.id !== "admin" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm(`Delete user ${user.name}?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editingUser && (
          <div className="border-t pt-4 space-y-3">
            <Label>Set PIN for {editingUser.name}</Label>
            <Input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              maxLength={4}
              pattern="[0-9]*"
              placeholder="Enter 4-digit PIN"
              className="text-center text-xl tracking-widest"
            />
            <div className="flex gap-2">
              <Button onClick={handleUpdatePin} disabled={newPin.length !== 4}>
                Update PIN
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingUser(null);
                  setNewPin("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
