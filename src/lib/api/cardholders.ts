import { apiFetch } from '../apiClient';

export interface CardholderLookupResponse {
  curp: string;
  nombres: string;
  apellidos: string;
  municipio?: string | null;
  hasAccount: boolean;
}

export interface CreateAccountPayload {
  curp: string;
  username: string;
  password: string;
}

export interface CardholderRegistrationPayload {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  curp: string;
  username: string;
  calle: string;
  numero: string;
  cp: string;
  colonia: string;
  password: string;
  aceptaTerminos: boolean;
}

export const cardholderApi = {
  lookupCurp: (curp: string) =>
    apiFetch<CardholderLookupResponse>('/cardholders/lookup', {
      method: 'POST',
      body: JSON.stringify({ curp }),
    }),
  createAccount: ({ curp, username, password }: CreateAccountPayload) =>
    apiFetch<void>(`/cardholders/${curp}/account`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  submitRegistration: (payload: CardholderRegistrationPayload) =>
    apiFetch<void>('/cardholders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
