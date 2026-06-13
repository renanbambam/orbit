"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addComment } from "@/features/task/actions/add-comment.action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({ taskId }: { taskId: string }) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await addComment({ taskId, content: trimmed });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setContent("");
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Leave a comment..."
        rows={3}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSubmit} disabled={isPending || !content.trim()}>
          {isPending ? "Posting..." : "Comment"}
        </Button>
      </div>
    </div>
  );
}
