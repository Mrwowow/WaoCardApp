import { useState, useEffect } from 'react';
import { storeData, getData } from '../utils/storageUtils';
import useNetworkStatus from './useNetworkStatus';

/**
 * Hook to handle data fetching with caching support
 * @param {string} cacheKey - AsyncStorage key
 * @param {Function} fetchFunction - Function to fetch data when online
 * @param {Object} options - Additional options
 * @returns {Object} - Data and status information
 */
export default function useCachedData(cacheKey, fetchFunction, options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const { isConnected } = useNetworkStatus();
  const { autoRefresh = true, refreshInterval = null } = options;

  // Load data on mount or when dependencies change
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const loadData = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);

      try {
        if (isConnected) {
          // Online: fetch fresh data
          const freshData = await fetchFunction();
          if (isMounted) {
            setData(freshData);
            setIsFromCache(false);
            // Cache the fresh data
            await storeData(cacheKey, freshData);
          }
        } else {
          // Offline: try to get cached data
          const cachedData = await getData(cacheKey);
          if (isMounted) {
            if (cachedData) {
              setData(cachedData);
              setIsFromCache(true);
            } else {
              setError('No cached data available');
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          // Try to get cached data as fallback
          try {
            const cachedData = await getData(cacheKey);
            if (cachedData) {
              setData(cachedData);
              setIsFromCache(true);
            }
          } catch (cacheErr) {
            // Cache retrieval also failed
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    // Set up auto-refresh if enabled and online
    if (refreshInterval && autoRefresh && isConnected) {
      intervalId = setInterval(loadData, refreshInterval);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [cacheKey, fetchFunction, isConnected, autoRefresh, refreshInterval]);

  // Function to manually refresh data
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isConnected) {
        // Online: fetch fresh data
        const freshData = await fetchFunction();
        setData(freshData);
        setIsFromCache(false);
        // Cache the fresh data
        await storeData(cacheKey, freshData);
        return { success: true, data: freshData };
      } else {
        // Offline: can't refresh, return error
        setError('Cannot refresh while offline');
        return { success: false, error: 'Cannot refresh while offline' };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refreshData
  };
}