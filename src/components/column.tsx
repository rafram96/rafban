"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskState, MAX_DOING, COLUMN_CONFIG } from "@/types/kanban";
import { useKanbanStore } from "@/store/kanban-store";
import { TaskCard } from "./task-card";

interface ColumnProps {
  id: TaskState;
}

export function Column({ id }: ColumnProps) {
  const { allTasks, filter, clearDone } = useKanbanStore(
    useShallow((s) => ({ allTasks: s.tasks, filter: s.filter, clearDone: s.clearDone }))
  );

  const tasks = useMemo(() => {
    return allTasks
      .filter((t) => t.state === id && (filter === "all" || t.domain === filter))
      .sort((a, b) => a.order - b.order);
  }, [allTasks, filter, id]);

  const doingCount = useMemo(
    () => allTasks.filter((t) => t.state === "doing").length,
    [allTasks]
  );

  // Completed today (for DONE column badge)
  const completedTodayInDone = useMemo(() => {
    if (id !== "done") return 0;
    const today = new Date().toISOString().slice(0, 10);
    return allTasks.filter(
      (t) => t.state === "done" && t.completedAt?.startsWith(today)
    ).length;
  }, [allTasks, id]);

  const { setNodeRef, isOver } = useDroppable({ id });

  const cfg = COLUMN_CONFIG[id];
  const isDoingFull = id === "doing" && doingCount >= MAX_DOING;
  const isOverBlocked = isOver && isDoingFull;
  const isOverOk = isOver && !isDoingFull;

  return (
    <div className="flex flex-col" style={{ minWidth: 0 }}>
      {/* Column header */}
      <div
        className="flex items-center justify-between mb-2 px-1 pb-2"
        style={{ borderBottom: `1px solid var(--border)` }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 14 }}>{cfg.icon}</span>
          <span
            className="text-xs font-bold uppercase"
            style={{ color: cfg.accent, letterSpacing: "0.08em" }}
          >
            {cfg.label}
          </span>
          <span
            className="flex items-center justify-center rounded-full text-[10px] font-semibold"
            style={{
              width: 18,
              height: 18,
              background: cfg.accent + "20",
              color: cfg.accent,
            }}
          >
            {tasks.length}
          </span>
          {id === "done" && completedTodayInDone > 0 && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: "#34D39915", color: "#34D399" }}
            >
              +{completedTodayInDone} hoy
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {id === "doing" && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: isDoingFull ? "#FB718520" : "var(--surface-3)",
                color: isDoingFull ? "#FB7185" : "var(--text-muted)",
              }}
            >
              {doingCount}/{MAX_DOING}
            </span>
          )}

          {id === "done" && tasks.length > 0 && (
            <button
              onClick={clearDone}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium transition-all"
              style={{ color: "var(--text-muted)", background: "var(--surface-3)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FB7185";
                e.currentTarget.style.background = "#FB718515";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.background = "var(--surface-3)";
              }}
              title="Limpiar completadas"
            >
              limpiar
            </button>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex-1 rounded-xl p-2 space-y-2 transition-all"
        style={{
          minHeight: 120,
          background: isOverBlocked
            ? "#FB718508"
            : isOverOk
            ? cfg.glow
            : "var(--surface)",
          outline: isOverBlocked
            ? "1px solid #FB718540"
            : isOverOk
            ? `1px solid ${cfg.accent}40`
            : "1px solid var(--border)",
        }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            className="flex items-center justify-center"
            style={{ height: 80, fontSize: 12, color: "var(--text-muted)" }}
          >
            {id === "done"
              ? "Completa algo 💪"
              : id === "blocked"
              ? "Sin bloqueos 👍"
              : "Arrastra aquí"}
          </div>
        )}

        {isOverBlocked && (
          <p
            className="text-center text-xs font-medium py-1"
            style={{ color: "#FB7185" }}
          >
            Máx {MAX_DOING} tareas activas.
          </p>
        )}
      </div>
    </div>
  );
}
