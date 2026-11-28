import { z } from '@/core/validation';

// Rules mirror Jungo's request contract (OpenAPI x-validation), so most errors show before a round trip.
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;
const STRONG_PASSWORD_PATTERN =
  /^(?=[\s\S]*[a-z])(?=[\s\S]*[A-Z])(?=[\s\S]*[0-9])(?=[\s\S]*[!@#$%^&*()_+\-=[\]{};:'",.<>?/\\|])[\s\S]{8,}$/;
export const PAGE_SIZES = [10, 20, 30, 40, 50] as const;

const name = z.string().trim().min(2).max(50);
const phone = z.string().trim().regex(PHONE_PATTERN, 'users.phone_rule');

export const createUserSchema = z.object({
  first_name: name,
  last_name: name,
  email: z.email().max(150),
  password: z.string().min(8).max(72).regex(STRONG_PASSWORD_PATTERN, 'users.password_rule'),
  phone_number: z
    .literal('')
    .transform(() => undefined)
    .or(phone),
});

export const updateUserSchema = z.object({
  first_name: name,
  last_name: name,
  phone_number: z.literal('').or(phone),
  status: z.enum(['active', 'inactive']),
});

export type UserFormValues = Partial<
  Record<keyof z.input<typeof createUserSchema> | 'status', string>
>;

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
