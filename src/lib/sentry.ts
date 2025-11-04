import * as Sentry from '@sentry/browser';
import { env } from '../config/env';

let initialized = false;

export const initSentry = () => {
  if (initialized || !env.sentryDsn) {
    return;
  }

  Sentry.init({
    dsn: env.sentryDsn,
    release: env.sentryRelease,
    environment: env.sentryEnvironment,
  });

  initialized = true;
};

export { Sentry };
