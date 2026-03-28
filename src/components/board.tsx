"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { Task, TaskState, COLUMNS } from "@/types/kanban";
import { useKanbanStore } from "@/store/kanban-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Column } from "./column";
import { TaskCard } from "./task-card";
import { AddTaskForm } from "./add-task-form";
import { DomainFilter } from "./domain-filter";
import { TaskEditModal } from "./task-edit-modal";

export function Board() {
  const hydrated = useHydrated();
  const tasks = useKanbanStore((s) => s.tasks);
  const moveTask = useKanbanStore((s) => s.moveTask);
  const reorderTasks = useKanbanStore((s) => s.reorderTasks);
  const setAddFormOpen = useKanbanStore((s) => s.setAddFormOpen);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [wipFlash, setWipFlash] = useState(false);

  // Completed today count
  const today = new Date().toISOString().slice(0, 10);
  const completedToday = tasks.filter(
    (t) => t.completedAt && t.completedAt.startsWith(today)
  ).length;

  // Keyboard shortcut: N → open add form
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setAddFormOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setAddFormOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    const sourceTask = tasks.find((t) => t.id === taskId);
    if (!sourceTask) return;

    // Resolve target column
    let targetState: TaskState | null = null;
    if ((COLUMNS as string[]).includes(overId)) {
      targetState = overId as TaskState;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) targetState = overTask.state;
    }
    if (!targetState) return;

    if (sourceTask.state === targetState) {
      // Same column — reorder
      const columnTasks = tasks
        .filter((t) => t.state === targetState)
        .sort((a, b) => a.order - b.order);
      const oldIndex = columnTasks.findIndex((t) => t.id === taskId);
      const newIndex = columnTasks.findIndex((t) => t.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        reorderTasks(reordered.map((t, i) => ({ id: t.id, order: i })));
      }
    } else {
      // Different column — move
      const success = moveTask(taskId, targetState);
      if (!success) {
        setWipFlash(true);
        setTimeout(() => setWipFlash(false), 2500);
      }
    }
  }

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-0.5">
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--text)", letterSpacing: "-0.03em" }}
              >
                rafban
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 11 }}>
                copiloto cognitivo · presiona{" "}
                <kbd
                  className="rounded px-1 py-0.5 text-[10px] font-mono"
                  style={{ background: "var(--surface-3)", color: "var(--text-2)" }}
                >
                  N
                </kbd>{" "}
                para nueva tarea
              </p>
            </div>

            {completedToday > 0 && (
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "#34D39920", color: "#34D399" }}
              >
                ✓ {completedToday} hoy
              </span>
            )}
          </div>

          <DomainFilter />
        </div>

        {/* Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
          >
            {COLUMNS.map((colId) => (
              <div key={colId} className="flex flex-col gap-2">
                <Column id={colId} />
                {colId === "todo" && <AddTaskForm />}
              </div>
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* WIP limit toast */}
      {wipFlash && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-3 text-sm font-medium"
          style={{
            background: "#1a0f0f",
            color: "#FB7185",
            outline: "1px solid #FB718540",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          🔒 DOING lleno — termina algo primero (máx {3})
        </div>
      )}

      <TaskEditModal />
    </>
  );
}
