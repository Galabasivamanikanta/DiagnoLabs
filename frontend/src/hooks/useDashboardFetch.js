import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const useDashboardFetch = (endpoint, initialKeys = {}) => {
  const [data, setData] = useState(initialKeys);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (isMounted) {
          setData(prev => ({ ...prev, ...res.data }));
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err);
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [endpoint]);

  return { data, setData, loading, error };
};

export default useDashboardFetch;
