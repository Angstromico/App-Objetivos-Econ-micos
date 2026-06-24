import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Proyecto, ItemRequerido, EstadoItem, Gama } from '@/core/interfaces/models'
import { storageGet, storageSet } from '@/core/db/storage'

export const useProyectosStore = defineStore('proyectos', () => {
  // State
  const proyectos = ref<Proyecto[]>([])
  const cargando = ref<boolean>(false)

  const STORAGE_KEY = 'proyectos_v1'

  /**
   * Carga los proyectos persistidos en el storage local.
   */
  async function cargarProyectos(): Promise<void> {
    cargando.value = true
    try {
      const data = await storageGet<Proyecto[]>(STORAGE_KEY)
      if (data) {
        proyectos.value = data
      }
    } catch (error) {
      console.warn('Error cargando proyectos desde storage:', error)
    } finally {
      cargando.value = false
    }
  }

  /**
   * Crea o actualiza un proyecto.
   */
  async function guardarProyecto(proyecto: Proyecto): Promise<void> {
    const index = proyectos.value.findIndex(p => p.id === proyecto.id)
    if (index >= 0) {
      proyectos.value[index] = proyecto
    } else {
      proyectos.value.push(proyecto)
    }
    await storageSet(STORAGE_KEY, proyectos.value)
  }

  /**
   * Elimina un proyecto por su ID.
   */
  async function eliminarProyecto(id: string): Promise<void> {
    proyectos.value = proyectos.value.filter(p => p.id !== id)
    await storageSet(STORAGE_KEY, proyectos.value)
  }

  /**
   * Crea o actualiza un ítem dentro de un proyecto.
   */
  async function guardarItem(proyectoId: string, item: ItemRequerido): Promise<void> {
    const proyecto = proyectos.value.find(p => p.id === proyectoId)
    if (!proyecto) {
      throw new Error(`Proyecto con ID ${proyectoId} no encontrado.`)
    }

    const itemIndex = proyecto.items.findIndex(i => i.id === item.id)
    if (itemIndex >= 0) {
      proyecto.items[itemIndex] = item
    } else {
      proyecto.items.push(item)
    }
    await storageSet(STORAGE_KEY, proyectos.value)
  }

  /**
   * Elimina un ítem de un proyecto.
   */
  async function eliminarItem(proyectoId: string, itemId: string): Promise<void> {
    const proyecto = proyectos.value.find(p => p.id === proyectoId)
    if (!proyecto) {
      throw new Error(`Proyecto con ID ${proyectoId} no encontrado.`)
    }

    proyecto.items = proyecto.items.filter(i => i.id !== itemId)
    await storageSet(STORAGE_KEY, proyectos.value)
  }

  /**
   * Cambia el estado de un ítem (para Kanban/Tabs).
   */
  async function moverItem(proyectoId: string, itemId: string, nuevoEstado: EstadoItem): Promise<void> {
    const proyecto = proyectos.value.find(p => p.id === proyectoId)
    const item = proyecto?.items.find(i => i.id === itemId)

    if (!item) {
      throw new Error(`Ítem con ID ${itemId} no encontrado en el proyecto ${proyectoId}.`)
    }

    item.estado = nuevoEstado
    await storageSet(STORAGE_KEY, proyectos.value)
  }

  /**
   * Actualiza la gama seleccionada para un ítem específico.
   */
  async function setGamaItem(proyectoId: string, itemId: string, gama: Gama): Promise<void> {
    const proyecto = proyectos.value.find(p => p.id === proyectoId)
    const item = proyecto?.items.find(i => i.id === itemId)

    if (!item) {
      throw new Error(`Ítem con ID ${itemId} no encontrado en el proyecto ${proyectoId}.`)
    }

    item.gamaSeleccionada = gama
    await storageSet(STORAGE_KEY, proyectos.value)
  }

  /**
   * Actualiza la gama global de un proyecto.
   */
  async function setGamaGlobal(proyectoId: string, gama: Gama): Promise<void> {
    const proyecto = proyectos.value.find(p => p.id === proyectoId)
    if (!proyecto) {
      throw new Error(`Proyecto con ID ${proyectoId} no encontrado.`)
    }

    proyecto.gamaGlobal = gama
    await storageSet(STORAGE_KEY, proyectos.value)
  }

  return {
    proyectos,
    cargando,
    cargarProyectos,
    guardarProyecto,
    eliminarProyecto,
    guardarItem,
    eliminarItem,
    moverItem,
    setGamaItem,
    setGamaGlobal,
  }
})
