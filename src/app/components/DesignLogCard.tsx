import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Pencil, Trash2, Calendar, MessageSquare, Send, Link2 } from "lucide-react";
import { DesignLog, User } from "./types";
import { formatDate } from "@/app/utils/dateFormat";
import { useState } from "react";

interface DesignLogCardProps {
  log: DesignLog;
  onEdit: (log: DesignLog) => void;
  onDelete: (id: string) => void;
  currentUser: User;
  onAddComment: (logId: string, comment: string) => void;
  allLogs?: DesignLog[];
}

export function DesignLogCard({ log, onEdit, onDelete, currentUser, onAddComment, allLogs }: DesignLogCardProps) {
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsAddingComment(true);
    await onAddComment(log.id, newComment);
    setNewComment("");
    setIsAddingComment(false);
  };

  const isAdmin = currentUser.role === "Admin";
  const isOwnLog = log.userId === currentUser.id;
  const canAddComment = isAdmin && !isOwnLog;

  // Get linked log details
  const linkedLogs = log.linkedLogIds
    ?.map((id) => allLogs?.find((l) => l.id === id))
    .filter((l) => l && !l.deleted) as DesignLog[] | undefined;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {log.imageUrl && (
        <div className="mb-4 -mx-6 -mt-6">
          <img
            src={log.imageUrl}
            alt={log.title}
            className="w-full h-48 object-contain rounded-t-lg bg-gray-50"
          />
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold flex-1">{log.title}</h3>
        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(log)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(log.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <Calendar className="h-4 w-4" />
        <span>{formatDate(log.date)}</span>
      </div>

      {log.category && (
        <Badge variant="secondary" className="mb-3">
          {log.category}
        </Badge>
      )}

      <p className="text-gray-700 whitespace-pre-wrap">{log.description}</p>

      {/* Linked Logs Section */}
      {linkedLogs && linkedLogs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
            <Link2 className="h-4 w-4" />
            <span>Linked Logs ({linkedLogs.length})</span>
          </div>
          <div className="space-y-2">
            {linkedLogs.map((linkedLog) => (
              <div key={linkedLog.id} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-900">{linkedLog.title}</span>
                  <span className="text-xs text-blue-600">{formatDate(linkedLog.date)}</span>
                </div>
                {linkedLog.category && (
                  <Badge variant="outline" className="text-xs mb-1">
                    {linkedLog.category}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Comment (Admin Only for Other Users' Logs) */}
      {canAddComment && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Add a comment..."
              className="flex-1"
              disabled={isAddingComment}
            />
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={isAddingComment || !newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {log.comments && log.comments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
            <MessageSquare className="h-4 w-4" />
            <span>Comments ({log.comments.length})</span>
          </div>
          <div className="space-y-3">
            {log.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                  <span className="text-xs text-gray-500">{formatDate(comment.date)}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}