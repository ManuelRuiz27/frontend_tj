const STRICT_CURP_REGEX =
  /^[A-Z]{1}[AEIOUX]{1}[A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM]{1}(?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]{1}\d{1}$/;
const BASIC_CURP_REGEX = /^[A-Z0-9]{18}$/;

export const normalizeCurp = (value: string) => value.trim().toUpperCase();

export const isValidCurp = (value: string, options?: { strict?: boolean }) => {
  const normalized = normalizeCurp(value);
  const regex = options?.strict ? STRICT_CURP_REGEX : BASIC_CURP_REGEX;
  return regex.test(normalized);
};

export { STRICT_CURP_REGEX };
