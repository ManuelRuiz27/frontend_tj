export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}

type Listener = (tokens: AuthTokens | null) => void;

const STORAGE_KEY = 'tj.auth.tokens';
const listeners = new Set<Listener>();

const isBrowser = typeof window !== 'undefined';

export const getStoredTokens = (): AuthTokens | null => {
  if (!isBrowser) {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as AuthTokens | null;
    if (parsed && typeof parsed.accessToken === 'string') {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return null;
};

const notify = (tokens: AuthTokens | null) => {
  listeners.forEach((listener) => listener(tokens));
};

export const persistTokens = (tokens: AuthTokens | null) => {
  if (!isBrowser) {
    return;
  }

  if (!tokens) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  notify(tokens);
};

export const clearStoredTokens = () => {
  persistTokens(null);
};

export const subscribeToAuthChanges = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
