// src/components/layout/BlockToolbar.tsx

"use client";

import { SplitDirection } from "@/types/layout";

interface BlockToolbarProps {
  canDelete: boolean;
  onSplit: (direction: SplitDirection) => void;
  onDelete: () => void;
}

export function BlockToolbar({
  canDelete,
  onSplit,
  onDelete,
}: BlockToolbarProps) {
  return (
    <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-lg bg-white/80 p-2 shadow backdrop-blur">
      <button
        type="button"
        onClick={() => onSplit("horizontal")}
        className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-gray-100"
      >
        H
      </button>

      <button
        type="button"
        onClick={() => onSplit("vertical")}
        className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-gray-100"
      >
        V
      </button>

      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          −
        </button>
      )}
    </div>
  );
}