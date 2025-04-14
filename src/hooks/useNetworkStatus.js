import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook to track network connectivity status
 * @returns {Object} - Network status information
 */
export default function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    connectionType,
    isInternetReachable
  };
}