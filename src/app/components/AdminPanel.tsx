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
}

export function AdminPanel({
  open,
  onOpenChange,
  users,
  onUpdateUserPin,
  onAddUser,
  onDeleteUser,
}: AdminPanelProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPin, setNewPin] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("");

  const handleUpdatePin = () => {
    if (editingUser && newPin.length === 4) {
      onUpdateUserPin(editingUser.id, newPin);
      setEditingUser(null);
      setNewPin("");
    }
  };

  const handleAddUser = () => {
    if (newUserName && newUserRole) {
      onAddUser(newUserName, newUserRole);
      setShowAddUser(false);
      setNewUserName("");
      setNewUserRole("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 border rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.role}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    PIN: {user.pin ? "Set (****)" : "Not set"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingUser(user);
                      setNewPin("");
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Set PIN
                  </Button>
                  {user.role !== "Admin" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        if (confirm(`Delete user ${user.name}?`)) {
                          onDeleteUser(user.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
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
