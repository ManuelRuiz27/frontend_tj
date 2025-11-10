import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AuthTokens } from './authStorage';
import {
  clearStoredTokens,
  getStoredTokens,
  persistTokens,
  subscribeToAuthChanges,
} from './authStorage';
import { authApi } from './api/auth';
import type { LoginRequest, UserProfile } from './api/auth';
import type { ApiError } from './apiClient';

type AuthStatus = 'unauthenticated' | 'loading' | 'authenticated' | 'error';

export type LoginCredentials = LoginRequest;

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && 'status' in error;

export const useAuth = () => {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => getStoredTokens());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokens ? 'loading' : 'unauthenticated'));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const skipNextProfileFetch = useRef(false);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await authApi.profile();
      setUser(profile);
      setStatus('authenticated');
      setErrorMessage(null);
      return profile;
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        clearStoredTokens();
        setUser(null);
        setStatus('unauthenticated');
        setErrorMessage(null);
        return null;
      }

      setErrorMessage('No pudimos obtener tu informacion de perfil.');
      setStatus('error');
      return null;
    }
  }, []);

  const applyTokens = useCallback(
    async (nextTokens: AuthTokens) => {
      skipNextProfileFetch.current = true;
      persistTokens(nextTokens);
      setTokens(nextTokens);
      setStatus('loading');
      return fetchProfile();
    },
    [fetchProfile],
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setStatus('loading');
      setErrorMessage(null);

      try {
        const normalizedCredentials: LoginRequest = {
          username: credentials.username.trim().toLowerCase(),
          password: credentials.password,
        };
        const authTokens = await authApi.login(normalizedCredentials);
        const profile = await applyTokens(authTokens);
        if (!profile) {
          throw new Error('No pudimos completar el inicio de sesion.');
        }
        return true;
      } catch (error) {
        const message =
          isApiError(error) && (error.status === 400 || error.status === 401)
            ? 'Credenciales invalidas.'
            : 'No pudimos iniciar sesion. Intenta nuevamente.';
        setStatus('unauthenticated');
        setErrorMessage(message);
        throw new Error(message);
      }
    },
    [applyTokens],
  );

  const authenticateWithTokens = useCallback(
    async (authTokens: AuthTokens) => {
      const profile = await applyTokens(authTokens);
      if (!profile) {
        throw new Error('No pudimos completar el inicio de sesion.');
      }
      return true;
    },
    [applyTokens],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      if (!isApiError(error) || error.status >= 500) {
        setErrorMessage('No pudimos cerrar la sesion correctamente.');
      }
    } finally {
      clearStoredTokens();
      setTokens(null);
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((updatedTokens) => {
      setTokens(updatedTokens);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!tokens) {
      setUser(null);
      setStatus('unauthenticated');
      return;
    }

    if (skipNextProfileFetch.current) {
      skipNextProfileFetch.current = false;
      return;
    }

    setStatus((previous) => (previous === 'authenticated' ? previous : 'loading'));
    void fetchProfile();
  }, [tokens, fetchProfile]);

  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);

  return {
    isAuthenticated,
    status,
    user,
    errorMessage,
    login,
    logout,
    authenticateWithTokens,
    refreshProfile: fetchProfile,
  };
};
