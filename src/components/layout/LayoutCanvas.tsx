"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutNode, isLeaf } from "@/types/layout";
import { useLayoutTree } from "@/hooks/useLayoutTree";
import { LayoutBlock } from "@/components/layout/LayoutBlock";
import { createInitialTree } from "@/lib/layoutUtils";
import { ImSpinner } from "react-icons/im";

interface LayoutCanvasProps {
  initialTree?: LayoutNode | null;
}

export function LayoutCanvas({ initialTree = null }: LayoutCanvasProps) {
  const { tree, setTree, split, remove, updateRatio, resetTree } =
    useLayoutTree(createInitialTree());

  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const hasInitializedRef = useRef(false);
  const lastSavedTreeRef = useRef<string | null>(null);

  const serializedTree = useMemo(() => JSON.stringify(tree), [tree]);

  useEffect(() => {
    let isMounted = true;

    const loadLayout = async () => {
      try {
        const response = await fetch("/api/layout", {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-store",
          },
        });

        const result = await response.json();

        if (!isMounted) return;

        if (!response.ok) {
          console.error("Failed to load layout:", result);

          const fallbackTree = createInitialTree();
          setTree(fallbackTree);
          lastSavedTreeRef.current = JSON.stringify(fallbackTree);
          hasInitializedRef.current = true;
          setIsLoaded(true);
          return;
        }

        const dbTree =
          result.tree && typeof result.tree === "object"
            ? (result.tree as LayoutNode)
            : null;

        let loadedTree: LayoutNode;

        if (!dbTree) {
          loadedTree = createInitialTree();
        } else if (isLeaf(dbTree)) {
          // If only a single layout exists, refresh should generate a fresh color
          loadedTree = createInitialTree();
        } else {
          // If multiple layouts exist, preserve the saved layout
          loadedTree = dbTree;
        }

        setTree(loadedTree);
        lastSavedTreeRef.current = JSON.stringify(loadedTree);
        hasInitializedRef.current = true;
        setIsLoaded(true);
      } catch (error) {
        console.error("Layout load error:", error);

        if (!isMounted) return;

        const fallbackTree = createInitialTree();
        setTree(fallbackTree);
        lastSavedTreeRef.current = JSON.stringify(fallbackTree);
        hasInitializedRef.current = true;
        setIsLoaded(true);
      }
    };

    void loadLayout();

    return () => {
      isMounted = false;
    };
  }, [initialTree, setTree]);

  useEffect(() => {
    if (!hasInitializedRef.current || !isLoaded) return;
    if (lastSavedTreeRef.current === serializedTree) return;

    const timeout = setTimeout(async () => {
      try {
        setIsSaving(true);
        setSaveMessage(null);

        const response = await fetch("/api/layout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
          cache: "no-store",
          keepalive: true,
          body: JSON.stringify({ tree }),
        });

        const result = await response.json();

        if (!response.ok) {
          setSaveMessage(result.error ?? "Failed to save layout.");
          return;
        }

        lastSavedTreeRef.current = serializedTree;
        setSaveMessage("Saved");
      } catch (error) {
        console.error("Layout save error:", error);
        setSaveMessage("Save failed");
      } finally {
        setIsSaving(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [isLoaded, serializedTree, tree]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-sm font-medium text-slate-600">
          <ImSpinner className="animate-spin" size={46} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Split Layout Builder
          </h1>
          <p className="text-sm text-slate-500">
            Split, resize, and persist your personal layout
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="min-w-20 text-sm text-slate-500">
            {isSaving ? "Saving..." : saveMessage}
          </div>
          <button
            type="button"
            onClick={resetTree}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Reset
          </button>

          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="h-[calc(100vh-96px)] overflow-hidden rounded-xl border bg-white p-2 shadow-sm">
          <LayoutBlock
            node={tree}
            isRoot
            onSplit={split}
            onDelete={remove}
            onUpdateRatio={updateRatio}
          />
        </div>
      </div>
    </div>
  );
}
