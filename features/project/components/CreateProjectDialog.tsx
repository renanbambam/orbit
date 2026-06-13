"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createProject } from "@/features/project/actions/create-project.action";
import {
  createProjectSchema,
  PROJECT_COLORS,
  type CreateProjectInput,
} from "@/features/project/schemas/project.schemas";
import { ColorSwatchPicker } from "@/features/project/components/ColorSwatchPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function deriveIdentifier(name: string) {
  const letters = name.replace(/[^a-zA-Z\s]/g, "").trim();
  const initials = letters
    .split(/\s+/)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 6);
  if (initials.length >= 2) return initials;
  return letters.replace(/\s/g, "").toUpperCase().slice(0, 3);
}

export function CreateProjectDialog({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      workspaceId,
      name: "",
      identifier: "",
      description: "",
      color: PROJECT_COLORS[0],
    },
  });

  function handleNameChange(name: string) {
    if (!form.getFieldState("identifier").isDirty) {
      form.setValue("identifier", deriveIdentifier(name));
    }
  }

  function onSubmit(values: CreateProjectInput) {
    startTransition(async () => {
      const result = await createProject(values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      form.reset();
      router.push(`/${result.slug}/${result.identifier}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
          aria-label="Create project"
        >
          <Plus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Projects group related tasks together.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Website redesign"
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        handleNameChange(event.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identifier</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="WEB"
                      {...field}
                      onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>Used in task IDs, like WEB-42.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is this project about?" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <ColorSwatchPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create project"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
