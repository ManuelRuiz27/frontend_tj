const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim().toLowerCase());

export const isSecurePassword = (value: string, minLength = 8) => {
  const normalized = value ?? '';
  return (
    normalized.length >= minLength &&
    /[A-Z]/.test(normalized) &&
    /[a-z]/.test(normalized) &&
    /\d/.test(normalized)
  );
};
