import { useState, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/services/api-client";
import { DesignLog, User } from "@/app/components/types";

export function useLogs(currentUser: User | null) {
    const [allLogs, setAllLogs] = useState<DesignLog[]>([]);
    const [loading, setLoading] = useState(false);

    const loadLogs = useCallback(async () => {
        if (!currentUser) return;
        try {
            setLoading(true);
            const fetchedLogs = await apiClient.logs.getAll();

            // Filter logs based on user role
            let filteredLogs = fetchedLogs;
            if (currentUser.id !== "admin") {
                filteredLogs = fetchedLogs.filter((log) => log.userId === currentUser.id);
            }

            const sortedLogs = filteredLogs.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setAllLogs(
                sortedLogs.map((log: DesignLog) => ({
                    ...log,
                    imageUrl: log.imageUrl,
                }))
            );
        } catch (error) {
            console.error("Error loading logs:", error);
            toast.error("Failed to load design logs");
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const saveLog = async (logData: Omit<DesignLog, "id"> | DesignLog, imageFile?: File | null) => {
        if (!currentUser) return null;
        try {
            let imageUrl = "id" in logData ? logData.imageUrl : undefined;

            if (imageFile) {
                imageUrl = await apiClient.logs.uploadImage(imageFile);
            }

            const logWithImage = {
                ...logData,
                imageUrl,
                userId: currentUser.id,
            };

            if ("id" in logData) {
                const updatedLog = await apiClient.logs.update(logWithImage as DesignLog);
                setAllLogs((prev) => prev.map((log) => (log.id === updatedLog.id ? updatedLog : log)));
                toast.success("Design log updated successfully");
                return updatedLog;
            } else {
                const newLog = await apiClient.logs.create(logWithImage);
                setAllLogs((prev) => [newLog, ...prev]);
                toast.success("Design log added successfully");
                return newLog;
            }
        } catch (error) {
            console.error("Error saving log:", error);
            toast.error("Failed to save design log");
            throw error;
        }
    };

    const deleteLog = async (id: string) => {
        try {
            // Optimistic upate
            setAllLogs((prev) => prev.filter((log) => log.id !== id));
            toast.success("Design log moved to trash");
            await apiClient.logs.delete(id);
        } catch (error) {
            console.error("Error deleting log:", error);
            toast.error("Failed to delete design log");
            loadLogs(); // Rollback
        }
    };

    const addComment = async (logId: string, commentText: string) => {
        if (!currentUser) return;
        try {
            const updatedLog = await apiClient.logs.addComment(logId, {
                text: commentText,
                author: currentUser.name,
                authorId: currentUser.id,
            });
            setAllLogs((prev) => prev.map((log) => (log.id === updatedLog.id ? updatedLog : log)));
            toast.success("Comment added successfully");
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment");
        }
    };

    const restoreLog = async (id: string) => {
        try {
            const restoredLog = await apiClient.logs.restore(id);
            setAllLogs((prev) => prev.map((log) => (log.id === restoredLog.id ? restoredLog : log)));
            toast.success("Design log restored successfully");
        } catch (error) {
            console.error("Error restoring log:", error);
            toast.error("Failed to restore design log");
        }
    };

    const permanentDeleteLog = async (id: string) => {
        try {
            await apiClient.logs.permanentDelete(id);
            setAllLogs((prev) => prev.filter((log) => log.id !== id));
            toast.success("Design log permanently deleted successfully");
        } catch (error) {
            console.error("Error permanently deleting log:", error);
            toast.error("Failed to permanently delete design log");
        }
    };

    return {
        allLogs,
        loading,
        setAllLogs,
        loadLogs,
        saveLog,
        deleteLog,
        addComment,
        restoreLog,
        permanentDeleteLog,
    };
}
