import { useEffect, useRef, useCallback } from 'react';
import locationService from '../services/locationService';
import { useUI } from '../context/UIContext';

const CACHE_KEY = 'wt_last_known_pos';
const QUEUE_KEY = 'wt_pending_pulses';

/**
 * Custom hook to track employee location every hour after check-in.
 */
const useLocationTracker = (isCheckedIn, isCheckedOut) => {
  const intervalRef = useRef(null);
  const { addToast } = useUI();

  // Helper to get cached location
  const getLastKnownLocation = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  };

  // Helper to queue offline pulses
  const queueOfflinePulse = (data) => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({ ...data, queuedAt: new Date().toISOString() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log('[LocationTracker] Pulse queued (Offline)');
  };

  // Helper to flush queue
  const flushOfflineQueue = useCallback(async () => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    console.log(`[LocationTracker] Synchronizing ${queue.length} offline pulses...`);
    
    for (const pulse of queue) {
      try {
        await locationService.saveLocation(pulse);
      } catch (err) {
        console.error('[LocationTracker] Failed to sync pulse:', err);
      }
    }

    localStorage.removeItem(QUEUE_KEY);
    addToast(`Synced ${queue.length} backlog activity items`, 'success');
  }, [addToast]);

  const trackLocation = async () => {
    console.log('[LocationTracker] Heartbeat pulse initiated...');
    
    if (!navigator.geolocation) {
      console.error('[LocationTracker] Geolocation unsupported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const payload = {
          latitude,
          longitude,
          isGpsEnabled: true,
          timestamp: new Date().toISOString(),
        };

        // Cache for future fallbacks
        localStorage.setItem(CACHE_KEY, JSON.stringify({ latitude, longitude }));

        try {
          await locationService.saveLocation(payload);
          console.log('[LocationTracker] GPS pulse synced successfully');
        } catch (error) {
          if (!navigator.onLine) {
            queueOfflinePulse(payload);
          }
        }
      },
      async (error) => {
        const cached = getLastKnownLocation();
        const payload = {
          latitude: cached?.latitude || 0,
          longitude: cached?.longitude || 0,
          isGpsEnabled: false,
          timestamp: new Date().toISOString(),
        };

        console.warn(`[LocationTracker] GPS Fail: ${error.message}. Using cache.`);

        try {
          await locationService.saveLocation(payload);
          console.log('[LocationTracker] Signal-lost pulse synced');
        } catch (err) {
          if (!navigator.onLine) {
            queueOfflinePulse(payload);
          }
        }

        if (error.code === error.PERMISSION_DENIED) {
          addToast('Location access is REQUIRED for audit compliance. Please enable GPS permissions.', 'error');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    const shouldTrack = isCheckedIn && !isCheckedOut;

    if (shouldTrack) {
      trackLocation();
      intervalRef.current = setInterval(trackLocation, 3600000);
      
      // Handle network recovery
      window.addEventListener('online', flushOfflineQueue);
      
      // Immediate sync if internet is back
      if (navigator.onLine) flushOfflineQueue();

      console.log('[LocationTracker] Audit-loop started');
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      window.removeEventListener('online', flushOfflineQueue);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('online', flushOfflineQueue);
    };
  }, [isCheckedIn, isCheckedOut, flushOfflineQueue]);

  return null;
};

export default useLocationTracker;
