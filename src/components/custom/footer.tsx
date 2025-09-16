'use client'

import React from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { XIcon } from '@/components/icons/XIcon'
import { GitHubIcon } from '@/components/icons/GitHubIcon'
import { LottieIcon } from '@/components/design/lottie-icon'
import { BackgroundText } from '@/components/design/background-text'
import { animateThemeSweep } from '@/lib/utils/theme-transition'
import { animations } from '@/lib/utils/lottie-animations'
import { getSoundEnabled, setSoundEnabled } from '@/lib/utils/sound'

export const Footer = () => {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [soundEnabled, setSoundEnabledState] = React.useState<boolean>(true)

    React.useEffect(() => {
        setMounted(true)
        // Initialize sound state from storage
        try {
            setSoundEnabledState(getSoundEnabled())
        } catch { }
    }, [])

    const playClickSound = () => {
        if (typeof window !== 'undefined') {
            const audio = new Audio('/sounds/light.mp3')
            audio.volume = 0.4
            audio.play().catch(() => {
                // Silently handle audio play errors (autoplay policies, etc.)
            })
        }
    }

    const toggleTheme = () => {
        playClickSound()
        const next = (theme === 'dark' ? 'light' : 'dark') as 'light' | 'dark'
        animateThemeSweep(next, () => setTheme(next))
    }

    const toggleSound = () => {
        const next = !soundEnabled
        setSoundEnabledState(next)
        setSoundEnabled(next)
        // Provide immediate audio feedback when turning sound on
        if (next && typeof window !== 'undefined') {
            try {
                const audio = new Audio('/sounds/light.mp3')
                audio.volume = 0.4
                void audio.play()
            } catch { }
        }
    }

    return (
        <footer className="border-t bg-background rounded-sm select-none">
            <div className="mx-auto max-w-5xl px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 sm:items-center">
                        <Link
                            href="/privacy"
                            prefetch={true}
                            onClick={playClickSound}
                            className="text-sm text-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent px-2 py-1.5 rounded-sm transition-colors"
                        >
                            Privacy
                        </Link>
                        <span className="hidden sm:inline text-foreground/80">|</span>
                        <Link
                            href="/terms"
                            prefetch={true}
                            onClick={playClickSound}
                            className="text-sm text-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent px-2 py-1.5 rounded-sm transition-colors"
                        >
                            Terms
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="https://x.com/bm_diop"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={playClickSound}
                            className="text-black dark:text-white hover:text-[#000000] dark:hover:text-[#FFFFFF] transition-colors"
                            aria-label="Follow us on X"
                        >
                            <XIcon className="h-5 w-5" />
                        </Link>
                        <Link
                            href="https://github.com/princemuichkine"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={playClickSound}
                            className="text-black dark:text-white hover:text-[#6f42c1] dark:hover:text-[#6f42c1] transition-colors"
                            aria-label="Follow us on Github"
                        >
                            <GitHubIcon className="h-5 w-5" />
                        </Link>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <p className="text-xs text-foreground/80">
                        © {new Date().getFullYear()} afritechjobs.com by{' '}
                        <Link
                            href="https://lomi.africa"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={playClickSound}
                            className="hover:text-white transition-colors"
                        >
                            lomi.
                        </Link>{' '}
                        — All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="h-6 w-6 flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors [&_svg]:fill-current"
                            aria-label={
                                mounted
                                    ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
                                    : 'Toggle theme'
                            }
                        >
                            {mounted ? (
                                <LottieIcon
                                    animationData={
                                        theme === 'dark' ? animations.sun : animations.point
                                    }
                                    size={16}
                                    loop={false}
                                    autoplay={false}
                                    initialFrame={0}
                                    className="text-foreground/80 hover:text-foreground transition-colors"
                                />
                            ) : (
                                <div className="h-4 w-4 rounded-sm bg-muted animate-pulse" />
                            )}
                        </button>
                        <button
                            onClick={toggleSound}
                            className="h-6 w-6 flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors [&_svg]:fill-current"
                            aria-label={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
                        >
                            <LottieIcon
                                animationData={
                                    soundEnabled ? animations.play : animations.pause
                                }
                                size={16}
                                loop={false}
                                autoplay={false}
                                initialFrame={0}
                                className="text-foreground/80 hover:text-foreground transition-colors"
                            />
                        </button>
                    </div>
                </div>
                <BackgroundText />
            </div>
        </footer>
    )
}
