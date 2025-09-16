'use client';

import { useState, useEffect } from 'react';
import { JobForm } from "@/components/forms/job";
import { AuthModal } from "@/components/custom/auth-modal";
import { createClient } from "@/lib/supabase/client";

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
        } else {
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setShowAuthModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setShowAuthModal(false);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setShowAuthModal(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4 w-full max-w-sm mx-auto">
          <div className="max-w-md w-full text-center -mt-32">
            <p className="text-md mt-4">
              Sign in to post a job listing <br />
              and reach 100,000+ african tech professionals.
            </p>
          </div>
        </div>
        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          mode={authMode}
          onModeChange={setAuthMode}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-screen-sm xl:max-w-screen-sm border-t border-border pt-32 pb-16">
      <h1 className="text-2xl mb-4">Create a new job listing</h1>
      <JobForm />
    </div>
  );
}
