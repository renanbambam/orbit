import { describe, expect, it } from "vitest";
import {
  addDependencySchema,
  createLabelSchema,
  taskFiltersSchema,
} from "@/features/task/schemas/task.schemas";

describe("createLabelSchema", () => {
  it("accepts a valid label", () => {
    const result = createLabelSchema.safeParse({
      projectId: "proj_1",
      name: "frontend",
      color: "#3b82f6",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid color", () => {
    const result = createLabelSchema.safeParse({
      projectId: "proj_1",
      name: "frontend",
      color: "blue",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = createLabelSchema.safeParse({
      projectId: "proj_1",
      name: "",
      color: "#3b82f6",
    });
    expect(result.success).toBe(false);
  });
});

describe("addDependencySchema", () => {
  it("accepts two task ids", () => {
    const result = addDependencySchema.safeParse({
      taskId: "task_1",
      blockedByTaskId: "task_2",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing blocker", () => {
    const result = addDependencySchema.safeParse({ taskId: "task_1" });
    expect(result.success).toBe(false);
  });
});

describe("taskFiltersSchema", () => {
  it("parses a label filter", () => {
    const result = taskFiltersSchema.safeParse({ labelId: "label_1" });
    expect(result.success).toBe(true);
  });

  it("ignores unknown keys", () => {
    const result = taskFiltersSchema.safeParse({ foo: "bar" });
    expect(result.success).toBe(true);
  });
});
