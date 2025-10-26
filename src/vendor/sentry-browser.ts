interface InitOptions {
  dsn: string;
  release?: string;
  environment?: string;
}

interface ParsedDsn {
  endpoint: string;
  auth: string;
}

interface SentryState extends InitOptions {
  parsed: ParsedDsn;
}

let state: SentryState | undefined;

const parseDsn = (dsn: string): ParsedDsn => {
  const url = new URL(dsn);
  const projectId = url.pathname.replace(/^\//, '');
  if (!projectId) {
    throw new Error('DSN inválido: falta el identificador del proyecto');
  }
  const endpoint = `${url.protocol}//${url.host}/api/${projectId}/envelope/`;
  const authParts = [`sentry_key=${url.username}`, 'sentry_version=7'];
  if (url.password) {
    authParts.push(`sentry_secret=${url.password}`);
  }
  return {
    endpoint,
    auth: `Sentry ${authParts.join(', ')}`,
  };
};

const createEventId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
};

const sendEnvelope = async (payload: Record<string, unknown>) => {
  if (!state) {
    return;
  }

  const envelopeHeader = JSON.stringify({
    sent_at: new Date().toISOString(),
    sdk: { name: 'tj-lite-sentry', version: '0.1.0' },
    dsn: state.dsn,
  });

  const itemHeader = JSON.stringify({
    type: 'event',
  });

  const body = `${envelopeHeader}\n${itemHeader}\n${JSON.stringify(payload)}`;

  try {
    await fetch(state.parsed.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': state.parsed.auth,
      },
      body,
      keepalive: true,
    });
  } catch (error) {
    console.warn('No se pudo enviar el evento a Sentry', error);
  }
};

export const init = (options: InitOptions) => {
  if (!options.dsn) {
    return;
  }

  try {
    state = {
      ...options,
      parsed: parseDsn(options.dsn),
    };
  } catch (error) {
    console.warn('No se pudo inicializar Sentry', error);
    state = undefined;
  }
};

export const captureException = (error: unknown) => {
  if (!state) {
    return;
  }

  const value = error instanceof Error ? error.message : String(error);
  const type = error instanceof Error && error.name ? error.name : 'Error';

  void sendEnvelope({
    event_id: createEventId(),
    platform: 'javascript',
    level: 'error',
    exception: {
      values: [
        {
          type,
          value,
        },
      ],
    },
    release: state.release,
    environment: state.environment,
  });
};

export const captureMessage = (message: string, level: 'error' | 'warning' | 'info' = 'info') => {
  if (!state) {
    return;
  }

  void sendEnvelope({
    event_id: createEventId(),
    platform: 'javascript',
    level,
    message: {
      formatted: message,
    },
    release: state.release,
    environment: state.environment,
  });
};

export const flush = async () => {
  return Promise.resolve();
};

export default {
  init,
  captureException,
  captureMessage,
  flush,
};
