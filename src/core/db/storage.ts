import { Preferences } from '@capacitor/preferences'

export async function storageGet<T>(key: string): Promise<T | null> {
  try {
    const { value } = await Preferences.get({ key })
    return value ? (JSON.parse(value) as T) : null
  } catch {
    return null
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  await Preferences.set({ key, value: JSON.stringify(value) })
}

export async function storageRemove(key: string): Promise<void> {
  await Preferences.remove({ key })
}

export async function storageClear(): Promise<void> {
  await Preferences.clear()
}
