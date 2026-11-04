import { useEffect } from 'react'
import type { Theme } from './storage'

/** Page background per resolved theme; mirrors `--bg` in app.css. */
const THEME_COLORS = { light: '#fbf6ee', dark: '#141513' } as const

const darkQuery = () => window.matchMedia?.('(prefers-color-scheme: dark)')

/**
 * Applies the chosen theme to the document. `system` leaves `data-theme` off so
 * the stylesheet follows the OS setting; light and dark pin it. The browser's
 * theme color (address bar on mobile) tracks whichever theme is showing.
 */
export function useTheme(theme: Theme) {
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme

    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    )
    const query = darkQuery()
    const sync = () => {
      const dark = theme === 'dark' || (theme === 'system' && query?.matches)
      meta?.setAttribute('content', THEME_COLORS[dark ? 'dark' : 'light'])
    }
    sync()
    if (theme !== 'system' || !query) return
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [theme])
}
