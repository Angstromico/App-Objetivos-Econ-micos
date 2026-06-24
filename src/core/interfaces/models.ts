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

export type PresupuestoGama = Record<Gama, number>

// ─── Ítem Requerido ──────────────────────────────────────────────────────────

export interface ItemRequerido {
  id: string // UUID v4
  nombre: string
  prioridad: Prioridad
  tipo: TipoItem
  estado: EstadoItem
  yaLoTenemos: boolean // true → excluir del cálculo de costo pendiente
  presupuestoGama: PresupuestoGama
  gamaSeleccionada: Gama // gama activa para este ítem en los cálculos
  notas?: string
}

// ─── Proyecto ────────────────────────────────────────────────────────────────

export interface Proyecto {
  id: string // UUID v4
  nombre: string
  descripcion?: string
  monedaSimbol: string // ej: '$', 'Bs', '€'
  ahorroActual: number // dinero disponible para avanzar en la meta
  gamaGlobal: Gama // gama por defecto para ítems sin selección propia
  items: ItemRequerido[]
  creadoEn: string // ISO 8601
  actualizadoEn: string // ISO 8601
}

// ─── Snapshot de Exportación ─────────────────────────────────────────────────

export interface ExportSnapshot {
  version: 1
  exportadoEn: string // ISO 8601
  proyectos: Proyecto[]
}

// ─── Resultados de Progreso (calculados por el store) ───────────────────────

export interface ProgresoProyecto {
  costoMinimo: number // suma de ítems Obligatorios no poseídos
  costoIdeal: number // suma de TODOS los ítems no poseídos
  porcentajeMinimo: number // ahorroActual / costoMinimo * 100 (capped 100)
  porcentajeIdeal: number // ahorroActual / costoIdeal  * 100 (capped 100)
}
