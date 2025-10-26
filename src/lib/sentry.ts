import * as Sentry from '@sentry/browser';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.MODE;

const rawVersion =
  import.meta.env.VITE_APP_VERSION ??
  import.meta.env.VITE_COMMIT_SHA ??
  undefined;

const RELEASE = import.meta.env.VITE_SENTRY_RELEASE ??
  (rawVersion ? `frontend_tj@${rawVersion}` : `frontend_tj@${ENVIRONMENT}`);

let initialized = false;

export const initSentry = () => {
  if (initialized || !SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    release: RELEASE,
    environment: ENVIRONMENT,
  });

  initialized = true;
};

export { Sentry };
