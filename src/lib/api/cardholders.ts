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
  ine: File;
  comprobante: File;
  curpDoc: File;
}

const buildRegistrationFormData = (payload: CardholderRegistrationPayload) => {
  const formData = new FormData();

  formData.append('nombres', payload.nombres);
  formData.append('apellidos', payload.apellidos);
  formData.append('fechaNacimiento', payload.fechaNacimiento);
  formData.append('curp', payload.curp);
  formData.append('username', payload.username);
  formData.append('calle', payload.calle);
  formData.append('numero', payload.numero);
  formData.append('cp', payload.cp);
  formData.append('colonia', payload.colonia);
  formData.append('password', payload.password);
  formData.append('aceptaTerminos', payload.aceptaTerminos ? 'true' : 'false');
  formData.append('ine', payload.ine);
  formData.append('comprobante', payload.comprobante);
  formData.append('curpDoc', payload.curpDoc);

  return formData;
};

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
      body: buildRegistrationFormData(payload),
    }),
};
