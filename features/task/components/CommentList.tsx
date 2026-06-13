"use client";

import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { TaskDetailData } from "@/features/task/queries/get-task";
import { deleteComment } from "@/features/task/actions/delete-comment.action";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";

export function CommentList({
  comments,
  currentUserId,
  canModerate,
}: {
  comments: TaskDetailData["comments"];
  currentUserId: string;
  canModerate: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(commentId: string) {
    startTransition(async () => {
      const result = await deleteComment({ commentId });
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => {
        const canDelete = canModerate || comment.author.id === currentUserId;
        return (
          <li key={comment.id} className="flex gap-3">
            <UserAvatar name={comment.author.name} image={comment.author.image} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </span>
                {canDelete ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto size-6"
                    onClick={() => handleDelete(comment.id)}
                    disabled={isPending}
                    aria-label="Delete comment"
                  >
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </Button>
                ) : null}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{comment.content}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
