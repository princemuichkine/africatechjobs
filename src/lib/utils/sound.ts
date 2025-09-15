// Sound utilities to globally enable/disable UI sounds with minimal code changes.
// This installs a single runtime gate on HTMLMediaElement.play so existing
// `new Audio(...).play()` calls are respected without per-call changes.

declare global {
  interface Window {
    __suparaiseSoundEnabled?: boolean
    __suparaiseSoundGateInitialized?: boolean
    __suparaiseOriginalMediaPlay?: HTMLMediaElement['play']
  }
}

export const SOUND_STORAGE_KEY = 'suparaise-sound-enabled'

/**
 * Returns whether sound is currently enabled (defaults to true when unset).
 */
export const getSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return true
  try {
    const raw = window.localStorage.getItem(SOUND_STORAGE_KEY)
    if (raw === null) return true
    return raw === 'true'
  } catch {
    return true
  }
}

/**
 * Persists and broadcasts the sound enabled flag.
 */
export const setSoundEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(enabled))
  } catch {
    // ignore storage failures
  }
  window.__suparaiseSoundEnabled = enabled
  try {
    window.dispatchEvent(
      new CustomEvent('suparaise:sound-changed', { detail: { enabled } }),
    )
  } catch {
    // ignore
  }
}

/**
 * Installs a single, idempotent gate on HTMLMediaElement.play to honor the global mute.
 */
export const initSoundGate = (): void => {
  if (typeof window === 'undefined') return
  const w = window
  if (w.__suparaiseSoundGateInitialized) return
  w.__suparaiseSoundGateInitialized = true

  // Initialize flag from storage once
  w.__suparaiseSoundEnabled = getSoundEnabled()

  const originalPlay: HTMLMediaElement['play'] = HTMLMediaElement.prototype.play
  w.__suparaiseOriginalMediaPlay = originalPlay

  // Patch play to no-op when muted
  HTMLMediaElement.prototype.play = function patchedPlay(
    this: HTMLMediaElement,
    ...args: Parameters<HTMLMediaElement['play']>
  ): ReturnType<HTMLMediaElement['play']> {
    const enabled = w.__suparaiseSoundEnabled ?? true
    if (!enabled) {
      // Return a resolved promise to satisfy callers awaiting play()
      return Promise.resolve() as ReturnType<HTMLMediaElement['play']>
    }
    try {
      return originalPlay.apply(this, args)
    } catch {
      return Promise.resolve() as ReturnType<HTMLMediaElement['play']>
    }
  }

  // Keep runtime flag in sync across tabs and local changes
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === SOUND_STORAGE_KEY) {
      w.__suparaiseSoundEnabled = e.newValue !== 'false'
    }
  })

  window.addEventListener('suparaise:sound-changed', (e: Event) => {
    try {
      const detail = (e as CustomEvent).detail
      w.__suparaiseSoundEnabled = !!detail?.enabled
    } catch {
      // ignore
    }
  })
}
