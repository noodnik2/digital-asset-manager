import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { ServicesContext, useServices } from './context'
import type { AppServices } from '@shared/appservices'

const fakeServices = {} as AppServices

describe('useServices', () => {
  it('throws when used outside ServicesContext.Provider', () => {
    expect(() => renderHook(() => useServices())).toThrow(
      'useServices must be used within ServicesContext.Provider',
    )
  })

  it('returns the injected services when inside provider', () => {
    const { result } = renderHook(() => useServices(), {
      wrapper: ({ children }) => (
        <ServicesContext.Provider value={fakeServices}>
          {children}
        </ServicesContext.Provider>
      ),
    })
    expect(result.current).toBe(fakeServices)
  })
})
