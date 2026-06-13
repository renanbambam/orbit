"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkspace } from "@/features/workspace/actions/create-workspace.action";
import {
  createWorkspaceSchema,
  type CreateWorkspaceInput,
} from "@/features/workspace/schemas/workspace.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function CreateWorkspaceForm({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "" },
  });

  function onSubmit(values: CreateWorkspaceInput) {
    startTransition(async () => {
      const result = await createWorkspace(values);
      onCreated?.();
      router.push(`/${result.slug}`);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc" autoFocus {...field} />
              </FormControl>
              <FormDescription>The shared home for your team&apos;s projects.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating..." : "Create workspace"}
        </Button>
      </form>
    </Form>
  );
}
