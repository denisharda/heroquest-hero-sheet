import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { PURE_COLORS } from '@/constants/colors';
import { useRouter } from 'expo-router';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useSync } from '@/hooks/useSync';
import { withOpacity } from '@/theme/colorUtils';

type AuthMode = 'choice' | 'signin' | 'signup';

export default function AuthScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    deleteAccount,
  } = useAuth();
  const { isSyncing, lastSyncedAt, syncError, syncNow, fetchRestorableHeroes } = useSync();

  const [mode, setMode] = useState<AuthMode>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
      setLoading(false);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all synced data. Local heroes will be kept. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAccount();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Account deletion failed');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatLastSynced = () => {
    if (!lastSyncedAt) return 'Never';
    const diff = Date.now() - lastSyncedAt;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(lastSyncedAt).toLocaleTimeString();
  };

  // --- Signed In View ---
  if (isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Account</Text>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* User Info */}
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="person-circle" size={48} color={theme.colors.accent} />
            <Text style={[styles.userEmail, { color: theme.colors.text }]}>
              {user?.email ?? 'Signed in'}
            </Text>
          </View>

          {/* Sync Status */}
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Cloud Sync</Text>
            <View style={styles.syncRow}>
              <Ionicons
                name={isSyncing ? 'sync' : syncError ? 'cloud-offline' : 'cloud-done'}
                size={20}
                color={syncError ? theme.colors.danger : theme.colors.success}
              />
              <Text style={[styles.syncText, { color: theme.colors.textSecondary }]}>
                {isSyncing
                  ? 'Syncing...'
                  : syncError
                    ? `Error: ${syncError}`
                    : `Last synced: ${formatLastSynced()}`}
              </Text>
            </View>
            <Pressable
              style={[styles.syncButton, { backgroundColor: withOpacity(theme.colors.accent, 0.13) }]}
              onPress={syncNow}
              disabled={isSyncing}
            >
              <Ionicons name="sync" size={18} color={theme.colors.accent} />
              <Text style={[styles.syncButtonText, { color: theme.colors.accent }]}>
                Sync Now
              </Text>
            </Pressable>
          </View>

          {/* Restore Heroes */}
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={async () => {
              setLoading(true);
              const found = await fetchRestorableHeroes();
              setLoading(false);
              if (found) {
                router.canGoBack() ? router.back() : router.replace('/');
              } else {
                Alert.alert('No Heroes Found', 'There are no deleted heroes to restore from the cloud.');
              }
            }}
            disabled={loading}
          >
            <Ionicons name="cloud-download-outline" size={20} color={theme.colors.accent} />
            <Text style={[styles.actionText, { color: theme.colors.accent }]}>
              Restore Deleted Heroes
            </Text>
          </Pressable>

          {/* Actions */}
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleSignOut}
            disabled={loading}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.colors.text} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>Sign Out</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            <Text style={[styles.actionText, { color: theme.colors.danger }]}>
              Delete Account
            </Text>
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

  // --- Signed Out: Email Form ---
  if (mode === 'signin' || mode === 'signup') {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Pressable onPress={() => setMode('choice')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
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

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={theme.colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType={mode === 'signup' ? 'newPassword' : 'password'}
          />

          {mode === 'signup' && (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
            />
          )}

          <Pressable
            style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.textOnAccent} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => { setConfirmPassword(''); setError(null); setMode(mode === 'signup' ? 'signin' : 'signup'); }}
          >
            <Text style={[styles.switchText, { color: theme.colors.accent }]}>
              {mode === 'signup'
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // --- Signed Out: Choice Screen ---
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sign In</Text>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <MaterialCommunityIcons
          name="shield-account"
          size={64}
          color={theme.colors.accent}
          style={styles.heroIcon}
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Protect Your Heroes
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Sign in to back up your hero data to the cloud. Your heroes will sync across devices.
        </Text>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: withOpacity(theme.colors.danger, 0.13) }]}>
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
          </View>
        )}

        {/* Email/Password */}
        <Pressable
          style={[styles.providerButton, { backgroundColor: theme.colors.accent }]}
          onPress={() => setMode('signin')}
          disabled={loading}
        >
          <Ionicons name="mail" size={20} color={theme.colors.textOnAccent} />
          <Text style={styles.providerButtonText}>Sign In with Email</Text>
        </Pressable>

        <Pressable
          style={[
            styles.providerButton,
            { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
          ]}
          onPress={() => setMode('signup')}
          disabled={loading}
        >
          <Ionicons name="person-add" size={20} color={theme.colors.text} />
          <Text style={[styles.providerButtonText, { color: theme.colors.text }]}>
            Create Account
          </Text>
        </Pressable>

        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
            Continue without account
          </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Cinzel_700Bold',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  heroIcon: {
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Cinzel_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorBox: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  providerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: PURE_COLORS.white,
  },
  skipButton: {
    marginTop: 16,
    padding: 12,
  },
  skipText: {
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 12,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: PURE_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Cinzel_600SemiBold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncText: {
    fontSize: 14,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withOpacity(PURE_COLORS.black, 0.3),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
