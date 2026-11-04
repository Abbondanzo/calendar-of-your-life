import { useEffect, useState } from 'react'

export interface Settings {
  birthday: string | null
  lifeExpectancy: number
  showStageColors: boolean
}

const KEY = 'calendar-of-your-life:v1'

export const DEFAULT_SETTINGS: Settings = {
  birthday: null,
  lifeExpectancy: 90,
  showStageColors: true,
}

function load(): Settings {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

/** Settings persisted to this browser only; nothing ever leaves the device. */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load)

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(settings))
    } catch {
      // Storage can be unavailable (private mode, blocked site data); the app still works.
    }
  }, [settings])

  const update = (patch: Partial<Settings>) =>
    setSettings((s) => ({ ...s, ...patch }))
  return [settings, update] as const
}
