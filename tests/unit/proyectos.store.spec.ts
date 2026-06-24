import { describe, expect, test, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProyectosStore } from '@/stores/proyectos.store'
import { Proyecto, Gama, Prioridad, TipoItem, EstadoItem } from '@/core/interfaces/models'

// Mock for @capacitor/preferences to run tests offline/in-memory
vi.mock('@capacitor/preferences', () => {
  let mockStorage: Record<string, string> = {}
  return {
    Preferences: {
      get: vi.fn(async ({ key }: { key: string }) => {
        return { value: mockStorage[key] || null }
      }),
      set: vi.fn(async ({ key, value }: { key: string; value: string }) => {
        mockStorage[key] = value
      }),
      remove: vi.fn(async ({ key }: { key: string }) => {
        delete mockStorage[key]
      }),
      clear: vi.fn(async () => {
        mockStorage = {}
      }),
    },
  }
})

describe('Proyectos Store - Paso 2.5 (Exportar/Importar JSON)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockProyectos: Proyecto[] = [
    {
      id: 'proj-1',
      nombre: 'Comprar Laptop',
      descripcion: 'Para desarrollo de software',
      monedaSimbol: '$',
      ahorroActual: 500,
      gamaGlobal: Gama.Intermedia,
      creadoEn: '2026-06-24T12:00:00.000Z',
      actualizadoEn: '2026-06-24T12:00:00.000Z',
      items: [
        {
          id: 'item-1',
          nombre: 'RAM 16GB',
          prioridad: Prioridad.Alta,
          tipo: TipoItem.Obligatorio,
          estado: EstadoItem.Backlog,
          yaLoTenemos: false,
          gamaSeleccionada: Gama.Economica,
          presupuestoGama: {
            [Gama.Usada]: 40,
            [Gama.Economica]: 60,
            [Gama.Intermedia]: 80,
            [Gama.Cara]: 100,
            [Gama.Nueva]: 120,
          },
        },
      ],
    },
  ]

  test('debe exportar los proyectos en formato JSON válido (ExportSnapshot)', async () => {
    const store = useProyectosStore()
    store.proyectos = [...mockProyectos]

    const jsonExportado = await store.exportarJSON()
    const parsed = JSON.parse(jsonExportado)

    expect(parsed.version).toBe(1)
    expect(parsed.exportadoEn).toBeDefined()
    expect(parsed.proyectos).toHaveLength(1)
    expect(parsed.proyectos[0].nombre).toBe('Comprar Laptop')
  })

  test('debe importar proyectos de un JSON válido y persistirlos', async () => {
    const store = useProyectosStore()

    const snapshot = {
      version: 1,
      exportadoEn: new Date().toISOString(),
      proyectos: mockProyectos,
    }
    const jsonStr = JSON.stringify(snapshot)

    await store.importarJSON(jsonStr)

    expect(store.proyectos).toHaveLength(1)
    expect(store.proyectos[0].id).toBe('proj-1')
    expect(store.proyectos[0].items[0].nombre).toBe('RAM 16GB')

    // Verificar que también se cargan correctamente del storage mockeado
    const store2 = useProyectosStore()
    await store2.cargarProyectos()
    expect(store2.proyectos).toHaveLength(1)
    expect(store2.proyectos[0].nombre).toBe('Comprar Laptop')
  })

  test('debe fallar la importación si la versión del snapshot no es compatible', async () => {
    const store = useProyectosStore()
    const snapshotInvalido = {
      version: 2, // Versión no soportada
      exportadoEn: new Date().toISOString(),
      proyectos: mockProyectos,
    }
    const jsonStr = JSON.stringify(snapshotInvalido)

    await expect(store.importarJSON(jsonStr)).rejects.toThrow(
      'Versión de respaldo no soportada (Versión encontrada: 2).'
    )
  })

  test('debe fallar la importación si el JSON es corrupto o inválido', async () => {
    const store = useProyectosStore()
    const jsonCorrupto = '{ invalid json'

    await expect(store.importarJSON(jsonCorrupto)).rejects.toThrow()
  })
})
