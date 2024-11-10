import { useEffect } from 'react'

type ShortcutHandler = () => void
type Shortcut = {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  handler: ShortcutHandler
  description: string
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't trigger shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()
        const ctrlMatch = !!shortcut.ctrl === event.ctrlKey
        const altMatch = !!shortcut.alt === event.altKey
        const shiftMatch = !!shortcut.shift === event.shiftKey
        return keyMatch && ctrlMatch && altMatch && shiftMatch
      })

      if (matchingShortcut) {
        event.preventDefault()
        matchingShortcut.handler()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])

  // Return list of shortcuts for help display
  return shortcuts.map(shortcut => {
    const keys = []
    if (shortcut.ctrl) keys.push('Ctrl')
    if (shortcut.alt) keys.push('Alt')
    if (shortcut.shift) keys.push('Shift')
    keys.push(shortcut.key.toUpperCase())

    return {
      keys: keys.join('+'),
      description: shortcut.description
    }
  })
}
