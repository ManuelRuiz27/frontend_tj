import { useCallback, useState } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsAuthenticated(true);
    return true;
  }, []);

  return { isAuthenticated, login };
};
