import { Proyecto, ExportSnapshot } from '../interfaces/models'

/**
 * Convierte un array de proyectos en un string JSON formateado como ExportSnapshot.
 * @param proyectos Lista de proyectos a exportar.
 * @returns String JSON compatible con el formato de respaldo de la app.
 */
export function serializarSnapshot(proyectos: Proyecto[]): string {
  const snapshot: ExportSnapshot = {
    version: 1,
    exportadoEn: new Date().toISOString(),
    proyectos: proyectos,
  }
  return JSON.stringify(snapshot, null, 2)
}

/**
 * Valida un string JSON y lo convierte en un array de proyectos.
 * @param json String JSON a deserializar.
 * @returns Array de proyectos si el formato y la versión son correctos.
 * @throws Error si el JSON es inválido o la versión no es soportada.
 */
export function deserializarSnapshot(json: string): Proyecto[] {
  try {
    const parsed = JSON.parse(json) as ExportSnapshot

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('El archivo proporcionado no es un JSON válido.')
    }

    if (parsed.version !== 1) {
      throw new Error(`Versión de respaldo no soportada (Versión encontrada: ${parsed.version}).`)
    }

    if (!Array.isArray(parsed.proyectos)) {
      throw new Error('El formato del archivo de respaldo es incorrecto: falta la lista de proyectos.')
    }

    return parsed.proyectos
  } catch (e) {
    if (e instanceof Error) {
      throw e
    }
    throw new Error('Error inesperado al procesar el archivo de respaldo.')
  }
}
