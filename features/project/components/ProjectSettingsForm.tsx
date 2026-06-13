"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ProjectDetail } from "@/features/project/queries/get-project";
import { updateProject } from "@/features/project/actions/update-project.action";
import { archiveProject } from "@/features/project/actions/archive-project.action";
import {
  updateProjectSchema,
  type UpdateProjectInput,
} from "@/features/project/schemas/project.schemas";
import { ColorSwatchPicker } from "@/features/project/components/ColorSwatchPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProjectSettingsForm({
  project,
  canArchive,
}: {
  project: ProjectDetail;
  canArchive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      projectId: project.id,
      name: project.name,
      description: project.description ?? "",
      color: project.color,
      status: project.status,
    },
  });

  function onSubmit(values: UpdateProjectInput) {
    startTransition(async () => {
      const result = await updateProject(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Project updated");
      router.refresh();
    });
  }

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveProject({ projectId: project.id });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Project archived");
      router.push(`/${result.slug}`);
    });
  }

  return (
    <div className="space-y-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
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
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Form>
      {canArchive ? (
        <div className="max-w-lg rounded-lg border border-destructive/40 p-4">
          <h2 className="font-medium">Archive project</h2>
          <p className="mb-3 mt-1 text-sm text-muted-foreground">
            Archived projects are hidden from the sidebar. Tasks are kept and can be restored later.
          </p>
          <Button variant="destructive" onClick={handleArchive} disabled={isPending}>
            Archive project
          </Button>
        </div>
      ) : null}
    </div>
  );
}
