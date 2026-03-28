"use client";

import { useState, useEffect } from "react";
import { Task, Domain, DOMAIN_CONFIG, EnergyLevel } from "@/types/kanban";
import { useKanbanStore } from "@/store/kanban-store";

export function TaskEditModal() {
  const tasks = useKanbanStore((s) => s.tasks);
  const editingTaskId = useKanbanStore((s) => s.editingTaskId);
  const setEditingTaskId = useKanbanStore((s) => s.setEditingTaskId);
  const updateTask = useKanbanStore((s) => s.updateTask);

  const task: Task | null = tasks.find((t) => t.id === editingTaskId) ?? null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<Domain>("work");
  const [energy, setEnergy] = useState<EnergyLevel>("high");
  const [urgency, setUrgency] = useState(false);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setDomain(task.domain);
      setEnergy(task.energy);
      setUrgency(task.urgency);
      setThinking(task.thinking);
    }
  }, [task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingTaskId(null);
    };
    if (editingTaskId) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editingTaskId, setEditingTaskId]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      domain,
      energy,
      urgency,
      thinking,
    });
    setEditingTaskId(null);
  };

  const close = () => setEditingTaskId(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={close}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl p-5 space-y-4"
        style={{
          background: "var(--surface-2)",
          outline: "1px solid var(--border-2)",
          boxShadow: "0 32px 96px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Editar tarea
          </h2>
          <button
            type="button"
            onClick={close}
            className="w-6 h-6 flex items-center justify-center rounded-md text-xs transition-colors"
            style={{ color: "var(--text-muted)", background: "var(--surface-3)" }}
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            background: "var(--surface-3)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          rows={3}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
          style={{
            background: "var(--surface-3)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />

        {/* Domain */}
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(DOMAIN_CONFIG) as Domain[]).map((d) => {
            const cfg = DOMAIN_CONFIG[d];
            const active = domain === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDomain(d)}
                className="rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all"
                style={{
                  background: active ? cfg.color + "25" : "var(--surface-3)",
                  color: active ? cfg.color : "var(--text-2)",
                  outline: active
                    ? `1px solid ${cfg.color}50`
                    : "1px solid var(--border)",
                }}
              >
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Signals */}
        <div
          className="flex items-center gap-4 text-xs px-1"
          style={{ color: "var(--text-2)" }}
        >
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={energy === "low"}
              onChange={(e) => setEnergy(e.target.checked ? "low" : "high")}
            />
            💤 baja energía
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={urgency}
              onChange={(e) => setUrgency(e.target.checked)}
            />
            🔺 urgente
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={thinking}
              onChange={(e) => setThinking(e.target.checked)}
            />
            ⭕ pensar
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={close}
            className="rounded-lg px-3 py-1.5 text-xs transition-colors"
            style={{ color: "var(--text-muted)", background: "var(--surface-3)" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="rounded-lg px-4 py-1.5 text-xs font-semibold transition-all disabled:opacity-30"
            style={{ background: "var(--text)", color: "var(--bg)" }}
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
