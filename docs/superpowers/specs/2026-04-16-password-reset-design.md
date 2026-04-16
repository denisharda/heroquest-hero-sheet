# Password Reset Design

**Date:** 2026-04-16
**Status:** Approved

## Overview

Add a password reset flow to the existing auth screen. Users can request a reset link from the sign-in screen, receive an email, click the deep link to return to the app, and set a new password — all without leaving the native experience.

## User Flows

### Flow 1: Request Password Reset

1. User is on the sign-in form (`'signin'` mode)
2. Taps "Forgot password?" link below the password field
3. Auth screen switches to `'forgot'` mode — shows email input (pre-filled if they already typed it on sign-in)
4. User enters email and taps "Send Reset Link"
5. App calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: AUTH_CALLBACK_URL })`
6. Screen shows confirmation: "Check your email" with the email address displayed
7. Resend button with 60-second cooldown (same pattern as email verification)
8. "Back to Sign In" button to return to `'signin'` mode

### Flow 2: Set New Password (via deep link)

1. User clicks the reset link in their email
2. Browser opens, Supabase verifies the recovery token, redirects to `heroquest://auth/callback#access_token=...&refresh_token=...&type=recovery`
3. `AuthDeepLinkHandler` in `_layout.tsx` catches the deep link:
   a. Extracts tokens and `type` from the URL fragment
   b. Calls `supabase.auth.setSession({ access_token, refresh_token })`
   c. Detects `type=recovery` and navigates to `/auth?mode=reset`
4. Auth screen reads `?mode=reset` query param and opens in `'reset'` mode
5. User sees "Set New Password" form with new password + confirm password fields
6. User submits — app calls `supabase.auth.updateUser({ password })`
7. On success, shows brief success message then navigates to `/` (user is already authenticated from the recovery session)

## File Changes

### `lib/supabase.ts`

Update `extractSessionFromUrl` return type to include an optional `type` field:

```typescript
export function extractSessionFromUrl(url: string): {
  access_token: string;
  refresh_token: string;
  type?: string;
} | null
```

Parse `type` from the URL fragment params alongside the tokens.

### `hooks/useAuth.ts`

Add two methods:

- `sendPasswordReset(email: string): Promise<void>` — calls `supabase.auth.resetPasswordForEmail()` with `emailRedirectTo: AUTH_CALLBACK_URL`
- `updatePassword(newPassword: string): Promise<void>` — calls `supabase.auth.updateUser({ password: newPassword })`

### `app/_layout.tsx`

Update `AuthDeepLinkHandler`:

- Receive the `type` field from `extractSessionFromUrl`
- After `setSession()`, if `type === 'recovery'`, use `router.replace('/auth?mode=reset')` to open the auth screen in reset mode
- Wrap `setSession()` in try/catch — on failure (expired token), navigate to `/auth?mode=forgot&error=expired`

Since `AuthDeepLinkHandler` currently lives outside any navigation context, it must use `expo-router`'s imperative `router` export (not the `useRouter` hook) for navigation. Import `router` from `expo-router` at the top of the file.

### `app/auth.tsx`

**AuthMode type:**
```typescript
type AuthMode = 'choice' | 'signin' | 'signup' | 'verify' | 'forgot' | 'reset';
```

**Initialization:**
- Read `mode` and `error` from the route's search params using `useLocalSearchParams()`
- If `mode=reset`, initialize in `'reset'` mode
- If `mode=forgot` with `error=expired`, initialize in `'forgot'` mode with an error message about the expired link

**`'forgot'` mode UI:**
- Header: "Forgot Password" with back button → `'signin'`
- Email input (pre-filled from state if user came from sign-in)
- "Send Reset Link" primary button
- On success: switches to a confirmation sub-state showing "Check your email" message, the email address, resend button (60s cooldown), and "Back to Sign In" button
- Error display for failures

**`'reset'` mode UI:**
- Header: "Set New Password" with back button → `'choice'`
- New password input
- Confirm password input
- "Update Password" primary button
- Client-side validation: passwords must match, minimum length
- On success: brief success message, then `router.replace('/')`
- Error display for failures

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Expired reset link | `setSession()` fails → navigate to `/auth?mode=forgot&error=expired` with message "Your reset link has expired. Please request a new one." |
| Mismatched passwords | Client-side validation before calling `updateUser()`, same as signup |
| Cold start from reset link | `Linking.getInitialURL()` already handles this — same path as warm start |
| User reaches `'reset'` without a session | Fall back to `'forgot'` mode (shouldn't happen since `setSession()` runs before navigation) |
| Supabase email confirmation disabled | `resetPasswordForEmail` still works independently — email confirmation and password reset are separate Supabase features |

## Supabase Dashboard Configuration

The redirect URL `heroquest://auth/callback` must be in the allowed redirect URLs list under **Authentication > URL Configuration > Redirect URLs**. This was already required for email verification — no additional configuration needed.

## No New Files, Dependencies, or Schema Changes

All changes are modifications to existing files. The password reset uses Supabase's built-in `resetPasswordForEmail` and `updateUser` APIs. No database changes required.
