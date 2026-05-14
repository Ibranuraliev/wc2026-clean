/**
 * Form validation helpers. Returns null when valid, an i18n-key string when not.
 * The caller maps the key to a localized message via page-strings.
 */

export type ValidationKey =
  | "email_required"
  | "email_invalid"
  | "password_required"
  | "password_too_short"
  | "password_weak"
  | "passwords_dont_match"
  | "name_required"
  | "name_too_short"
  | "name_too_long";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): ValidationKey | null {
  const v = value.trim();
  if (!v) return "email_required";
  if (!EMAIL_RE.test(v)) return "email_invalid";
  return null;
}

export function validatePassword(value: string): ValidationKey | null {
  if (!value) return "password_required";
  if (value.length < 8) return "password_too_short";
  // Require at least one digit OR one special char — keep friendly.
  if (!/\d|[!@#$%^&*()_\-+=]/.test(value)) return "password_weak";
  return null;
}

export function validateName(value: string): ValidationKey | null {
  const v = value.trim();
  if (!v) return "name_required";
  if (v.length < 2) return "name_too_short";
  if (v.length > 50) return "name_too_long";
  return null;
}

export function passwordsMatch(a: string, b: string): ValidationKey | null {
  return a === b ? null : "passwords_dont_match";
}
