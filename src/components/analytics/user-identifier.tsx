'use client';

import { createClient } from '@/lib/supabase/client';
import { IdentifyComponent } from '@openpanel/nextjs';
import { useEffect, useState } from 'react';

interface User {
    id: string;
    email?: string;
    created_at?: string;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
    };
}

export function UserIdentifier() {
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        // Get initial user
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        getUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser(session.user);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    if (!user) return null;

    return (
        <IdentifyComponent
            profileId={user.id}
            email={user.email}
            firstName={user.user_metadata?.full_name?.split(' ')[0]}
            lastName={user.user_metadata?.full_name?.split(' ').slice(1).join(' ')}
            properties={{
                avatar_url: user.user_metadata?.avatar_url,
                signup_date: user.created_at,
            }}
        />
    );
}
