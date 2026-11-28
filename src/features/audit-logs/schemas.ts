import { z } from '@/core/validation';

export const PAGE_SIZES = [10, 20, 50, 100] as const;
export const ENTITY_TYPES = ['users', 'roles'] as const;
export const AUDIT_ACTIONS = [
  'create',
  'update',
  'delete',
  'set_roles',
  'change_password',
] as const;

const actions = z.enum(AUDIT_ACTIONS);
// The date filter sends instants computed in the viewer's time zone; anything else is dropped.
const instant = z.iso.datetime({ offset: true }).optional().catch(undefined);

// Unknown or malformed URL values fall back to defaults, so a hand-edited link still renders.
export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  page_size: z.coerce
    .number()
    .pipe(z.union(PAGE_SIZES.map((size) => z.literal(size))))
    .catch(PAGE_SIZES[1]),
  search: z.string().trim().max(100).catch(''),
  entity_type: z.enum(ENTITY_TYPES).optional().catch(undefined),
  entity_id: z.string().max(64).optional().catch(undefined),
  // A single ?action= arrives as a string, repeated ones as a list; unknown actions are dropped.
  action: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => [value ?? []].flat().filter((entry) => actions.safeParse(entry).success))
    .pipe(z.array(actions))
    .catch([]),
  from: instant,
  to: instant,
  sort_order: z.enum(['asc', 'desc']).catch('desc'),
});

export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
