import { z } from '@/core/validation';

// Rules mirror Jungo's user contract (OpenAPI x-validation), shared by the user form and the
// signed-in user's own profile form.
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const personName = z.string().trim().min(2).max(50);
export const phoneNumber = z.string().trim().regex(PHONE_PATTERN, 'person.phone_rule');

export const avatarSchema = z
  .file()
  .max(AVATAR_MAX_BYTES, 'person.avatar_too_large')
  .mime(AVATAR_TYPES, 'person.avatar_type');

export const AVATAR_ACCEPT = AVATAR_TYPES.join(',');
