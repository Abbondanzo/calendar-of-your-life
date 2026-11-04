import { useMemo } from 'react'
import { Onboarding } from './components/Onboarding'
import { Calendar } from './components/Calendar'
import { parseISODate } from './lib/life'
import { useSettings } from './lib/storage'
import { useTheme } from './lib/theme'

export function App() {
  const [settings, update] = useSettings()
  useTheme(settings.theme)
  const birth = useMemo(
    () => (settings.birthday ? parseISODate(settings.birthday) : null),
    [settings.birthday],
  )

  if (!birth) {
    return (
      <Onboarding
        initialValue={settings.birthday ?? ''}
        onSubmit={(birthday) => update({ birthday })}
      />
    )
  }

  return <Calendar birth={birth} settings={settings} onChange={update} />
}
