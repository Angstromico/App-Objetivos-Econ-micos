import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Proyecto } from '@/core/interfaces/models'
import { storageGet } from '@/core/db/storage'

export const useProyectosStore = defineStore('proyectos', () => {
  // State
  const proyectos = ref<Proyecto[]>([])
  const cargando = ref<boolean>(false)

  /**
   * Carga los proyectos persistidos en el storage local.
   * Clave utilizada: 'proyectos_v1'
   */
  async function cargarProyectos(): Promise<void> {
    cargando.value = true
    try {
      const data = await storageGet<Proyecto[]>('proyectos_v1')
      if (data) {
        proyectos.value = data
      }
    } catch (error) {
      console.warn('Error cargando proyectos desde storage:', error)
    } finally {
      cargando.value = false
    }
  }

  return {
    proyectos,
    cargando,
    cargarProyectos,
  }
})
