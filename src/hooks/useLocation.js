import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { storeData, getData, STORAGE_KEYS } from '../utils/storageUtils';

/**
 * Hook to handle device location
 * @param {Object} options - Location options
 * @returns {Object} - Location data and functions
 */
export default function useLocation(options = {}) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get initial location on mount
  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      setIsLoading(true);
      try {
        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        setPermissionStatus(status);

        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          
          // Try to use last known location from storage
          const lastLocation = await getData(STORAGE_KEYS.LAST_LOCATION);
          if (lastLocation) {
            if (isMounted) setLocation(lastLocation);
          }
          return;
        }

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          ...options
        });

        // Format location
        const formattedLocation = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
          timestamp: currentLocation.timestamp
        };

        // Save to state if component still mounted
        if (isMounted) {
          setLocation(formattedLocation);
          // Cache location for offline use
          storeData(STORAGE_KEYS.LAST_LOCATION, formattedLocation);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMsg(error.message);
          
          // Try to use last known location from storage
          const lastLocation = await getData(STORAGE_KEYS.LAST_LOCATION);
          if (lastLocation) {
            setLocation(lastLocation);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  // Function to refresh location
  const refreshLocation = async () => {
    if (permissionStatus !== 'granted') {
      return { error: 'Location permission not granted' };
    }

    setIsLoading(true);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        ...options
      });

      const formattedLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
        timestamp: currentLocation.timestamp
      };

      setLocation(formattedLocation);
      storeData(STORAGE_KEYS.LAST_LOCATION, formattedLocation);
      setIsLoading(false);
      return { location: formattedLocation };
    } catch (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
      return { error: error.message };
    }
  };

  return {
    location,
    errorMsg,
    permissionStatus,
    isLoading,
    refreshLocation
  };
}