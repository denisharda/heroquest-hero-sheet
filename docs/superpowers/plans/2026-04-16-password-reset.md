# Password Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a password reset flow where users request a reset link from the sign-in screen, click the deep link in their email to return to the app, and set a new password — all in-app.

**Architecture:** Extend the existing auth mode pattern (`'choice' | 'signin' | 'signup' | 'verify'`) with two new modes: `'forgot'` (request reset link) and `'reset'` (set new password). The deep link handler in `_layout.tsx` already catches `heroquest://auth/callback` URLs — it will be updated to detect `type=recovery` in the URL fragment and navigate to the auth screen in reset mode. Two new methods are added to `useAuth`: `sendPasswordReset` and `updatePassword`, wrapping Supabase's built-in APIs.

**Tech Stack:** React Native, Expo Router, Supabase Auth (`resetPasswordForEmail`, `updateUser`), expo-linking

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/supabase.ts` | Modify | Add `type` field to `extractSessionFromUrl` return value |
| `hooks/useAuth.ts` | Modify | Add `sendPasswordReset` and `updatePassword` methods |
| `app/_layout.tsx` | Modify | Update `AuthDeepLinkHandler` to handle recovery deep links and errors |
| `app/auth.tsx` | Modify | Add `'forgot'` and `'reset'` modes, read query params, add "Forgot password?" link |

---

### Task 1: Update `extractSessionFromUrl` to include `type`

**Files:**
- Modify: `lib/supabase.ts:24-34`

- [ ] **Step 1: Update the function to parse and return `type`**

Replace the existing `extractSessionFromUrl` function:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat: extract type field from auth callback URL fragment"
```

---

### Task 2: Add password reset methods to `useAuth`

**Files:**
- Modify: `hooks/useAuth.ts:60-88`

- [ ] **Step 1: Add `sendPasswordReset` and `updatePassword` methods**

Add these two methods after the `resendVerificationEmail` callback (after line 59):

```typescript
  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: AUTH_CALLBACK_URL,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);
```

- [ ] **Step 2: Add both methods to the return object**

Update the return block to include the new methods:

```typescript
  return {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    signUpWithEmail,
    resendVerificationEmail,
    sendPasswordReset,
    updatePassword,
    signInWithEmail,
    signOut,
    deleteAccount,
  };
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add hooks/useAuth.ts
git commit -m "feat: add sendPasswordReset and updatePassword to useAuth"
```

---

### Task 3: Update `AuthDeepLinkHandler` for recovery flow

**Files:**
- Modify: `app/_layout.tsx:1-2,67-90`

- [ ] **Step 1: Add `router` import from expo-router**

Update the existing import on line 2. Change:

```typescript
import { Stack } from 'expo-router';
```

To:

```typescript
import { Stack, router } from 'expo-router';
```

- [ ] **Step 2: Replace the `AuthDeepLinkHandler` function**

Replace the entire `AuthDeepLinkHandler` function (lines 67-90) with:

```typescript
/** Listens for deep link auth callbacks and establishes the Supabase session. */
function AuthDeepLinkHandler() {
  useEffect(() => {
    const handleUrl = async (url: string) => {
      const result = extractSessionFromUrl(url);
      if (!result) return;

      const { type, ...tokens } = result;
      try {
        await supabase.auth.setSession(tokens);
        if (type === 'recovery') {
          router.replace('/auth?mode=reset');
        }
      } catch {
        // Token expired or invalid — send user to forgot screen with error
        router.replace('/auth?mode=forgot&error=expired');
      }
    };

    // Handle URL that launched the app (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    // Handle URL while app is already running (warm start)
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => subscription.remove();
  }, []);

  return null;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: handle recovery deep links in AuthDeepLinkHandler"
```

---

### Task 4: Add query param reading and new modes to `auth.tsx`

**Files:**
- Modify: `app/auth.tsx:1,13,21,27-35,38`

- [ ] **Step 1: Update imports and AuthMode type**

Change the `useRouter` import on line 13 to also import `useLocalSearchParams`:

```typescript
import { useRouter, useLocalSearchParams } from 'expo-router';
```

Update the `AuthMode` type on line 21:

```typescript
type AuthMode = 'choice' | 'signin' | 'signup' | 'verify' | 'forgot' | 'reset';
```

- [ ] **Step 2: Add `sendPasswordReset` and `updatePassword` to the destructured `useAuth` call**

Update the `useAuth` destructuring (lines 27-35):

```typescript
  const {
    user,
    isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    resendVerificationEmail,
    sendPasswordReset,
    updatePassword,
    signOut,
    deleteAccount,
  } = useAuth();
```

- [ ] **Step 3: Read query params and initialize mode**

Replace the `mode` state initialization on line 38:

```typescript
  const [mode, setMode] = useState<AuthMode>('choice');
```

With:

```typescript
  const params = useLocalSearchParams<{ mode?: string; error?: string }>();
  const [mode, setMode] = useState<AuthMode>(() => {
    if (params.mode === 'reset') return 'reset';
    if (params.mode === 'forgot') return 'forgot';
    return 'choice';
  });
```

And add after the existing `const [error, setError]` line, an effect to handle the `error` query param:

```typescript
  // Show expired-link error if redirected from deep link handler
  useEffect(() => {
    if (params.error === 'expired') {
      setError('Your reset link has expired. Please request a new one.');
    }
  }, [params.error]);
```

- [ ] **Step 4: Add `handleSendPasswordReset` handler**

Add this after the `handleResendVerification` function:

```typescript
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSendPasswordReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email.trim());
      setLoading(false);
      setResetEmailSent(true);
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
      setLoading(false);
    }
  };
```

- [ ] **Step 5: Add `handleUpdatePassword` handler**

Add this after `handleSendPasswordReset`:

```typescript
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updatePassword(newPassword);
      setLoading(false);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
      setLoading(false);
    }
  };
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add app/auth.tsx
git commit -m "feat: add password reset state, handlers, and query param init"
```

---

### Task 5: Add `'forgot'` mode UI to `auth.tsx`

**Files:**
- Modify: `app/auth.tsx` (insert before the `// --- Signed Out: Email Form ---` section)

- [ ] **Step 1: Add the `'forgot'` mode render block**

Insert this block immediately before the line `// --- Signed Out: Email Form ---`:

```tsx
  // --- Forgot Password Screen ---
  if (mode === 'forgot') {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Pressable onPress={() => { setMode('signin'); setError(null); setResetEmailSent(false); }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Forgot Password
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {resetEmailSent ? (
            <>
              <Ionicons
                name="mail-open-outline"
                size={64}
                color={theme.colors.accent}
                style={styles.heroIcon}
              />
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Check Your Email
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                We sent a password reset link to{'\n'}
                <Text style={{ fontWeight: '700', color: theme.colors.text }}>{email}</Text>
                {'\n\n'}Open the link to set a new password.
              </Text>

              {error && (
                <View style={[styles.errorBox, { backgroundColor: withOpacity(theme.colors.danger, 0.13) }]}>
                  <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
                </View>
              )}

              <Pressable
                style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}
                onPress={() => { setMode('signin'); setError(null); setResetEmailSent(false); }}
              >
                <Text style={styles.primaryButtonText}>Back to Sign In</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.providerButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    opacity: resendCooldown > 0 ? 0.5 : 1,
                  },
                ]}
                onPress={handleSendPasswordReset}
                disabled={loading || resendCooldown > 0}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.text} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={20} color={theme.colors.text} />
                    <Text style={[styles.providerButtonText, { color: theme.colors.text }]}>
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend Reset Email'}
                    </Text>
                  </>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Ionicons
                name="lock-open-outline"
                size={64}
                color={theme.colors.accent}
                style={styles.heroIcon}
              />
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Reset Password
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>

              {error && (
                <View style={[styles.errorBox, { backgroundColor: withOpacity(theme.colors.danger, 0.13) }]}>
                  <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
                </View>
              )}

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />

              <Pressable
                style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}
                onPress={handleSendPasswordReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textOnAccent} />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        )}
      </View>
    );
  }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/auth.tsx
git commit -m "feat: add forgot password screen with email input and confirmation"
```

---

### Task 6: Add `'reset'` mode UI to `auth.tsx`

**Files:**
- Modify: `app/auth.tsx` (insert after the `'forgot'` block, before `// --- Signed Out: Email Form ---`)

- [ ] **Step 1: Add the `'reset'` mode render block**

Insert this block immediately after the `'forgot'` block and before `// --- Signed Out: Email Form ---`:

```tsx
  // --- Set New Password Screen ---
  if (mode === 'reset') {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Pressable onPress={() => { setMode('choice'); setError(null); }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Set New Password
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Ionicons
            name="key-outline"
            size={64}
            color={theme.colors.accent}
            style={styles.heroIcon}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            New Password
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Choose a new password for your account.
          </Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: withOpacity(theme.colors.danger, 0.13) }]}>
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            </View>
          )}

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="New Password"
            placeholderTextColor={theme.colors.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            textContentType="newPassword"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Confirm New Password"
            placeholderTextColor={theme.colors.textSecondary}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry
            textContentType="newPassword"
          />

          <Pressable
            style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.textOnAccent} />
            ) : (
              <Text style={styles.primaryButtonText}>Update Password</Text>
            )}
          </Pressable>
        </ScrollView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        )}
      </View>
    );
  }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/auth.tsx
git commit -m "feat: add set new password screen for recovery flow"
```

---

### Task 7: Add "Forgot password?" link to sign-in form

**Files:**
- Modify: `app/auth.tsx` (inside the `mode === 'signin' || mode === 'signup'` block)

- [ ] **Step 1: Add the link after the primary button in the sign-in form**

In the `// --- Signed Out: Email Form ---` section, find the `<Pressable>` that toggles between signup and signin (the one with text "Already have an account?" / "Don't have an account?"). Insert a "Forgot password?" link immediately before it, but only in signin mode:

```tsx
          {mode === 'signin' && (
            <Pressable
              onPress={() => { setError(null); setMode('forgot'); }}
              style={{ marginBottom: 8 }}
            >
              <Text style={[styles.switchText, { color: theme.colors.accent }]}>
                Forgot password?
              </Text>
            </Pressable>
          )}
```

This goes right before the existing toggle `<Pressable>`:

```tsx
            <Pressable
              onPress={() => { setConfirmPassword(''); setError(null); setMode(mode === 'signup' ? 'signin' : 'signup'); }}
            >
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/auth.tsx
git commit -m "feat: add forgot password link to sign-in form"
```

---

## Summary

| Task | File | What it does |
|------|------|-------------|
| 1 | `lib/supabase.ts` | Parse `type` from callback URL fragment |
| 2 | `hooks/useAuth.ts` | Add `sendPasswordReset` and `updatePassword` methods |
| 3 | `app/_layout.tsx` | Route recovery deep links to `/auth?mode=reset`, handle expired tokens |
| 4 | `app/auth.tsx` | Wire up state, handlers, and query param initialization |
| 5 | `app/auth.tsx` | `'forgot'` mode — email input, confirmation with resend |
| 6 | `app/auth.tsx` | `'reset'` mode — new password form |
| 7 | `app/auth.tsx` | "Forgot password?" link on sign-in screen |
