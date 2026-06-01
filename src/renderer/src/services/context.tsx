import { createContext, useContext } from 'react'
import type { AppServices } from '@shared/appservices'

export const ServicesContext = createContext<AppServices | null>(null)

export function useServices(): AppServices {
  const ctx = useContext(ServicesContext)
  if (!ctx) throw new Error('useServices must be used within ServicesContext.Provider')
  return ctx
}
