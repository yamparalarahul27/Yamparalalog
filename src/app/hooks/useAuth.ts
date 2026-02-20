import { useState, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/services/api-client";
import { User } from "@/app/components/types";

export function useAuth() {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [usersLoading, setUsersLoading] = useState(true);

    const loadUsers = useCallback(async () => {
        try {
            setUsersLoading(true);
            const fetchedUsers = await apiClient.users.getAll();

            // Migration: Rename Admin role to Yamparala Rahul for better branding
            const migratedUsers = fetchedUsers.map((user) => {
                if (user.id === "admin") {
                    return {
                        ...user,
                        name: "Yamparala Rahul",
                        role: "Lead Design Engineer",
                    };
                }
                return user;
            });

            setUsers(migratedUsers);
            return migratedUsers;
        } catch (error) {
            console.error("Error loading users:", error);
            toast.error("Failed to load users");
            return null;
        } finally {
            setUsersLoading(false);
        }
    }, []);

    const login = async (user: User) => {
        // If user is setting PIN for first time (has no PIN), update it
        if (!user.pin) {
            try {
                await apiClient.users.updatePin(user.id, user.pin || "");
                setUsers(users.map(u => u.id === user.id ? { ...u, pin: user.pin } : u));
            } catch (error) {
                console.error("Error updating PIN:", error);
            }
        }
        setCurrentUser(user);
        toast.success(`Welcome, ${user.name}!`);
    };

    const logout = () => {
        setCurrentUser(null);
        toast.success("Logged out successfully");
    };

    const updatePin = async (newPin: string) => {
        if (!currentUser) return;
        try {
            await apiClient.users.updatePin(currentUser.id, newPin);
            const updatedUser = { ...currentUser, pin: newPin };
            setCurrentUser(updatedUser);
            setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
            toast.success("PIN updated successfully");
        } catch (error) {
            console.error("Error updating PIN:", error);
            toast.error("Failed to update PIN");
        }
    };

    const updateUserPin = async (userId: string, newPin: string) => {
        try {
            await apiClient.users.updatePin(userId, newPin);
            await loadUsers();
            toast.success("User PIN updated successfully");
        } catch (error) {
            console.error("Error updating user PIN:", error);
            toast.error("Failed to update user PIN");
        }
    };

    const addUser = async (name: string, role: string) => {
        try {
            await apiClient.users.create({ name, role });
            await loadUsers();
            toast.success("User added successfully");
        } catch (error) {
            console.error("Error adding user:", error);
            toast.error("Failed to add user");
        }
    };

    const updateUserAccess = async (userId: string, tab: string, enabled: boolean) => {
        try {
            const targetUser = users.find((u) => u.id === userId);
            if (!targetUser) return;

            const currentTabs = targetUser.accessibleTabs || [];
            let newTabs: string[];

            if (enabled) {
                newTabs = [...new Set([...currentTabs, tab])];
            } else {
                newTabs = currentTabs.filter((t) => t !== tab);
            }

            await apiClient.users.updateAccess(userId, newTabs);

            setUsers(
                users.map((u) =>
                    u.id === userId ? { ...u, accessibleTabs: newTabs } : u
                )
            );
            toast.success(`User access updated`);
        } catch (error) {
            console.error("Error updating user access:", error);
            toast.error("Failed to update user access");
        }
    };

    const deleteUser = async (userId: string) => {
        try {
            await apiClient.users.delete(userId);
            await loadUsers();
            toast.success("User deleted successfully");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    return {
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
    };
}
