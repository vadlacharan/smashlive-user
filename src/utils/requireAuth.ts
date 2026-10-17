import { Alert } from 'react-native';

/** Minimal router shape — avoids coupling to expo-router's Router type. */
interface Navigable {
  push: (href: string) => void;
}

/**
 * Guard for account-only actions (booking, registering, checkout).
 * Returns true when the user is signed in. Otherwise shows a Sign In
 * prompt and returns false so callers can bail out before hitting
 * authenticated APIs as a guest.
 */
export function promptSignIn(
  router: Navigable,
  action: string,
  isSignedIn: boolean
): boolean {
  if (isSignedIn) return true;
  Alert.alert('Sign In Required', `Please sign in or create an account to ${action}.`, [
    { text: 'Later', style: 'cancel' },
    { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
  ]);
  return false;
}
