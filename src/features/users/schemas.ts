import { z } from '@/core/validation';

// Rules mirror Jungo's request contract (OpenAPI x-validation), so most errors show before a round trip.
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;
const STRONG_PASSWORD_PATTERN =
  /^(?=[\s\S]*[a-z])(?=[\s\S]*[A-Z])(?=[\s\S]*[0-9])(?=[\s\S]*[!@#$%^&*()_+\-=[\]{};:'",.<>?/\\|])[\s\S]{8,}$/;
export const PAGE_SIZES = [10, 20, 30, 40, 50] as const;

// PASSWORD_RULES is the checklist shown under the password field; together they equal Jungo's rule.
export const PASSWORD_RULES = [
  { key: 'length', pattern: /^[\s\S]{8,}$/ },
  { key: 'lowercase', pattern: /[a-z]/ },
  { key: 'uppercase', pattern: /[A-Z]/ },
  { key: 'number', pattern: /[0-9]/ },
  { key: 'symbol', pattern: /[!@#$%^&*()_+\-=[\]{};:'",.<>?/\\|]/ },
] as const;

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

const name = z.string().trim().min(2).max(50);
const phone = z.string().trim().regex(PHONE_PATTERN, 'users.phone_rule');
const status = z.enum(['active', 'inactive']);
const roleUuids = z.array(z.uuid()).max(100);

export const createUserSchema = z
  .object({
    first_name: name,
    last_name: name,
    email: z.email().max(150),
    password: z.string().min(8).max(72).regex(STRONG_PASSWORD_PATTERN, 'users.password_rule'),
    confirm_password: z.string(),
    phone_number: z
      .literal('')
      .transform(() => undefined)
      .or(phone),
    status,
    role_uuids: roleUuids.optional(),
  })
  .refine((user) => user.password === user.confirm_password, {
    path: ['confirm_password'],
    message: 'users.password_mismatch',
  });

// status and role_uuids are absent when the admin edits themself: Jungo refuses both changes then.
export const updateUserSchema = z.object({
  first_name: name,
  last_name: name,
  phone_number: z.literal('').or(phone),
  status: status.optional(),
  role_uuids: roleUuids.optional(),
});

export const avatarSchema = z
  .file()
  .max(AVATAR_MAX_BYTES, 'users.avatar_too_large')
  .mime(AVATAR_TYPES, 'users.avatar_type');

export const AVATAR_ACCEPT = AVATAR_TYPES.join(',');

// Bad query values fall back to defaults instead of failing the page.
export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  page_size: z.coerce
    .number()
    .pipe(z.union(PAGE_SIZES.map((size) => z.literal(size))))
    .catch(PAGE_SIZES[0]),
  search: z.string().trim().max(100).catch(''),
  sort_by: z.enum(['created_at', 'email', 'first_name', 'last_name']).catch('created_at'),
  sort_order: z.enum(['asc', 'desc']).catch('desc'),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;
