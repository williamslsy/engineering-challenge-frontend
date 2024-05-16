import { toast } from '@/components/ui/use-toast';
import { useState, useCallback } from 'react';

const useApi = () => {
  const [loading, setLoading] = useState(false);

  const handleError = (error: Error, retryFunction: () => void, retryCount: number) => {
    if (retryCount < 3) {
      toast({
        title: 'Info',
        description: 'Retrying request...',
      });
      setTimeout(retryFunction, 5000 * Math.pow(2, retryCount));
    } else {
      toast({
        title: 'Error',
        description: 'Unable to complete the request. Please try again later.',
        variant: 'destructive',
      });
    }
    console.error('Error:', error);
  };

  const request = useCallback(async (url: string, options: RequestInit, retryFunction: () => void, retryCount: number) => {
    setLoading(true);
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      handleError(error as Error, retryFunction, retryCount);
    }
  }, []);

  return { loading, request };
};

export default useApi;
