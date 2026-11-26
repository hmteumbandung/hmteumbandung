import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { api, useAsync } from './api'
import { applyFavicon, applyTheme } from './themes'
import { demoSettings } from '@/data/demo'
import type { Settings } from './types'

const SettingsContext = createContext<Settings>(demoSettings)
const ReloadContext = createContext<() => void>(() => undefined)

/** Memuat pengaturan situs dan membagikannya ke seluruh komponen; juga menerapkan tema dan favicon. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data, reload } = useAsync(() => api.settings(), [])
  const value = data ?? demoSettings

  useEffect(() => {
    applyTheme(value.ui_theme)
    applyFavicon(value.ui_favicon_url)
  }, [value.ui_theme, value.ui_favicon_url])

  return (
    <ReloadContext.Provider value={reload}>
      <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
    </ReloadContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
/** Memuat ulang pengaturan situs (dipanggil setelah admin menyimpan). */
export const useReloadSettings = () => useContext(ReloadContext)
