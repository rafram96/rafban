# 🧠 Kanban Cognitivo — Especificación del Proyecto

> No es un Trello. Es un copiloto mental.

---

## 1. Visión

Un sistema de gestión de tareas diseñado como **herramienta cognitiva**, no como lista glorificada.  
El objetivo no es "organizar tareas" sino **reducir carga mental y ayudar a decidir qué hacer ahora**.

### Principios Fundamentales

| Principio | Descripción |
|---|---|
| **Menos inputs** | Crear una tarea debe tomar < 5 segundos |
| **Restricciones útiles** | El sistema te impide malas decisiones (ej: máx 3 en DOING) |
| **Decisiones guiadas** | "¿Qué hago ahora?" basado en contexto real |
| **Cero ruido** | Todo lo importante cabe en una vista, sin scroll |

---

## 2. Arquitectura de Información

### 2.1 Layout Principal

```
┌───────────────────────────────────────────────────┐
│  🎯 FOCO DE LA SEMANA                             │
│  [Una sola tarea crítica — no se suma, se reemplaza] │
└───────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┐
│   📋 TO DO   │  ⚙️ DOING    │   ✅ DONE    │
│              │  (máx 3)    │              │
│              │             │              │
└─────────────┴─────────────┴─────────────┘

┌───────────────────────────────────────────────────┐
│  🚧 BLOQUEADO / WAITING                           │
└───────────────────────────────────────────────────┘
```

- **Scroll mínimo.** Todo lo crítico debe entrar en viewport sin desplazar.
- **Foco de la semana** siempre visible como header fijo.
- **Bloqueados** fuera del flujo principal para liberar la cabeza.

### 2.2 Columnas del Board

| Columna | Propósito | Reglas |
|---|---|---|
| **TO DO** | Backlog inmediato (no un cementerio de ideas) | Máx ~10 items visibles. Si crece → necesitas priorizar o mover a "Icebox" |
| **DOING** | Trabajo activo en este momento | **Máx 3 tarjetas. Idealmente 2.** Si hay más → multitasking → baja calidad |
| **DONE** | Trabajo completado | Visible 1–2 días. Vista "Hoy" y "Semana". Reset semanal |
| **BLOQUEADO** | Tareas que no dependen de ti | Cada item muestra razón + fecha. Alerta pasiva si pasan X días |

---

## 3. Modelo de Datos

### 3.1 Task

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  domain: Domain;
  state: TaskState;
  energy: EnergyLevel;
  urgency: boolean;       // 🔺 deadline externo real
  thinking: boolean;      // ⭕ requiere pensar / decisiones
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  order: number;          // posición dentro de la columna
}

type Domain = "uni" | "freelance" | "startup" | "learning";
type TaskState = "todo" | "doing" | "done" | "blocked";
type EnergyLevel = "high" | "low";
```

### 3.2 BlockedTask (extensión)

```typescript
interface BlockedInfo {
  taskId: string;
  reason: string;
  blockedSince: Date;
}
```

### 3.3 WeeklyFocus

```typescript
interface WeeklyFocus {
  taskId: string;
  weekStart: Date;       // lunes de la semana
}
```

### 3.4 Historial Semanal (para métricas)

```typescript
interface WeeklySnapshot {
  weekStart: Date;
  completedTasks: string[];   // task IDs
  domainDistribution: Record<Domain, number>;
  avgDoingCount: number;
  blockedDays: number;
}
```

---

## 4. Sistema Visual

### 4.1 Color = Dominio (nunca prioridad)

| Color | Dominio | Uso visual |
|---|---|---|
| 🟧 Naranja `#F97316` | Universidad (6to ciclo) | Borde izquierdo del card |
| 🟦 Azul `#3B82F6` | Freelance / Clientes (SEACE) | Borde izquierdo del card |
| 🟩 Verde `#22C55E` | Startup / Prácticas | Borde izquierdo del card |
| 🟪 Morado `#A855F7` | Aprendizaje (CV, RAG, papers) | Borde izquierdo del card |

> Si la semana tiene mucho azul → riesgo de burnout por clientes.  
> Si hay mucho morado → estás aprendiendo pero no entregando.  
> **El color te habla sin que leas nada.**

### 4.2 Iconos = Micro-señales (esquina superior derecha del card)

| Icono | Significado | Cuándo usarlo |
|---|---|---|
| 🔺 | **Urgente real** | Deadline externo, no autoimpuesto |
| ⭕ | **Requiere pensar** | Arquitectura, decisiones de diseño |
| ⚡ | **Energía alta** | Hazlo cuando estés fresco y enfocado |
| 💤 | **Energía baja** | Tarea mecánica, ideal para cuando estés cansado |

> No texto. Escaneo visual en ~200 ms.  
> Los iconos permiten elegir qué hacer **según tu estado**, no solo según la lista.

### 4.3 Tarjeta (Card) — Anatomía

```
┌──────────────────────────────┐
│ ▐ ████                   ⚡🔺 │  ← borde color (dominio) + iconos (señales)
│ │                            │
│ │  Título de la tarea        │
│ │  (descripción corta opt.)  │
│ │                            │
│ └────────────────────────────│
└──────────────────────────────┘
```

- Borde izquierdo: color del dominio (4px)
- Esquina superior derecha: iconos de señal
- Cuerpo: título (obligatorio) + descripción (opcional, colapsada)
- Sin fecha visible a menos que sea urgente
- Card compacto: ~60px de alto en estado colapsado

---

## 5. Reglas del Sistema (UX Terapéutico)

### 5.1 Límite DOING

```typescript
function canMoveToDoing(doingTasks: Task[]): boolean {
  if (doingTasks.length >= 3) {
    showHint("Demasiado contexto abierto. Termina algo primero.");
    return false;
  }
  return true;
}
```

> "Si todo es importante, nada lo es."

### 5.2 Foco Semanal — Solo Uno

```typescript
function setWeeklyFocus(newTaskId: string, current?: WeeklyFocus): void {
  if (current) {
    confirmDialog("¿Reemplazar el foco actual?");
    // No se suma. Se reemplaza.
  }
}
```

### 5.3 Bloqueados — Fuera del Flujo

- Nada bloqueado vive en TO DO ni en DOING.
- Si no depende de ti → sale del flujo → libera tu cabeza.
- Si pasan X días (configurable, default 3):
  - Badge pasivo: *"¿Sigue siendo relevante?"*

### 5.4 DONE con Memoria

- No se borra inmediato.
- Vistas: "Hoy" / "Esta Semana".
- **Efecto psicológico**: refuerza progreso, baja ansiedad, te recuerda que sí produces incluso en semanas duras.
- **Reset semanal**: foto mental del DONE → limpiar.

---

## 6. Modo Decisión (Killer Feature)

Botón fijo, arriba a la derecha:

> **"¿Qué hago ahora?"**

### Lógica

```typescript
interface SuggestionContext {
  currentHour: number;
  energy: EnergyLevel;      // toggle manual del usuario
  availableTasks: Task[];
}

function suggestTasks(ctx: SuggestionContext): Task[] {
  const candidates = ctx.availableTasks
    .filter(t => t.state === "todo")
    .sort((a, b) => {
      let score = 0;

      // Priorizar urgentes
      if (a.urgency) score -= 2;
      if (b.urgency) score += 2;

      // Matchear energía
      if (a.energy === ctx.energy) score -= 1;
      if (b.energy === ctx.energy) score += 1;

      // Si es tarde (>20h), preferir tareas de baja energía
      if (ctx.currentHour >= 20) {
        if (a.energy === "low") score -= 1;
        if (b.energy === "low") score += 1;
      }

      return score;
    });

  return candidates.slice(0, 2); // Máximo 2 sugerencias
}
```

> Te devuelve 1–2 opciones, no 10.

---

## 7. Ritual Semanal (integrado en UI)

Cada domingo/lunes, la app puede mostrar un modal suave:

### Checklist del Ritual (~10 minutos)

1. ✅ Revisar DONE → celebrar progreso
2. 🧹 Limpiar DONE (archivar)
3. 🚧 Revisar bloqueados → ¿siguen relevantes?
4. 📋 Mover máx. 3 tareas a DOING
5. 🎯 Definir FOCO DE LA SEMANA

### Pregunta clave:

> *"¿Qué 1 cosa hace que esta semana valga la pena?"*

Esa va como Foco Semanal, arriba y centrada.

---

## 8. Métricas (las que sí importan)

**No KPIs falsos. No gamificación tóxica. No rachas de 45 días.**

| Métrica | Para qué sirve |
|---|---|
| % tiempo por dominio | Detectar desbalance (mucho freelance = burnout) |
| Promedio de tasks simultáneas en DOING | ¿Estás haciendo multitasking? |
| Días promedio bloqueado | ¿Hay cuellos de botella externos? |
| Tasks completadas por semana | Tendencia, no competencia |

Vista: gráfico semanal simple. Sin leaderboards, sin estrellas, sin puntos.

---

## 9. Tech Stack

Pensado para el perfil del autor (CS, exp. con React/TS):

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend** | React + TypeScript | Stack conocido, tipado fuerte |
| **UI Components** | shadcn/ui | Componentes accesibles, personalizables, sin vendor lock-in |
| **Styling** | Tailwind CSS | Viene con shadcn, utilidades rápidas |
| **State** | Zustand | Mínimo boilerplate, performante |
| **Drag & Drop** | @dnd-kit/core | Moderno, accesible, bien mantenido |
| **DB** | SQLite (local) / PostgreSQL (si deploy) | Simple para MVP |
| **Offline-first** | IndexedDB (vía Dexie.js) | Funciona sin internet |
| **Build** | Vite | Rápido, estándar actual |

### Futuro (post-MVP)

- **RAG sobre tareas + notas**: consultar historial con lenguaje natural
- **Integración n8n**: automatizar flujos (ej: crear task desde email)
- **API REST**: para conectar con otros sistemas
- **PWA**: instalar como app nativa
- **LED inteligente (IFTTT)**: cambiar color según estado del board

---

## 10. Fases de Desarrollo

### Fase 1 — MVP (Core Board)

- [ ] Setup proyecto (Vite + React + TS + shadcn)
- [ ] Modelo de datos + Zustand store
- [ ] Board con 3 columnas (TO DO, DOING, DONE)
- [ ] Cards con color por dominio + iconos de señal
- [ ] Drag & Drop entre columnas
- [ ] Regla de límite en DOING (máx 3)
- [ ] CRUD de tareas (crear, editar, eliminar)
- [ ] Persistencia en localStorage / IndexedDB

### Fase 2 — Inteligencia

- [ ] Foco de la Semana (header fijo, solo 1)
- [ ] Sección Bloqueados con razón + fecha
- [ ] Modo Decisión: "¿Qué hago ahora?"
- [ ] Ritual Semanal (modal guiado)

### Fase 3 — Memoria y Métricas

- [ ] Historial de DONE (vista Hoy / Semana)
- [ ] Snapshots semanales
- [ ] Dashboard de métricas simples
- [ ] Export semanal (markdown o JSON)

### Fase 4 — Evolución

- [ ] Backend con PostgreSQL
- [ ] Auth (si multiusuario)
- [ ] PWA + offline
- [ ] RAG sobre historial de tareas
- [ ] Integraciones externas (n8n, IFTTT)

---

## 11. Filosofía de Diseño

```
"Este tablero no decora.
 Este tablero decide contigo."
```

- **No es un backlog infinito** → si TO DO crece sin control, el sistema te avisa.
- **No es un tracker de hábitos** → no hay rachas ni puntos.
- **No es un calendario** → no compite con Google Calendar.
- **Es un filtro cognitivo** → reduce opciones, sugiere acción, refuerza progreso.

---

*Documento vivo. Última actualización: 2026-02-06.*
