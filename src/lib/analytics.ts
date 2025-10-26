const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_URL;
const STORAGE_KEY = 'tj_analytics_queue';

export type AnalyticsEventName =
  | 'open_app'
  | 'open_map'
  | 'search'
  | 'filter'
  | 'open_merchant'
  | 'install_click'
  | 'installed';

type AnalyticsPayload = Record<string, unknown> | undefined;

interface StoredEvent {
  event: AnalyticsEventName;
  payload?: Record<string, unknown>;
  timestamp: string;
  environment: string;
}

let queue: StoredEvent[] = [];
let isFlushing = false;
let listenersRegistered = false;

const loadQueue = () => {
  if (typeof window === 'undefined') {
    queue = [];
    return;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      queue = [];
      return;
    }
    const parsed = JSON.parse(raw) as StoredEvent[];
    if (Array.isArray(parsed)) {
      queue = parsed;
    }
  } catch (error) {
    console.warn('No se pudo cargar la cola de analítica', error);
    queue = [];
  }
};

const persistQueue = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (queue.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn('No se pudo persistir la cola de analítica', error);
  }
};

const sendEvent = async (event: StoredEvent) => {
  if (!ANALYTICS_ENDPOINT) {
    return true;
  }

  try {
    const body = JSON.stringify(event);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const sent = navigator.sendBeacon(ANALYTICS_ENDPOINT, body);
      if (!sent) {
        throw new Error('sendBeacon no pudo enviar el evento');
      }
      return true;
    }

    const response = await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    });

    return response.ok;
  } catch (error) {
    console.warn('No se pudo enviar el evento de analítica', error);
    return false;
  }
};

const flushQueue = async () => {
  if (isFlushing) {
    return;
  }

  if (!queue.length) {
    return;
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return;
  }

  isFlushing = true;

  try {
    while (queue.length) {
      const event = queue[0];
      const delivered = await sendEvent(event);
      if (!delivered) {
        break;
      }
      queue.shift();
      persistQueue();
    }
  } finally {
    isFlushing = false;
  }
};

const ensureListeners = () => {
  if (listenersRegistered || typeof window === 'undefined') {
    return;
  }

  window.addEventListener('online', () => {
    void flushQueue();
  });

  listenersRegistered = true;
};

loadQueue();
ensureListeners();
void flushQueue();

export const track = (event: AnalyticsEventName, payload?: AnalyticsPayload) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, payload ?? null);
  }

  if (typeof window === 'undefined') {
    return;
  }

  const entry: StoredEvent = {
    event,
    payload: payload as Record<string, unknown> | undefined,
    timestamp: new Date().toISOString(),
    environment: import.meta.env.MODE,
  };

  queue.push(entry);
  persistQueue();

  if (typeof navigator === 'undefined' || navigator.onLine !== false) {
    void flushQueue();
  }
};
