import { useCallback, useState } from 'react';

type RequestStatus = 'idle' | 'pending' | 'sent' | 'error';

export const useOTP = () => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [attempts, setAttempts] = useState(0);

  const requestOTP = useCallback(async (curp: string) => {
    setStatus('pending');
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!curp) {
      setStatus('error');
      throw new Error('CURP inválida');
    }
    setStatus('sent');
    setAttempts(0);
    return true;
  }, []);

  const validateOTP = useCallback(async (otp: string) => {
    setAttempts((prev) => prev + 1);
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (otp === '123456') {
      setAttempts(0);
      return true;
    }
    throw new Error('Código incorrecto');
  }, []);

  return { status, attempts, requestOTP, validateOTP };
};
