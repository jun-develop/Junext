import { matchingPasswords, PASSWORD_MISMATCH, strongPassword } from '@/core/password';
import { personName, phoneNumber } from '@/core/person';
import { z } from '@/core/validation';

// Rules mirror Jungo's request contract (OpenAPI x-validation), so most errors show before a round trip.
export const PAGE_SIZES = [10, 20, 30, 40, 50] as const;
const MAX_ROLE_FILTERS = 20;

const name = personName;
const phone = phoneNumber;
const status = z.enum(['active', 'inactive']);
const roleUuids = z.array(z.uuid()).max(100);

export const createUserSchema = z
  .object({
    first_name: name,
    last_name: name,
    email: z.email().max(150),
    password: strongPassword,
    confirm_password: z.string(),
    phone_number: z
      .literal('')
      .transform(() => undefined)
      .or(phone),
    status,
    role_uuids: roleUuids.optional(),
  })
  .refine(matchingPasswords, PASSWORD_MISMATCH);

// status and role_uuids are absent when the admin edits themself: Jungo refuses both changes then.
export const updateUserSchema = z.object({
  first_name: name,
  last_name: name,
  phone_number: z.literal('').or(phone),
  status: status.optional(),
  role_uuids: roleUuids.optional(),
});

// Bad query values fall back to defaults instead of failing the page.
export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  page_size: z.coerce
    .number()
    .pipe(z.union(PAGE_SIZES.map((size) => z.literal(size))))
    .catch(PAGE_SIZES[0]),
  search: z.string().trim().max(100).catch(''),
  sort_by: z.enum(['created_at', 'email', 'first_name', 'last_name', 'status']).catch('created_at'),
  status: status.optional().catch(undefined),
  // A single ?role_uuid= arrives as a string, repeated ones as a list; malformed uuids are dropped.
  role_uuid: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => [value ?? []].flat().filter((uuid) => z.uuid().safeParse(uuid).success))
    .pipe(z.array(z.string()).max(MAX_ROLE_FILTERS))
    .catch([]),
  sort_order: z.enum(['asc', 'desc']).catch('desc'),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;
