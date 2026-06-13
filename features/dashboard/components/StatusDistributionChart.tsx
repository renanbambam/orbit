"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TaskStatus } from "@prisma/client";

const STATUS_COLORS: Record<TaskStatus, string> = {
  BACKLOG: "#9ca3af",
  TODO: "#3b82f6",
  IN_PROGRESS: "#a855f7",
  IN_REVIEW: "#f59e0b",
  DONE: "#22c55e",
  CANCELLED: "#f87171",
};

export function StatusDistributionChart({
  data,
}: {
  data: { status: TaskStatus; label: string; count: number }[];
}) {
  const filled = data.filter((entry) => entry.count > 0);

  if (filled.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No tasks yet
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filled}
            dataKey="count"
            nameKey="label"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {filled.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              borderColor: "var(--border)",
              borderRadius: 8,
              color: "var(--popover-foreground)",
              fontSize: 12,
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
