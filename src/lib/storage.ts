import { useEffect, useState } from 'react'
import {
  DEFAULT_PRINT_OPTIONS,
  normalizePrintOptions,
  type PrintOptions,
} from './print'
import { normalizeMilestones, type Milestone } from './milestones'

export type Theme = 'system' | 'light' | 'dark'

export const THEMES: readonly { id: Theme; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

export interface Settings {
  birthday: string | null
  lifeExpectancy: number
  showStageColors: boolean
  theme: Theme
  print: PrintOptions
  milestones: Milestone[]
}

const KEY = 'calendar-of-your-life:v1'

export const DEFAULT_SETTINGS: Settings = {
  birthday: null,
  lifeExpectancy: 90,
  showStageColors: true,
  theme: 'system',
  print: DEFAULT_PRINT_OPTIONS,
  milestones: [],
}

function load(): Settings {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SETTINGS
    const saved = JSON.parse(raw) as Partial<Settings>
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      theme: THEMES.some((t) => t.id === saved.theme)
        ? (saved.theme as Theme)
        : DEFAULT_SETTINGS.theme,
      print: normalizePrintOptions(saved.print),
      milestones: normalizeMilestones(saved.milestones),
    }
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
