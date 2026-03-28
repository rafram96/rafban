"use client";

import { Domain, DOMAIN_CONFIG } from "@/types/kanban";
import { useKanbanStore } from "@/store/kanban-store";

export function DomainFilter() {
  const filter = useKanbanStore((s) => s.filter);
  const setFilter = useKanbanStore((s) => s.setFilter);

  const options: { key: Domain | "all"; label: string; emoji?: string; color?: string }[] = [
    { key: "all", label: "Todos" },
    ...Object.entries(DOMAIN_CONFIG).map(([key, cfg]) => ({
      key: key as Domain,
      label: cfg.label,
      emoji: cfg.emoji,
      color: cfg.color,
    })),
  ];

  return (
    <div className="flex items-center gap-1.5">
      {options.map((opt) => {
        const active = filter === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className="rounded-full px-3 py-1 text-xs font-medium transition-all"
            style={{
              background: active
                ? opt.color
                  ? opt.color + "25"
                  : "var(--surface-3)"
                : "transparent",
              color: active
                ? opt.color ?? "var(--text)"
                : "var(--text-muted)",
              outline: active
                ? opt.color
                  ? `1px solid ${opt.color}40`
                  : "1px solid var(--border-2)"
                : "1px solid transparent",
            }}
          >
            {opt.emoji && <span className="mr-1">{opt.emoji}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
