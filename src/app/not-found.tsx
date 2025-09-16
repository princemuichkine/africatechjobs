'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FuzzyText } from '@/components/design/fuzzy-text'

export default function NotFound() {
  const router = useRouter()

  // Sound utility function
  const playSound = (soundFile: string) => {
    try {
      const audio = new Audio(soundFile)
      audio.volume = 0.4
      audio.play().catch(() => {
        // Silently handle audio play errors
      })
    } catch {
      // Silently handle audio loading errors
    }
  }

  const playClickSound = () => {
    playSound('/sounds/light.mp3')
  }

  const handleGoBack = () => {
    playClickSound()
    router.back()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 sm:px-6">
      <div className="max-w-2xl mx-auto w-full text-center">
        {/* Fuzzy 404 Text */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <FuzzyText
            fontSize="clamp(3rem, 15vw, 10rem)"
            fontWeight={900}
            enableHover={true}
            baseIntensity={0.15}
            hoverIntensity={0.4}
            className="text-primary"
          >
            404
          </FuzzyText>
        </div>

        {/* Help text */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 mb-6 rounded-sm bg-muted/50 border">
          <p className="text-sm text-foreground/80 max-w-lg mx-auto leading-relaxed">
            Looks like this page got lost in the fundraising process. If you
            think this is an error, please{' '}
            <a
              href="mailto:hello@suparaise.com"
              className="text-primary hover:underline font-medium"
            >
              contact our support team
            </a>{' '}
            and we&apos;ll help you out.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md mx-auto">
          <Button
            onClick={handleGoBack}
            size="lg"
            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-slate-200 dark:border-slate-800 rounded-sm px-4"
          >
            Go back
          </Button>
        </div>
      </div>
    </div>
  )
}
