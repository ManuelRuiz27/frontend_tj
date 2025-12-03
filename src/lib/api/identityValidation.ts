import { env } from '../../config/env';
import { apiFetch } from '../apiClient';

export type IdentityVerificationResponse = {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  curp: string;
  calle: string;
  numero: string;
  cp: string;
  colonia: string;
};

export type IdentityVerificationPayload = {
  ineFront: File;
  ineBack: File;
  acceptsPrivacy: boolean;
};

const ensureEndpoint = () => {
  if (!env.identityValidationUrl) {
    throw new Error(
      'No se configuró el endpoint de validación de identidad (VITE_ID_VALIDATION_URL).',
    );
  }

  return env.identityValidationUrl;
};

export const identityValidationApi = {
  verifyIne: ({ ineFront, ineBack, acceptsPrivacy }: IdentityVerificationPayload) => {
    const endpoint = ensureEndpoint();
    const formData = new FormData();

    formData.append('ine_front', ineFront);
    formData.append('ine_back', ineBack);
    formData.append('privacy_acceptance', acceptsPrivacy ? 'true' : 'false');

    return apiFetch<IdentityVerificationResponse>(endpoint, {
      method: 'POST',
      body: formData,
    });
  },
};
