import { useCallback, useState } from 'react';
import type { AuthTokens } from './authStorage';
import type { ApiError } from './apiClient';
import { apiFetch } from './apiClient';

type RequestStatus = 'idle' | 'pending' | 'sent' | 'error';

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && 'status' in error;

const mapSendOtpError = (error: unknown) => {
  if (!isApiError(error)) {
    return 'No pudimos enviar el codigo. Intenta nuevamente.';
  }

  switch (error.status) {
    case 400:
      return 'La CURP ingresada no es valida.';
    case 404:
      return 'No encontramos una cuenta asociada a esa CURP.';
    case 429:
      return 'Has alcanzado el numero maximo de intentos. Intenta mas tarde.';
    default:
      return 'No pudimos enviar el codigo. Intenta nuevamente.';
  }
};

const mapVerifyOtpError = (error: unknown) => {
  if (!isApiError(error)) {
    return 'El codigo no es valido. Intenta nuevamente.';
  }

  switch (error.status) {
    case 400:
    case 401:
      return 'El codigo ingresado es incorrecto o expiro.';
    case 429:
      return 'Has agotado los intentos permitidos. Solicita un nuevo codigo.';
    default:
      return 'El codigo no es valido. Intenta nuevamente.';
  }
};

export const useOTP = () => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestOTP = useCallback(async (curp: string) => {
    setStatus('pending');
    setErrorMessage(null);

    try {
      await apiFetch<void>('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ curp }),
      });
      setStatus('sent');
      setAttempts(0);
      return true;
    } catch (error) {
      const message = mapSendOtpError(error);
      setErrorMessage(message);
      setStatus('error');
      throw new Error(message);
    }
  }, []);

  const validateOTP = useCallback(async (curp: string, otp: string) => {
    setStatus('pending');
    setErrorMessage(null);
    setAttempts((prev) => prev + 1);

    try {
      const tokens = await apiFetch<AuthTokens>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ curp, otp }),
      });
      setAttempts(0);
      setStatus('sent');
      return tokens;
    } catch (error) {
      const message = mapVerifyOtpError(error);
      setErrorMessage(message);
      setStatus('sent');
      throw new Error(message);
    }
  }, []);

  return { status, attempts, errorMessage, requestOTP, validateOTP };
};
