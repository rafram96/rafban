"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, DOMAIN_CONFIG } from "@/types/kanban";
import { useKanbanStore } from "@/store/kanban-store";

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const deleteTask = useKanbanStore((s) => s.deleteTask);
  const setEditingTaskId = useKanbanStore((s) => s.setEditingTaskId);
  const domainCfg = DOMAIN_CONFIG[task.domain];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className="relative rounded-xl p-3 group"
      style={{
        transform: isOverlay
          ? "rotate(1.5deg) scale(1.03)"
          : CSS.Transform.toString(transform),
        transition: isOverlay ? undefined : transition,
        background: "var(--surface-2)",
        borderLeft: `3px solid ${domainCfg.color}`,
        outline: `1px solid var(--border)`,
        boxShadow:
          isDragging || isOverlay
            ? `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${domainCfg.color}50`
            : `0 1px 3px rgba(0,0,0,0.3)`,
        opacity: isDragging && !isOverlay ? 0.4 : 1,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onClick={() => {
        if (!isDragging) setEditingTaskId(task.id);
      }}
    >
      {/* Drag handle — top strip */}
      <div
        {...listeners}
        className="absolute top-0 left-0 right-0 h-5 rounded-t-xl cursor-grab active:cursor-grabbing"
        style={{ background: "transparent" }}
        title="Arrastrar"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Signals */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
        {task.urgency && (
          <span
            title="Urgente"
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: "#FB718525", color: "#FB7185" }}
          >
            URG
          </span>
        )}
        {task.thinking && (
          <span title="Requiere pensar" style={{ fontSize: 11 }}>
            ⭕
          </span>
        )}
        <span
          title={task.energy === "high" ? "Energía alta" : "Energía baja"}
          style={{ fontSize: 11 }}
        >
          {task.energy === "high" ? "⚡" : "💤"}
        </span>
      </div>

      {/* Title */}
      <p
        className="pr-16 text-sm font-medium leading-snug"
        style={{ color: "var(--text)" }}
      >
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p
          className="mt-1 text-xs leading-relaxed line-clamp-2"
          style={{ color: "var(--text-2)" }}
        >
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-2.5 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            background: domainCfg.color + "20",
            color: domainCfg.color,
          }}
        >
          {domainCfg.emoji} {domainCfg.label}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="rounded px-1.5 py-0.5 text-xs transition-colors opacity-0 group-hover:opacity-100"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FB7185")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          title="Eliminar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
