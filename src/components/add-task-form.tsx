"use client";

import { useState } from "react";
import { Domain, DOMAIN_CONFIG, EnergyLevel } from "@/types/kanban";
import { useKanbanStore } from "@/store/kanban-store";

export function AddTaskForm() {
  const addTask = useKanbanStore((s) => s.addTask);
  const open = useKanbanStore((s) => s.addFormOpen);
  const setOpen = useKanbanStore((s) => s.setAddFormOpen);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<Domain>("work");
  const [energy, setEnergy] = useState<EnergyLevel>("high");
  const [urgency, setUrgency] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [showDesc, setShowDesc] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setUrgency(false);
    setThinking(false);
    setEnergy("high");
    setShowDesc(false);
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), domain, {
      description: description.trim() || undefined,
      energy,
      urgency,
      thinking,
    });
    reset();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-2 text-sm transition-all"
        style={{
          border: "1px dashed var(--border-2)",
          color: "var(--text-muted)",
          background: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--text-muted)";
          e.currentTarget.style.color = "var(--text-2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-2)";
          e.currentTarget.style.color = "var(--text-muted)";
        }}
      >
        + nueva tarea
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-3 space-y-3"
      style={{
        background: "var(--surface-2)",
        outline: "1px solid var(--border)",
      }}
    >
      {/* Title */}
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && reset()}
        placeholder="¿Qué necesitas hacer?"
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={{
          background: "var(--surface-3)",
          color: "var(--text)",
          border: "1px solid var(--border)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />

      {/* Description toggle */}
      {!showDesc ? (
        <button
          type="button"
          onClick={() => setShowDesc(true)}
          className="text-xs transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          + añadir descripción
        </button>
      ) : (
        <textarea
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          rows={2}
          className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-none"
          style={{
            background: "var(--surface-3)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      )}

      {/* Domain selector */}
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
        className="flex items-center gap-3 text-xs px-1"
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
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg px-3 py-1.5 text-xs transition-colors"
          style={{ color: "var(--text-muted)", background: "var(--surface-3)" }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-lg px-4 py-1.5 text-xs font-semibold disabled:opacity-30"
          style={{ background: "var(--text)", color: "var(--bg)" }}
        >
          Crear
        </button>
      </div>
    </form>
  );
}
