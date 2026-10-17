import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { api } from '../api/client';
import { isVersionOlder } from '../utils/version';

export type OtaStatus =
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'available'
  | 'downloading'
  | 'error';

export interface StoreUpdate {
  /** force = blocking modal, soft = dismissible modal */
  mode: 'soft' | 'force';
  latestVersion: string;
  message?: string;
  storeUrl: string;
}

const FALLBACK_STORE_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/app/id6810354369'
    : 'https://play.google.com/store/apps/details?id=com.smashlive.user';

const DEFAULT_UPDATE_MESSAGE =
  'A new version of SmashLive is available with the latest features and fixes. Please update to continue with the best experience.';

/**
 * Two-layer update check, run once at startup (and re-checked for the
 * store version whenever the app returns to the foreground):
 *
 * 1. EAS Update (OTA) — instant JS-bundle fixes, no store review.
 *    When available the app shows the "Restart & Update" modal.
 * 2. Store version (backend-driven) — compares the native build version
 *    against `latestAppVersion` / `minAppVersion` from the `app-config`
 *    global. Older than latest → soft modal; older than min → blocking.
 */
export function useAppUpdate() {
  const [otaStatus, setOtaStatus] = useState<OtaStatus>('idle');
  const [storeUpdate, setStoreUpdate] = useState<StoreUpdate | null>(null);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);
  const checkedRef = useRef(false);

  const currentVersion = Application.nativeApplicationVersion ?? '1.0.0';

  const checkOtaUpdate = useCallback(async () => {
    try {
      // No OTA in dev / Expo Go — updates only exist in EAS builds.
      if (__DEV__ || !Updates.isEnabled) return;
      setOtaStatus('checking');
      const result = await Updates.checkForUpdateAsync();
      setOtaStatus(result.isAvailable ? 'available' : 'up-to-date');
    } catch {
      setOtaStatus('error');
    }
  }, []);

  const applyOtaUpdate = useCallback(async () => {
    try {
      setOtaStatus('downloading');
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch {
      // Stay on the modal so the user can retry.
      setOtaStatus('available');
    }
  }, []);

  const dismissOtaUpdate = useCallback(() => {
    setOtaStatus('up-to-date');
  }, []);

  const checkStoreUpdate = useCallback(async () => {
    try {
      const config = await api.getAppConfig();
      if (!config) return;

      if (config.maintenanceMode) {
        setMaintenanceMessage(
          config.maintenanceMessage || 'SmashLive is down for scheduled maintenance. Please check back soon.'
        );
        return;
      }
      setMaintenanceMessage(null);

      // Per-platform versions (iOS and Play review ship at different times).
      // Falls back to the legacy single fields if the backend still has them.
      const isIos = Platform.OS === 'ios';
      const latest =
        (isIos ? config.latestIosVersion : config.latestAndroidVersion)?.trim() ||
        config.latestAppVersion?.trim();
      const minimum =
        (isIos ? config.minIosVersion : config.minAndroidVersion)?.trim() ||
        config.minAppVersion?.trim();
      const softMessage = config.updateMessage?.trim() || DEFAULT_UPDATE_MESSAGE;
      const forceMessage = config.forceUpdateMessage?.trim() || DEFAULT_UPDATE_MESSAGE;
      const storeUrl =
        (isIos ? config.appStoreUrl : config.playStoreUrl)?.trim() ||
        FALLBACK_STORE_URL;

      if (minimum && isVersionOlder(currentVersion, minimum)) {
        setStoreUpdate({
          mode: 'force',
          latestVersion: latest || minimum,
          message: forceMessage,
          storeUrl,
        });
      } else if (latest && isVersionOlder(currentVersion, latest)) {
        setStoreUpdate((prev) =>
          prev?.mode === 'force'
            ? prev
            : { mode: 'soft', latestVersion: latest, message: softMessage, storeUrl }
        );
      }
    } catch {
      // Never block the app because the version check failed.
    }
  }, [currentVersion]);

  const dismissStoreUpdate = useCallback(() => {
    // Only soft modals can be dismissed; force modals block the app.
    setStoreUpdate((prev) => (prev?.mode === 'soft' ? null : prev));
  }, []);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    checkOtaUpdate();
    checkStoreUpdate();
  }, [checkOtaUpdate, checkStoreUpdate]);

  // Re-check the store version when coming back from the store app after
  // the user (hopefully) updated — clears a soft modal / force state.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkStoreUpdate();
      }
    });
    return () => subscription.remove();
  }, [checkStoreUpdate]);

  return {
    currentVersion,
    otaStatus,
    storeUpdate,
    maintenanceMessage,
    applyOtaUpdate,
    dismissOtaUpdate,
    dismissStoreUpdate,
    recheck: checkStoreUpdate,
  };
}
