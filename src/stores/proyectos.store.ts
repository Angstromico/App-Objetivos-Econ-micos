import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Proyecto, ItemRequerido, EstadoItem, Gama, ProgresoProyecto, TipoItem } from '@/core/interfaces/models'
import { storageGet, storageSet } from '@/core/db/storage'
import { serializarSnapshot, deserializarSnapshot } from '@/core/utils/json-io'

export const useProyectosStore = defineStore('proyectos', () => {
  const proyectos = ref<Proyecto[]>([])
  const cargando = ref<boolean>(false)

  const progresoDeProyecto = computed(() => (proyectoId: string): ProgresoProyecto => {
    const proyecto = proyectos.value.find(p => p.id === proyectoId)
    if (!proyecto) return { costoMinimo: 0, costoIdeal: 0, porcentajeMinimo: 0, porcentajeIdeal: 0 }

    const itemsPendientes = proyecto.items.filter(i => !i.yaLoTenemos && i.estado !== EstadoItem.Logrado)

    const costoMinimo = itemsPendientes
      .filter(i => i.tipo === TipoItem.Obligatorio)
      .reduce((sum, i) => {
        const gama = i.gamaSeleccionada
        return sum + (i.presupuestoGama[gama] || 0)
      }, 0)

    const costoIdeal = itemsPendientes
      .reduce((sum, i) => {
        const gama = i.gamaSeleccionada
        return sum + (i.presupuestoGama[gama] || 0)
      }, 0)

    return {
      costoMinimo,
      costoIdeal,
      porcentajeMinimo: costoMinimo > 0 ? Math.min(100, (proyecto.ahorroActual / costoMinimo) * 100) : 100,
      porcentajeIdeal:  costoIdeal  > 0 ? Math.min(100, (proyecto.ahorroActual / costoIdeal)  * 100) : 100,
    }
  })

  async function cargarProyectos(): Promise<void> {
    cargando.value = true
    try {
      const data = await storageGet<Proyecto[]>('proyectos_v1')
      proyectos.value = data || []
    } catch {
      proyectos.value = []
    } finally {
      cargando.value = false
    }
  }

  async function guardarProyecto(p: Proyecto): Promise<void> {
    const index = proyectos.value.findIndex(proj => proj.id === p.id)
    if (index >= 0) {
      proyectos.value[index] = p
    } else {
      proyectos.value.push(p)
    }
    await storageSet('proyectos_v1', proyectos.value)
  }

  async function eliminarProyecto(id: string): Promise<void> {
    proyectos.value = proyectos.value.filter(proj => proj.id !== id)
    await storageSet('proyectos_v1', proyectos.value)
  }

  async function guardarItem(proyectoId: string, item: ItemRequerido): Promise<void> {
    const proyecto = proyectos.value.find(p => p.id === proyectoId)
    if (proyecto) {
      const index = proyecto.items.findIndex(i => i.id === item.id)
      if (index >= 0) {
        proyecto.items[index] = item
      } else {
        proyecto.items.push(item)
      }
      proyecto.actualizadoEn = new Date().toISOString()
      await storageSet('proyectos_v1', proyectos.value)
    }
  }

  async function eliminarItem(proyectoId: string, itemId: string): Promise<void> {
    const proyecto = proyectos.value.find(p => p.id === proyectoId)
    if (proyecto) {
      proyecto.items = proyecto.items.filter(i => i.id !== itemId)
      proyecto.actualizadoEn = new Date().toISOString()
      await storageSet('proyectos_v1', proyectos.value)
    }
  }

  function moverItem(proyectoId: string, itemId: string, nuevoEstado: EstadoItem): void {
    const proyecto = proyectos.value.find(p => p.id === proyectoId)
    if (proyecto) {
      const item = proyecto.items.find(i => i.id === itemId)
      if (item) {
        item.estado = nuevoEstado
        proyecto.actualizadoEn = new Date().toISOString()
        void storageSet('proyectos_v1', proyectos.value)
      }
    }
  }

  function setGamaItem(proyectoId: string, itemId: string, gama: Gama): void {
    const proyecto = proyectos.value.find(p => p.id === proyectoId)
    if (proyecto) {
      const item = proyecto.items.find(i => i.id === itemId)
      if (item) {
        item.gamaSeleccionada = gama
        proyecto.actualizadoEn = new Date().toISOString()
        void storageSet('proyectos_v1', proyectos.value)
      }
    }
  }

  function setGamaGlobal(proyectoId: string, gama: Gama): void {
    const proyecto = proyectos.value.find(p => p.id === proyectoId)
    if (proyecto) {
      proyecto.gamaGlobal = gama
      proyecto.actualizadoEn = new Date().toISOString()
      void storageSet('proyectos_v1', proyectos.value)
    }
  }

  async function exportarJSON(): Promise<string> {
    return serializarSnapshot(proyectos.value)
  }

  async function importarJSON(jsonStr: string): Promise<void> {
    const nuevosProyectos = deserializarSnapshot(jsonStr)
    proyectos.value = nuevosProyectos
    await storageSet('proyectos_v1', proyectos.value)
  }

  return {
    proyectos,
    cargando,
    progresoDeProyecto,
    cargarProyectos,
    guardarProyecto,
    eliminarProyecto,
    guardarItem,
    eliminarItem,
    moverItem,
    setGamaItem,
    setGamaGlobal,
    exportarJSON,
    importarJSON,
  }
})
