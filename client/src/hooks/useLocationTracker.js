import { useEffect, useRef } from 'react';
import locationService from '../services/locationService';

/**
 * Custom hook to track employee location every hour after check-in.
 * 
 * @param {boolean} isCheckedIn - Whether the employee has checked in.
 * @param {boolean} isCheckedOut - Whether the employee has checked out.
 */
const useLocationTracker = (isCheckedIn, isCheckedOut) => {
  const intervalRef = useRef(null);

  const trackLocation = async () => {
    console.log('[LocationTracker] Attempting to capture position...');
    
    if (!navigator.geolocation) {
      console.error('[LocationTracker] Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await locationService.saveLocation({
            latitude,
            longitude,
            isGpsEnabled: true,
            timestamp: new Date(),
          });
          console.log('[LocationTracker] Location saved successfully (GPS ON)');
        } catch (error) {
          console.error('[LocationTracker] Failed to save location:', error);
        }
      },
      async (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          window.alert('Location permission is denied. Please enable it to track your attendance properly.');
          console.warn('[LocationTracker] Permission denied by user.');
        } else {
          // GPS is likely OFF or timeout, send last known status
          console.warn('[LocationTracker] GPS is unavailable. Notifying backend to use last known location.');
          try {
            await locationService.saveLocation({
              isGpsEnabled: false,
              timestamp: new Date(),
            });
          } catch (err) {
            console.error('[LocationTracker] Failed to notifying backend:', err);
          }
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
    // Start tracking only if user is checked in and NOT checked out
    const shouldTrack = isCheckedIn && !isCheckedOut;

    if (shouldTrack) {
      // Trigger initial location capture immediately
      trackLocation();

      // Set up interval for every 1 hour (3600000 ms)
      intervalRef.current = setInterval(() => {
        trackLocation();
      }, 3600000);

      console.log('[LocationTracker] Interval started (1 hour)');
    } else {
      // Clear interval if user checks out or logs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log('[LocationTracker] Interval cleared');
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('[LocationTracker] Cleanup: Interval cleared');
      }
    };
  }, [isCheckedIn, isCheckedOut]);

  return null; // This hook doesn't return anything for now
};

export default useLocationTracker;
