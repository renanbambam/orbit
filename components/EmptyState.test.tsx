import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { EmptyState } from "@/components/EmptyState";

describe("EmptyState", () => {
  it("renders the title", () => {
    const { getByText } = render(<EmptyState title="No tasks found" />);
    expect(getByText("No tasks found")).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    const { getByText } = render(
      <EmptyState title="No tasks" description="Create one to get started." />,
    );
    expect(getByText("Create one to get started.")).toBeInTheDocument();
  });

  it("renders the action slot", () => {
    const { getByRole } = render(
      <EmptyState title="No tasks" action={<button>New task</button>} />,
    );
    expect(getByRole("button", { name: "New task" })).toBeInTheDocument();
  });
});
