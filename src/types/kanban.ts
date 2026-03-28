export type Domain = "personal" | "uni" | "work" | "growth";
export type TaskState = "todo" | "doing" | "done" | "blocked";
export type EnergyLevel = "high" | "low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  domain: Domain;
  state: TaskState;
  energy: EnergyLevel;
  urgency: boolean;
  thinking: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  order: number;
}

export const DOMAIN_CONFIG: Record<
  Domain,
  { label: string; color: string; bg: string; emoji: string }
> = {
  personal: {
    label: "Personal",
    color: "#FB923C",
    bg: "bg-orange-400",
    emoji: "🟧",
  },
  uni: {
    label: "Universidad",
    color: "#60A5FA",
    bg: "bg-blue-400",
    emoji: "🟦",
  },
  work: {
    label: "Trabajo",
    color: "#4ADE80",
    bg: "bg-green-400",
    emoji: "🟩",
  },
  growth: {
    label: "Crecimiento",
    color: "#C084FC",
    bg: "bg-purple-400",
    emoji: "🟪",
  },
};

export const COLUMN_CONFIG: Record<
  TaskState,
  { accent: string; glow: string; label: string; icon: string }
> = {
  todo:    { accent: "#818CF8", glow: "#818CF815", label: "TO DO",   icon: "📋" },
  doing:   { accent: "#FBBF24", glow: "#FBBF2415", label: "DOING",   icon: "⚙️" },
  done:    { accent: "#34D399", glow: "#34D39915", label: "DONE",    icon: "✅" },
  blocked: { accent: "#FB7185", glow: "#FB718515", label: "BLOCKED", icon: "🔒" },
};

export const COLUMNS: TaskState[] = ["todo", "doing", "done", "blocked"];

export const MAX_DOING = 3;
