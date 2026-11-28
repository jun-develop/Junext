import { z } from '@/core/validation';

export const SIDEBAR_VARIANT_COOKIE = 'sidebar_variant';
export const SIDEBAR_COLLAPSIBLE_COOKIE = 'sidebar_collapsible';
export const SIDEBAR_VARIANTS = ['inset', 'floating', 'sidebar'] as const;
export const SIDEBAR_COLLAPSIBLES = ['icon', 'offcanvas'] as const;

export const sidebarVariantSchema = z.enum(SIDEBAR_VARIANTS).catch('inset');
export const sidebarCollapsibleSchema = z.enum(SIDEBAR_COLLAPSIBLES).catch('icon');

export type SidebarVariant = z.infer<typeof sidebarVariantSchema>;
export type SidebarCollapsible = z.infer<typeof sidebarCollapsibleSchema>;
