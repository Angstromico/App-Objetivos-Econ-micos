# AGENT.md — System Prompt for Coding Agent

> **Scope:** Gestor de Metas Financieras · Ionic 8 + Vue 3 + TypeScript + Pinia  
> **Read this file completely before writing a single line of code.**

---

## 1. BEHAVIORAL RULES (Non-Negotiable)

| Rule | Detail |
|------|--------|
| **Script Setup only** | Every `.vue` file MUST use `<script setup lang="ts">`. Never use Options API or `defineComponent`. |
| **Strict TypeScript** | `strict: true` is on. No `any`, no implicit types. Explicitly annotate every function signature and return type. |
| **No logic in Views** | Views (`src/views/`) are dumb renderers. Zero business logic, zero math, zero direct storage calls. |
| **No logic in Components** | Components (`src/components/`) are visual atoms. Emit events up; read props/store state down. |
| **Store owns everything** | ALL mutations, calculations, persistence calls, and computed derivations live inside `src/stores/`. |
| **No boilerplate repetition** | Extract repeated patterns into composables (`src/composables/`) or utilities (`src/core/utils/`). Never copy-paste logic blocks. |
| **Atomic commits per file** | When instructed to modify a file, output only the changed file. Do not re-emit unchanged files. |
| **Incremental output** | Respond with targeted code blocks. Label every block with the exact file path as a comment on the first line. |
| **Pinia, not Vuex** | The state library is Pinia. Never import or reference Vuex. |
| **No inline styles** | Use Ionic CSS utilities and `src/theme/variables.css`. No `style=""` attributes except for dynamic values bound via `:style`. |

---

## 2. PROJECT ARCHITECTURE

```
src/
├── core/
│   ├── db/
│   │   └── storage.ts          # Storage adapter (Capacitor Preferences / IndexedDB)
│   ├── interfaces/
│   │   └── models.ts           # ALL TypeScript interfaces & enums (single source of truth)
│   └── utils/
│       └── json-io.ts          # Export / Import JSON helpers (pure functions, no side effects)
│
├── stores/
│   └── proyectos.store.ts      # Pinia store: CRUD + computed progress + gama selection
│
├── composables/
│   └── useDragDrop.ts          # Drag-and-drop state bridge (SortableJS ↔ Pinia actions)
│
├── views/
│   ├── HomePage.vue            # Lista de Proyectos
│   └── ProyectoDetalle.vue     # Kanban/Tabs de ítems de un Proyecto
│
├── components/
│   ├── ProyectoCard.vue        # Card resumen de proyecto con barras de progreso
│   ├── ItemCard.vue            # Card de ítem con gama selector inline
│   ├── BarraProgreso.vue       # Componente visual de progress bar (meta mínima / ideal)
│   ├── GamaSelector.vue        # Botones de selección de gama de precio
│   ├── ItemModal.vue           # ion-modal para crear/editar ítem
│   └── ProyectoModal.vue       # ion-modal para crear/editar proyecto
│
├── router/
│   └── index.ts                # Rutas existentes; extender sin eliminar las actuales
│
├── theme/
│   └── variables.css           # Tokens de diseño Ionic (ya existe; extender)
│
├── App.vue                     # Root shell (ya existe)
└── main.ts                     # Entry point (ya existe; añadir .use(pinia))
```

---

## 3. TYPESCRIPT INTERFACES (Single Source of Truth)

**File: `src/core/interfaces/models.ts`**

```typescript
// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Prioridad {
  Alta = 'Alta',
  Media = 'Media',
  Baja = 'Baja',
}

export enum TipoItem {
  Obligatorio = 'Obligatorio',
  ExtraOpcional = 'ExtraOpcional',
}

export enum EstadoItem {
  Backlog = 'Backlog',
  EnProceso = 'EnProceso',
  Logrado = 'Logrado',
}

export enum Gama {
  Usada = 'Usada',
  Economica = 'Economica',
  Intermedia = 'Intermedia',
  Cara = 'Cara',
  Nueva = 'Nueva',
}

// ─── Presupuesto por Gama ────────────────────────────────────────────────────

export type PresupuestoGama = Record<Gama, number>;

// ─── Ítem Requerido ──────────────────────────────────────────────────────────

export interface ItemRequerido {
  id: string;               // UUID v4
  nombre: string;
  prioridad: Prioridad;
  tipo: TipoItem;
  estado: EstadoItem;
  yaLoTenemos: boolean;     // true → excluir del cálculo de costo pendiente
  presupuestoGama: PresupuestoGama;
  gamaSeleccionada: Gama;   // gama activa para este ítem en los cálculos
  notas?: string;
}

// ─── Proyecto ────────────────────────────────────────────────────────────────

export interface Proyecto {
  id: string;               // UUID v4
  nombre: string;
  descripcion?: string;
  monedaSimbol: string;     // ej: '$', 'Bs', '€'
  ahorroActual: number;     // dinero disponible para avanzar en la meta
  gamaGlobal: Gama;         // gama por defecto para ítems sin selección propia
  items: ItemRequerido[];
  creadoEn: string;         // ISO 8601
  actualizadoEn: string;    // ISO 8601
}

// ─── Snapshot de Exportación ─────────────────────────────────────────────────

export interface ExportSnapshot {
  version: 1;
  exportadoEn: string;      // ISO 8601
  proyectos: Proyecto[];
}

// ─── Resultados de Progreso (calculados por el store) ───────────────────────

export interface ProgresoProyecto {
  costoMinimo: number;      // suma de ítems Obligatorios no poseídos
  costoIdeal: number;       // suma de TODOS los ítems no poseídos
  porcentajeMinimo: number; // ahorroActual / costoMinimo * 100 (capped 100)
  porcentajeIdeal: number;  // ahorroActual / costoIdeal  * 100 (capped 100)
}
```

---

## 4. STORE CONTRACT (`src/stores/proyectos.store.ts`)

Use `defineStore('proyectos', () => { … })` (Setup Store syntax).

### State
```typescript
const proyectos = ref<Proyecto[]>([])
const cargando  = ref<boolean>(false)
```

### Key Computed
```typescript
// Returns ProgresoProyecto for a given proyectoId
const progresoDeProyecto = computed(() =>
  (proyectoId: string): ProgresoProyecto => { … }
)
```

### Required Actions (signatures)
```typescript
async function cargarProyectos(): Promise<void>
async function guardarProyecto(p: Proyecto): Promise<void>   // create or update
async function eliminarProyecto(id: string): Promise<void>
async function guardarItem(proyectoId: string, item: ItemRequerido): Promise<void>
async function eliminarItem(proyectoId: string, itemId: string): Promise<void>
function moverItem(proyectoId: string, itemId: string, nuevoEstado: EstadoItem): void
function setGamaItem(proyectoId: string, itemId: string, gama: Gama): void
function setGamaGlobal(proyectoId: string, gama: Gama): void
async function exportarJSON(): Promise<string>               // returns JSON string
async function importarJSON(jsonStr: string): Promise<void>  // merges or replaces
```

> **Rule:** Every action that mutates `proyectos` MUST call the storage adapter before returning. Never let state and persistence diverge.

---

## 5. STORAGE ADAPTER CONTRACT (`src/core/db/storage.ts`)

```typescript
// Thin wrapper — keeps the rest of the app storage-agnostic.
export async function storageGet<T>(key: string): Promise<T | null>
export async function storageSet<T>(key: string, value: T): Promise<void>
export async function storageRemove(key: string): Promise<void>
export async function storageClear(): Promise<void>
```

Implementation priority:
1. `@capacitor/preferences` (native on Android, localStorage fallback on web)  
2. Fall back to `localStorage` JSON if Capacitor is unavailable (SSR-safe guard)

---

## 6. DRAG & DROP INTEGRATION RULES

- Library: **SortableJS** via `vue.draggable.next` (vuedraggable for Vue 3).  
- The composable `useDragDrop` wraps the `onChange` / `onEnd` events and calls `store.moverItem(...)`.  
- **Never** let the drag library mutate the underlying `Proyecto.items` array directly. It must go through the store action.  
- On **mobile** (`ion-tabs`): dragging between columns is replaced by a long-press context-menu or an action sheet (`ion-action-sheet`) presenting state options.

---

## 7. RESPONSIVE LAYOUT STRATEGY

| Breakpoint | Layout |
|---|---|
| `≥ 768px` (tablet/desktop) | Three-column Kanban (`ion-grid` with 3 `ion-col`) |
| `< 768px` (mobile) | `ion-tabs` with one tab per estado (Backlog / En Proceso / Logrado) |

Detection: use `isPlatform('mobile')` from `@ionic/vue` — never use raw `window.innerWidth` comparisons in views.

---

## 8. CODE QUALITY CHECKLIST

Before outputting any file, verify:
- [ ] No `import` of `axios`, `fetch`, or any network call (offline-first app)
- [ ] No `console.log` in production paths (use `console.warn` only inside error-catch blocks)
- [ ] All `async` functions have `try/catch` wrapping storage operations
- [ ] `uuid` generated via `crypto.randomUUID()` (available in all targets)
- [ ] Dates stored as `new Date().toISOString()`
- [ ] Every component that receives a complex object receives it as a **typed prop**, not as a bare `ref` from the store
