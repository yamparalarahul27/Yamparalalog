import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { DesignLog } from "./types";
import { Calendar, Tag, Link2, X } from "lucide-react";

interface ViewLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: DesignLog | null;
  allLogs?: DesignLog[];
}

export function ViewLogDialog({
  open,
  onOpenChange,
  log,
  allLogs = [],
}: ViewLogDialogProps) {
  if (!log) return null;

  // Get linked logs
  const linkedLogs = allLogs.filter((l) => 
    log.linkedLogIds?.includes(l.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
        {/* Hero Image */}
        <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
          {log.imageUrl ? (
            <img
              src={log.imageUrl}
              alt={log.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span className="text-lg font-medium">No Image</span>
            </div>
          )}
          
          {/* Close button overlay */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Title */}
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold text-gray-900 leading-tight">
              {log.title}
            </DialogTitle>
          </DialogHeader>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            {/* Date */}
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium">
                {new Date(log.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Category */}
            {log.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" />
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {log.category}
                </Badge>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {log.description}
            </p>
          </div>

          {/* Linked Logs */}
          {linkedLogs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-blue-600" />
                Linked Logs
              </h3>
              <div className="flex flex-wrap gap-2">
                {linkedLogs.map((linkedLog) => (
                  <Badge
                    key={linkedLog.id}
                    variant="outline"
                    className="px-3 py-1.5 text-sm bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    {linkedLog.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {log.comments && log.comments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Comments ({log.comments.length})
              </h3>
              <div className="space-y-3">
                {log.comments.map((comment, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {comment.author}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}