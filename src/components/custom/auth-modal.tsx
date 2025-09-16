'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/toast';
import { LottieIcon } from '@/components/design/lottie-icon';
import { animations } from '@/lib/utils/lottie-animations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type AuthModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: 'login' | 'signup';
    onModeChange?: (mode: 'login' | 'signup') => void;
    onAuthSuccess?: () => void;
};

export const AuthModal = ({
    open,
    onOpenChange,
    mode = 'signup',
    onModeChange,
    onAuthSuccess,
}: AuthModalProps) => {
    const router = useRouter();
    const supabase = createClient();
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
    const [isSuccessful, setIsSuccessful] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotPasswordMode, setForgotPasswordMode] = useState<
        'request' | 'reset' | null
    >(null);

    const playClickSound = () => {
        if (typeof window !== 'undefined') {
            try {
                const audio = new Audio('/sounds/light.mp3');
                audio.volume = 0.4;
                void audio.play().catch(() => {
                    // Silently handle audio play errors (autoplay policies, etc.)
                });
            } catch {
                // Ignore audio creation errors
            }
        }
    };

    // Only reset forgot password state on successful completion or explicit back navigation
    const handleModalOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen);
        // Don't reset forgot password state when modal closes - preserve user's progress
    };

    const handleEmailAuth = async () => {
        // Use state values instead of FormData since inputs are controlled
        const currentEmail = email;
        const currentPassword = password;

        if (mode === 'signup') {
            setIsEmailLoading(true);
            setIsSuccessful(false);
            setIsSocialLoading(null);

            try {
                const { error } = await supabase.auth.signUp({
                    email: currentEmail,
                    password: currentPassword,
                    options: {
                        data: {
                            name: currentEmail.split('@')[0] || 'User',
                        },
                    },
                });

                if (error) {
                    throw error;
                }

                setIsEmailLoading(false);
                setIsSuccessful(true);
                toast({ type: 'success', description: 'Account created! Welcome to afritechjobs.com!' });
                // Clear inputs on successful auth
                setEmail('');
                setPassword('');
                onOpenChange(false);
                onAuthSuccess?.();
            } catch (error) {
                setIsEmailLoading(false);
                setIsSuccessful(false);
                console.error('Email Signup Error:', error);
                toast({ type: 'error', description: error instanceof Error ? error.message : 'Failed to create account.' });
            }
        } else {
            setIsEmailLoading(true);
            setIsSuccessful(false);
            setIsSocialLoading(null);

            try {
                const { error } = await supabase.auth.signInWithPassword({
                    email: currentEmail,
                    password: currentPassword,
                });

                if (error) {
                    throw error;
                }

                setIsEmailLoading(false);
                setIsSuccessful(true);
                toast({ type: 'success', description: 'Signed in successfully! Welcome back!' });
                // Clear inputs on successful auth
                setEmail('');
                setPassword('');
                onOpenChange(false);
                onAuthSuccess?.();
                router.refresh();
            } catch (error) {
                setIsEmailLoading(false);
                setIsSuccessful(false);
                console.error('Email Login Error:', error);
                toast({ type: 'error', description: error instanceof Error ? error.message : 'Failed to sign in.' });
            }
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'github') => {
        setIsSocialLoading(provider);
        setIsSuccessful(false);
        setIsEmailLoading(false);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                throw error;
            }

            // OAuth will redirect, so we don't need to close modal here
        } catch (error) {
            setIsSocialLoading(null);
            setIsSuccessful(false);
            console.error(`Social Auth Error (${provider}):`, error);
            toast({ type: 'error', description: error instanceof Error ? error.message : `Failed to authenticate with ${provider}.` });
        }
    };

    const toggleMode = () => {
        const newMode = mode === 'login' ? 'signup' : 'login';
        onModeChange?.(newMode);
    };

    const handleForgotPassword = async (formData: FormData) => {
        const email = formData.get('email') as string;
        setIsEmailLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
            });

            if (error) {
                throw error;
            }

            setEmail(email);
            setForgotPasswordMode('reset');
            setIsEmailLoading(false);
            toast({ type: 'success', description: 'Password reset link sent to your email.' });
        } catch (error) {
            setIsEmailLoading(false);
            console.error('Forgot password error:', error);
            toast({ type: 'error', description: error instanceof Error ? error.message : 'Failed to send reset link.' });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleModalOpenChange}>
            <DialogContent
                className="sm:max-w-sm bg-white border-border [&>button]:hidden"
                data-auth-modal
            >
                <DialogHeader>
                    <DialogTitle>
                        {forgotPasswordMode === 'request'
                            ? 'Reset your password'
                            : forgotPasswordMode === 'reset'
                                ? 'Check your email'
                                : mode === 'signup'
                                    ? 'Create an account'
                                    : 'Welcome back'}
                    </DialogTitle>
                    <DialogDescription>
                        {forgotPasswordMode === 'request'
                            ? 'Enter your email to receive a reset link.'
                            : forgotPasswordMode === 'reset'
                                ? 'Check your email for a password reset link.'
                                : mode === 'signup'
                                    ? 'Get started with afritechjobs.com in seconds.'
                                    : 'Sign in to continue to your account.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Forgot Password Request Screen */}
                    {forgotPasswordMode === 'request' && (
                        <>
                            <form action={handleForgotPassword} className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="forgot-email">Email</Label>
                                    <Input
                                        id="forgot-email"
                                        name="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-9"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-9 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40 hover:text-green-900 dark:hover:text-green-200 border border-green-300 dark:border-green-800"
                                    disabled={isEmailLoading}
                                    onClick={playClickSound}
                                >
                                    {isEmailLoading ? (
                                        <span className="flex items-center gap-2">
                                            <LottieIcon
                                                animationData={animations.autorenew}
                                                size={16}
                                                loop={true}
                                                autoplay={true}
                                            />
                                            Sending...
                                        </span>
                                    ) : (
                                        'Send reset link'
                                    )}
                                </Button>
                            </form>

                            <div className="text-center text-sm text-muted-foreground">
                                Remember your password?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        playClickSound();
                                        setForgotPasswordMode(null);
                                    }}
                                    className="font-medium text-muted-foreground hover:text-primary"
                                >
                                    Back to sign in
                                </button>
                            </div>
                        </>
                    )}

                    {/* Password Reset Screen */}
                    {forgotPasswordMode === 'reset' && (
                        <>
                            <div className="text-center text-sm text-muted-foreground">
                                <p className="mb-4">
                                    We&apos;ve sent a password reset link to <strong>{email}</strong>
                                </p>
                                <p className="mb-4">
                                    Click the link in your email to reset your password.
                                </p>
                            </div>

                            <div className="text-center text-sm text-muted-foreground">
                                Didn&apos;t receive the email?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        playClickSound();
                                        setForgotPasswordMode('request');
                                    }}
                                    className="font-medium text-muted-foreground hover:text-primary"
                                >
                                    Send again
                                </button>
                                {' or '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        playClickSound();
                                        setForgotPasswordMode(null);
                                    }}
                                    className="font-medium text-muted-foreground hover:text-primary"
                                >
                                    Back to sign in
                                </button>
                            </div>
                        </>
                    )}

                    {/* Regular Auth Forms */}
                    {!forgotPasswordMode && (
                        <>
                            {/* Email/Password Form */}
                            <form action={handleEmailAuth} className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-9 pr-24"
                                        />
                                        {mode === 'login' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    playClickSound();
                                                    setForgotPasswordMode('request');
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-primary hover:underline-offset-2"
                                            >
                                                Forgot password?
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-9 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40 hover:text-green-900 dark:hover:text-green-200 border border-green-300 dark:border-green-800"
                                    disabled={
                                        isEmailLoading || isSocialLoading !== null || isSuccessful
                                    }
                                    onClick={playClickSound}
                                >
                                    {isSuccessful ? (
                                        <>✓ Success</>
                                    ) : isEmailLoading ? (
                                        <span className="flex items-center gap-2">
                                            <LottieIcon
                                                animationData={animations.autorenew}
                                                size={16}
                                                loop={true}
                                                autoplay={true}
                                            />
                                            {mode === 'signup' ? 'Creating...' : 'Signing In...'}
                                        </span>
                                    ) : mode === 'signup' ? (
                                        'Create'
                                    ) : (
                                        'Connect'
                                    )}
                                </Button>
                            </form>

                            {/* Social Login Section */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator className="w-full" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-background px-2 text-muted-foreground">
                                        OR CONTINUE WITH
                                    </span>
                                </div>
                            </div>

                            {/* Social Login Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        playClickSound();
                                        handleSocialLogin('google');
                                    }}
                                    disabled={isSocialLoading !== null || isEmailLoading}
                                    className="h-9"
                                >
                                    {isSocialLoading === 'google' ? (
                                        <LottieIcon
                                            animationData={animations.autorenew}
                                            size={16}
                                            loop={true}
                                            autoplay={true}
                                        />
                                    ) : (
                                        <svg className="size-4" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                    )}
                                    <span className="ml-1 text-sm">Google</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        playClickSound();
                                        handleSocialLogin('github');
                                    }}
                                    disabled={isSocialLoading !== null || isEmailLoading}
                                    className="h-9"
                                >
                                    {isSocialLoading === 'github' ? (
                                        <LottieIcon
                                            animationData={animations.autorenew}
                                            size={16}
                                            loop={true}
                                            autoplay={true}
                                        />
                                    ) : (
                                        <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    )}
                                    <span className="ml-1 text-sm">GitHub</span>
                                </Button>
                            </div>

                            {/* Toggle between login/signup */}
                            <div className="text-center text-sm text-muted-foreground">
                                {mode === 'signup' ? (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                playClickSound();
                                                toggleMode();
                                            }}
                                            className="font-medium text-muted-foreground hover:text-primary"
                                        >
                                            Sign in
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Don&apos;t have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                playClickSound();
                                                toggleMode();
                                            }}
                                            className="font-medium text-muted-foreground hover:text-primary"
                                        >
                                            Create one
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
