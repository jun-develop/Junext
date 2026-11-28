import { z } from '@/core/validation';

// Mirrors Jungo's password_strong rule (OpenAPI pattern on user create and password reset).
const STRONG_PASSWORD_PATTERN =
  /^(?=[\s\S]*[a-z])(?=[\s\S]*[A-Z])(?=[\s\S]*[0-9])(?=[\s\S]*[!@#$%^&*()_+\-=[\]{};:'",.<>?/\\|])[\s\S]{8,}$/;

// PASSWORD_RULES is the checklist shown under a new password field; together they equal Jungo's rule.
export const PASSWORD_RULES = [
  { key: 'length', pattern: /^[\s\S]{8,}$/ },
  { key: 'lowercase', pattern: /[a-z]/ },
  { key: 'uppercase', pattern: /[A-Z]/ },
  { key: 'number', pattern: /[0-9]/ },
  { key: 'symbol', pattern: /[!@#$%^&*()_+\-=[\]{};:'",.<>?/\\|]/ },
] as const;

export const strongPassword = z
  .string()
  .min(8)
  .max(72)
  .regex(STRONG_PASSWORD_PATTERN, 'password.rule');

// matchingPasswords checks that confirm_password repeats password, reporting on confirm_password.
export function matchingPasswords(input: { password: string; confirm_password: string }): boolean {
  return input.password === input.confirm_password;
}

export const PASSWORD_MISMATCH = { path: ['confirm_password'], message: 'password.mismatch' };
