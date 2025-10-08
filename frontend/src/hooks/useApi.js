import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const useSkills = (searchParams = {}) => {
  return useApi(() => apiService.getSkills(searchParams), [JSON.stringify(searchParams)]);
};

export const useUserSkills = () => {
  return useApi(() => apiService.getUserSkills());
};

export const useItems = (searchParams = {}) => {
  return useApi(() => apiService.getItems(searchParams), [JSON.stringify(searchParams)]);
};

export const useUserItems = () => {
  return useApi(() => apiService.getUserItems());
};

export const usePolls = () => {
  return useApi(() => apiService.getPolls());
};

export const useUserPolls = () => {
  return useApi(() => apiService.getUserPolls());
};

export const useNotifications = () => {
  return useApi(() => apiService.getNotifications());
};

export const useDashboardStats = () => {
  return useApi(() => apiService.getDashboardStats());
};

export const useBarterRequests = () => {
  return useApi(() => apiService.getBarterRequests());
};

export const useActivity = () => {
  return useApi(() => apiService.getActivity());
};