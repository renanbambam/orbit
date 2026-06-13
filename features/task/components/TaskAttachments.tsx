"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileIcon, Trash2 } from "lucide-react";
import type { TaskDetailData } from "@/features/task/queries/get-task";
import { deleteAttachment } from "@/features/task/actions/delete-attachment.action";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskAttachments({
  taskId,
  attachments,
  canEdit,
}: {
  taskId: string;
  attachments: TaskDetailData["attachments"];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(attachmentId: string) {
    startTransition(async () => {
      const result = await deleteAttachment({ attachmentId });
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      {attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center gap-3 rounded-md border px-3 py-2"
            >
              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
              <a
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
              >
                {attachment.fileName}
              </a>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(attachment.fileSize)}
              </span>
              {canEdit ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => handleDelete(attachment.id)}
                  disabled={isPending}
                  aria-label="Delete attachment"
                >
                  <Trash2 className="size-3.5 text-muted-foreground" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {canEdit ? (
        <UploadButton
          endpoint="taskAttachment"
          input={{ taskId }}
          onClientUploadComplete={() => {
            toast.success("File uploaded");
            router.refresh();
          }}
          onUploadError={(error) => {
            toast.error(error.message);
          }}
          appearance={{
            button:
              "ut-ready:bg-primary ut-ready:text-primary-foreground ut-uploading:bg-muted h-8 w-auto px-3 text-sm",
            allowedContent: "text-xs text-muted-foreground",
          }}
        />
      ) : null}
    </div>
  );
}
