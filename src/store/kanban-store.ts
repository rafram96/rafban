import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Task, TaskState, Domain, EnergyLevel, MAX_DOING } from "@/types/kanban";

interface KanbanStore {
  tasks: Task[];
  filter: Domain | "all";

  // UI state (not persisted)
  editingTaskId: string | null;
  addFormOpen: boolean;

  // Actions
  addTask: (
    title: string,
    domain: Domain,
    opts?: {
      description?: string;
      energy?: EnergyLevel;
      urgency?: boolean;
      thinking?: boolean;
    }
  ) => void;
  moveTask: (taskId: string, newState: TaskState) => boolean;
  updateTask: (taskId: string, updates: Partial<Omit<Task, "id">>) => void;
  deleteTask: (taskId: string) => void;
  reorderTask: (taskId: string, newOrder: number) => void;
  reorderTasks: (updates: { id: string; order: number }[]) => void;
  clearDone: () => void;
  setFilter: (filter: Domain | "all") => void;
  setEditingTaskId: (id: string | null) => void;
  setAddFormOpen: (open: boolean) => void;
}

export function selectFilteredTasksByState(
  tasks: Task[],
  filter: Domain | "all",
  state: TaskState
): Task[] {
  return tasks
    .filter((t) => t.state === state && (filter === "all" || t.domain === filter))
    .sort((a, b) => a.order - b.order);
}

export function selectDoingCount(tasks: Task[]): number {
  return tasks.filter((t) => t.state === "doing").length;
}

export function canMoveToDoing(tasks: Task[]): boolean {
  return selectDoingCount(tasks) < MAX_DOING;
}

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: "all",
      editingTaskId: null,
      addFormOpen: false,

      addTask: (title, domain, opts = {}) => {
        const now = new Date().toISOString();
        const todoTasks = get().tasks.filter((t) => t.state === "todo");
        const newTask: Task = {
          id: uuidv4(),
          title,
          description: opts.description,
          domain,
          state: "todo",
          energy: opts.energy ?? "high",
          urgency: opts.urgency ?? false,
          thinking: opts.thinking ?? false,
          createdAt: now,
          updatedAt: now,
          order: todoTasks.length,
        };
        set((s) => ({ tasks: [...s.tasks, newTask] }));
      },

      moveTask: (taskId, newState) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return false;
        if (newState === "doing" && !canMoveToDoing(get().tasks)) return false;

        const now = new Date().toISOString();
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  state: newState,
                  updatedAt: now,
                  completedAt: newState === "done" ? now : undefined,
                }
              : t
          ),
        }));
        return true;
      },

      updateTask: (taskId, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteTask: (taskId) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
      },

      reorderTask: (taskId, newOrder) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, order: newOrder, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      reorderTasks: (updates) => {
        const map = new Map(updates.map((u) => [u.id, u.order]));
        const now = new Date().toISOString();
        set((s) => ({
          tasks: s.tasks.map((t) =>
            map.has(t.id)
              ? { ...t, order: map.get(t.id)!, updatedAt: now }
              : t
          ),
        }));
      },

      clearDone: () => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.state !== "done") }));
      },

      setFilter: (filter) => set({ filter }),
      setEditingTaskId: (id) => set({ editingTaskId: id }),
      setAddFormOpen: (open) => set({ addFormOpen: open }),
    }),
    {
      name: "rafban-kanban",
      // Don't persist UI state
      partialize: (s) => ({
        tasks: s.tasks,
        filter: s.filter,
      }),
    }
  )
);
