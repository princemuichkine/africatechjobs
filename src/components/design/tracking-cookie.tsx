'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { t } from '@/lib/i18n/translations'

// Use a more specific key that's unlikely to be cleared
const COOKIE_CONSENT_KEY = 'suparaise-cookie-consent-status'

// Try multiple storage options
function getCookieConsentStatus() {
  try {
    // Try localStorage first
    if (typeof window !== 'undefined') {
      const localValue = localStorage.getItem(COOKIE_CONSENT_KEY)
      if (localValue) return localValue

      // If not in localStorage, try sessionStorage as fallback
      const sessionValue = sessionStorage.getItem(COOKIE_CONSENT_KEY)
      if (sessionValue) {
        // If found in session, persist to localStorage for future visits
        localStorage.setItem(COOKIE_CONSENT_KEY, sessionValue)
        return sessionValue
      }
    }
  } catch (error) {
    console.error('Error accessing storage:', error)
    // In case of error, use a fallback approach with cookies
    try {
      const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${COOKIE_CONSENT_KEY}=`))
        ?.split('=')[1]
      return cookieValue || null
    } catch {
      // Silently fail in private browsing modes
      return null
    }
  }
  return null
}

function setCookieConsentStatus(status: string) {
  try {
    // Try to use multiple storage mechanisms for redundancy
    if (typeof window !== 'undefined') {
      // Store in localStorage
      localStorage.setItem(COOKIE_CONSENT_KEY, status)

      // Also store in sessionStorage
      sessionStorage.setItem(COOKIE_CONSENT_KEY, status)

      // Set a cookie as additional backup with 365 day expiry
      const date = new Date()
      date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000)
      document.cookie = `${COOKIE_CONSENT_KEY}=${status}; expires=${date.toUTCString()}; path=/; SameSite=Lax`
    }
  } catch (error) {
    console.error('Error setting storage:', error)
    // If localStorage fails, try cookies as fallback
    try {
      const date = new Date()
      date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000)
      document.cookie = `${COOKIE_CONSENT_KEY}=${status}; expires=${date.toUTCString()}; path=/; SameSite=Lax`
    } catch {
      // Silently fail in private browsing modes
    }
  }
}

// Play a subtle click sound on user actions
const playClickSound = () => {
  if (typeof window === 'undefined') return
  try {
    const audio = new Audio('/sounds/light.mp3')
    audio.volume = 0.4
    audio.play().catch(() => {
      // Autoplay policies can reject sound; ignore silently
    })
  } catch {
    // Ignore audio creation errors
  }
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationType, setAnimationType] = useState<
    'accept' | 'decline' | null
  >(null)
  const footerRef = useRef<HTMLElement | null>(null)
  const hasCheckedConsent = useRef(false)
  const listenerAdded = useRef(false) // Keep track if listener is active

  // Memoized handler for scroll events
  const handleScroll = useCallback(() => {
    // Find the footer element within the callback to ensure it's fresh
    const footer =
      document.querySelector('footer') ||
      document.querySelector("[class*='Footer']")

    // Don't run if banner is already visible or footer isn't found
    if (!footer || hasCheckedConsent.current === false) return // Check consent flag too

    const footerRect = footer.getBoundingClientRect()
    const windowHeight = window.innerHeight

    // Show when footer is in view (or close to being in view)
    if (footerRect.top < windowHeight + 200) {
      // console.log("Showing banner due to scroll"); // Optional: for debugging
      setIsVisible(true)
      // Once shown by scroll, we don't need the listener anymore for visibility triggering
      if (listenerAdded.current) {
        window.removeEventListener('scroll', handleScroll)
        listenerAdded.current = false
        // console.log("Scroll listener removed by handleScroll");
      }
    }
  }, []) // No dependencies needed if footer is queried inside

  // Function to remove scroll listener, separated for cleanup
  const removeScrollListener = useCallback(() => {
    if (listenerAdded.current) {
      window.removeEventListener('scroll', handleScroll)
      listenerAdded.current = false
      // console.log("Scroll listener explicitly removed"); // Optional: for debugging
    }
  }, [handleScroll]) // Depends on handleScroll instance

  useEffect(() => {
    // This effect now primarily handles initial consent check and timer/listener setup
    footerRef.current =
      document.querySelector('footer') ||
      document.querySelector("[class*='Footer']")

    let consentStatus: string | null = null
    try {
      consentStatus = getCookieConsentStatus()
      // console.log("Initial consent status:", consentStatus);
    } catch (error) {
      console.error('Error checking initial consent:', error)
      consentStatus = null
    }

    hasCheckedConsent.current = true // Mark check complete

    if (consentStatus !== null) {
      // console.log("Consent already exists, banner hidden.");
      return // Exit early if consent decided
    }

    // --- Consent not found ---
    // console.log("No consent found, setting up visibility logic.");

    // Use local variable to track visibility status within this effect instance
    let shouldBeVisible = false

    // Option 1: Show after a delay
    const timerId = setTimeout(() => {
      if (!shouldBeVisible) {
        // console.log("Showing banner due to timer");
        setIsVisible(true)
        shouldBeVisible = true
        removeScrollListener() // Clean up listener
      }
    }, 3000)

    // Option 2: Show on scroll (if footer exists)
    if (footerRef.current && !listenerAdded.current) {
      // console.log("Adding scroll listener");
      window.addEventListener('scroll', handleScroll, { passive: true })
      listenerAdded.current = true
    }

    // Initial check on mount in case footer is already visible
    handleScroll()

    // Cleanup function
    return () => {
      clearTimeout(timerId)
      removeScrollListener() // Use the memoized remover
    }
    // Dependencies: handleScroll and removeScrollListener instances
  }, [handleScroll, removeScrollListener])

  const handleAccept = () => {
    playClickSound()
    setAnimationType('accept')
    setShowAnimation(true)
    removeScrollListener() // Remove listener immediately on action

    // Delay hiding the component to allow animation to complete
    setTimeout(() => {
      setCookieConsentStatus('accepted')
      setIsVisible(false)
      setShowAnimation(false)
      // Here you would typically initialize your tracking code
    }, 500) // Faster animation
  }

  const handleDecline = () => {
    playClickSound()
    setAnimationType('decline')
    setShowAnimation(true)
    removeScrollListener() // Remove listener immediately on action

    // Delay hiding the component to allow animation to complete - much faster for decline
    setTimeout(() => {
      setCookieConsentStatus('declined')
      setIsVisible(false)
      setShowAnimation(false)
    }, 300) // Very fast disappearance
  }

  // No change needed below this line for the logic fix
  if (!isVisible && !showAnimation) return null // Ensure component unmounts fully after animation

  return (
    <AnimatePresence onExitComplete={() => setShowAnimation(false)}>
      {isVisible && ( // Only render the motion.div if isVisible is true
        <motion.div
          key="cookie-consent-banner" // Add key for AnimatePresence
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-[calc(100vw-60px)] max-w-[370px] overflow-hidden flex justify-end"
            animate={{
              opacity: showAnimation && animationType === 'decline' ? 0 : 1,
              y: showAnimation && animationType === 'accept' ? 100 : 0,
            }}
            transition={{
              duration: animationType === 'accept' ? 0.5 : 0.2,
              ease: 'easeInOut',
            }}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '6px',
            }}
          >
            <motion.div className="px-4 py-3 sm:px-5 sm:py-4 relative overflow-hidden w-full">
              <motion.div>
                <p className="mb-2 sm:mb-3 text-gray-300 text-xs sm:text-sm text-left">
                  {t('tracking_cookie.message')}
                </p>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <button
                    onMouseDown={handleAccept}
                    className="text-white text-xs sm:text-sm hover:text-gray-200 transition-colors font-medium"
                  >
                    {t('tracking_cookie.accept')}
                  </button>
                  <button
                    onMouseDown={handleDecline}
                    className="text-gray-500 text-xs sm:text-sm hover:text-gray-400 transition-colors"
                  >
                    {t('tracking_cookie.decline')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
