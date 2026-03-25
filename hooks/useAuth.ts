import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthUser } from '@/types';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

const mapSessionToUser = (session: Session | null): AuthUser | null => {
  if (!session?.user) return null;
  const provider = session.user.app_metadata?.provider as string | undefined;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    provider: (provider === 'google' || provider === 'apple') ? provider : 'email',
  };
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(mapSessionToUser(s));
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, s: Session | null) => {
        setSession(s);
        setUser(mapSessionToUser(s));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const deleteAccount = useCallback(async () => {
    const { error } = await supabase.rpc('delete_own_account');
    if (error) throw error;
    await supabase.auth.signOut();
  }, []);

  return {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    deleteAccount,
  };
};
