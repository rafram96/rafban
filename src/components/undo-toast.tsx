"use client";

import { useEffect, useRef, useState } from "react";
import { useKanbanStore } from "@/store/kanban-store";

const UNDO_DURATION_MS = 6000;

export function UndoToast() {
  const lastDeleted = useKanbanStore((s) => s.lastDeleted);
  const restore = useKanbanStore((s) => s.restoreLastDeleted);
  const dismiss = useKanbanStore((s) => s.dismissUndo);

  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);

  // Countdown + auto-dismiss
  useEffect(() => {
    if (!lastDeleted) {
      setProgress(100);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.max(0, 100 - (elapsed / UNDO_DURATION_MS) * 100);
      setProgress(pct);
      if (elapsed >= UNDO_DURATION_MS) {
        dismiss();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [lastDeleted, dismiss]);

  // Cmd/Ctrl+Z to undo
  useEffect(() => {
    if (!lastDeleted) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        restore();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lastDeleted, restore]);

  if (!lastDeleted) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl overflow-hidden"
      style={{
        background: "var(--surface-2)",
        outline: "1px solid var(--border-2)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
        minWidth: 320,
        animation: "slideUp 0.18s ease",
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span style={{ fontSize: 14 }}>🗑️</span>
        <div className="flex flex-col min-w-0">
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text)" }}
          >
            Tarea eliminada
          </span>
          <span
            className="text-[11px] truncate"
            style={{ color: "var(--text-muted)", maxWidth: 220 }}
            title={lastDeleted.title}
          >
            {lastDeleted.title}
          </span>
        </div>
        <div className="flex-1" />
        <button
          onClick={restore}
          className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
          style={{ color: "var(--bg)", background: "var(--text)" }}
        >
          Deshacer
          <kbd
            className="ml-2 font-mono text-[9px] px-1 py-0.5 rounded"
            style={{
              background: "rgba(0,0,0,0.15)",
              color: "var(--bg)",
              opacity: 0.7,
            }}
          >
            ⌘Z
          </kbd>
        </button>
        <button
          onClick={dismiss}
          className="w-6 h-6 flex items-center justify-center rounded-md text-xs transition-colors"
          style={{ color: "var(--text-muted)", background: "var(--surface-3)" }}
          title="Descartar"
        >
          ✕
        </button>
      </div>
      {/* Progress bar */}
      <div style={{ height: 2, background: "var(--surface-3)" }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "var(--text-muted)",
          }}
        />
      </div>
    </div>
  );
}
