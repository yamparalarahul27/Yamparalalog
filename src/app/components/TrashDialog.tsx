import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { DesignLog } from "@/app/components/types";
import { Trash2, RotateCcw, Calendar, Tag } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { formatDate } from "@/app/utils/dateFormat";

interface TrashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletedLogs: DesignLog[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export function TrashDialog({
  open,
  onOpenChange,
  deletedLogs,
  onRestore,
  onPermanentDelete,
}: TrashDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Trash ({deletedLogs.length})
          </DialogTitle>
        </DialogHeader>

        {deletedLogs.length === 0 ? (
          <div className="text-center py-12">
            <Trash2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Trash is empty</h3>
            <p className="text-gray-600">
              Deleted logs will appear here and can be restored
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deletedLogs.map((log) => (
              <div
                key={log.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{log.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(log.date)}</span>
                      </div>
                      {log.category && (
                        <Badge variant="secondary" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {log.category}
                        </Badge>
                      )}
                    </div>
                    {log.deletedAt && (
                      <p className="text-xs text-red-600">
                        Deleted on: {formatDate(log.deletedAt.split("T")[0])}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onRestore(log.id)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                    <Button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to permanently delete this log? This action cannot be undone."
                          )
                        ) {
                          onPermanentDelete(log.id);
                        }
                      }}
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Forever
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 text-sm line-clamp-2">
                  {log.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}