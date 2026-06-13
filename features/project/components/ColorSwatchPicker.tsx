"use client";

import { PROJECT_COLORS } from "@/features/project/schemas/project.schemas";
import { cn } from "@/lib/utils";

export function ColorSwatchPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {PROJECT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Select color ${color}`}
          className={cn(
            "size-6 rounded-full transition-transform hover:scale-110",
            value === color && "ring-2 ring-ring ring-offset-2 ring-offset-background",
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
