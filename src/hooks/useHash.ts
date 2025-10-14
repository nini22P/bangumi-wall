import { useState, useEffect, useCallback } from 'react'
import type { Params } from '../types'

export function useHash(defaultParams: Params): Params {

  const getParamsFromHash = useCallback((): Params => {
    const hash = window.location.hash.slice(1)
    const hashParams = new URLSearchParams(hash)

    const username = hashParams.get('username') ?? defaultParams.username
    const subjectType = hashParams.get('subject') as Params['subjectType'] ?? defaultParams.subjectType
    const collectionType = hashParams.get('collection') as Params['collectionType'] ?? defaultParams.collectionType
    const aspectRatio = toNumber(hashParams.get('aspect')) ?? defaultParams.aspectRatio
    const rows = toNumber(hashParams.get('rows')) ?? defaultParams.rows
    const padding = toNumber(hashParams.get('padding')) ?? defaultParams.padding

    return {
      username,
      subjectType,
      collectionType,
      aspectRatio,
      rows,
      padding,
    }
  }, [defaultParams])

  const [params, setParams] = useState<Params>(getParamsFromHash)

  useEffect(() => {
    const handleHashChange = () => {
      const newParams = getParamsFromHash()
      setParams(prevParams =>
        JSON.stringify(prevParams) !== JSON.stringify(newParams) ? newParams : prevParams
      )
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [getParamsFromHash])

  return params
}

const toNumber = (value: string | null): number | null => {
  if (value === null || value.trim() === '') {
    return null
  }

  if (value.includes('/')) {
    const parts = value.split('/')

    if (parts.length === 2) {
      const numerator = parseFloat(parts[0])
      const denominator = parseFloat(parts[1])

      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator
      }
    }
  } else {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      return num
    }
  }

  return null
}