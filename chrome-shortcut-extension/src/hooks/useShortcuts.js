import { useState, useEffect, useCallback } from 'react'
import { storageGet, storageSet } from '../lib/storage'

const STORAGE_KEY = 'shortcuts'

export function useShortcuts() {
  const [shortcuts, setShortcuts] = useState([])

  useEffect(() => {
    storageGet(STORAGE_KEY).then((data) => {
      if (Array.isArray(data)) setShortcuts(data)
    })
  }, [])

  const persist = useCallback((updated) => {
    setShortcuts(updated)
    storageSet(STORAGE_KEY, updated)
  }, [])

  const addShortcut = useCallback(
    ({ url, name, iconUrl }) => {
      const shortcut = { id: crypto.randomUUID(), url, name, iconUrl }
      persist([...shortcuts, shortcut])
    },
    [shortcuts, persist]
  )

  const removeShortcut = useCallback(
    (id) => {
      persist(shortcuts.filter((s) => s.id !== id))
    },
    [shortcuts, persist]
  )

  const reorderShortcuts = useCallback(
    (fromId, toId) => {
      const from = shortcuts.findIndex((s) => s.id === fromId)
      const to = shortcuts.findIndex((s) => s.id === toId)
      if (from === -1 || to === -1) return
      const updated = [...shortcuts]
      const [item] = updated.splice(from, 1)
      updated.splice(to, 0, item)
      persist(updated)
    },
    [shortcuts, persist]
  )

  const updateShortcut = useCallback(
    (id, { url, name, iconUrl }) => {
      persist(shortcuts.map((s) => (s.id === id ? { ...s, url, name, iconUrl } : s)))
    },
    [shortcuts, persist]
  )

  return { shortcuts, addShortcut, removeShortcut, reorderShortcuts, updateShortcut }
}
