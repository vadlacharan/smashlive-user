import React from 'react';
import { Linking } from 'react-native';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import { UpdateModal } from './UpdateModal';

/**
 * Mounted once in the root layout. Shows, in priority order:
 *  1. Maintenance mode (backend kill-switch) — blocking, Retry re-checks.
 *  2. Forced store update (below minAppVersion) — blocking, opens the store.
 *  3. EAS OTA update ready — "Restart & Update" / Later.
 *  4. Soft store update (below latestAppVersion) — dismissible.
 */
export const AppUpdateGate: React.FC = () => {
  const {
    otaStatus,
    storeUpdate,
    maintenanceMessage,
    applyOtaUpdate,
    dismissOtaUpdate,
    dismissStoreUpdate,
    recheck,
  } = useAppUpdate();

  const openStore = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  if (maintenanceMessage) {
    return (
      <UpdateModal
        visible
        mode="maintenance"
        title="Under Maintenance"
        message={maintenanceMessage}
        primaryLabel="Retry"
        onPrimary={recheck}
      />
    );
  }

  if (storeUpdate?.mode === 'force') {
    return (
      <UpdateModal
        visible
        mode="force"
        title="Update Required"
        message={storeUpdate.message || 'Please update SmashLive to continue.'}
        primaryLabel="Update Now"
        onPrimary={() => openStore(storeUpdate.storeUrl)}
      />
    );
  }

  if (otaStatus === 'available' || otaStatus === 'downloading') {
    return (
      <UpdateModal
        visible
        mode="soft"
        title="Update Available"
        message="A new version of SmashLive is ready. Restart the app to apply it now — it only takes a second."
        primaryLabel={otaStatus === 'downloading' ? 'Updating…' : 'Restart & Update'}
        onPrimary={applyOtaUpdate}
        primaryLoading={otaStatus === 'downloading'}
        secondaryLabel="Later"
        onSecondary={dismissOtaUpdate}
      />
    );
  }

  if (storeUpdate?.mode === 'soft') {
    return (
      <UpdateModal
        visible
        mode="soft"
        title={`SmashLive ${storeUpdate.latestVersion} is here`}
        message={storeUpdate.message || 'Please update SmashLive to continue.'}
        primaryLabel="Update Now"
        onPrimary={() => openStore(storeUpdate.storeUrl)}
        secondaryLabel="Later"
        onSecondary={dismissStoreUpdate}
      />
    );
  }

  return null;
};
