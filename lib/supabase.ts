import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Critical for React Native — no URL-based auth
  },
});

/** Deep link URL that Supabase redirects to after email verification/reset. */
export const AUTH_CALLBACK_URL = makeRedirectUri({
  scheme: 'heroquest',
  path: 'auth/callback',
});

/**
 * Extract session tokens and optional type from a Supabase auth callback URL.
 * Returns null if the URL doesn't contain valid tokens.
 */
export function extractSessionFromUrl(url: string): {
  access_token: string;
  refresh_token: string;
  type?: string;
} | null {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return null;

  const params = new URLSearchParams(url.substring(hashIndex + 1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  if (!access_token || !refresh_token) return null;

  const type = params.get('type') ?? undefined;
  return { access_token, refresh_token, type };
}
