const MAX_CODE_LENGTH = 50;

// toRoleCode suggests a role code from its name in Jungo's format (lowercase letters and underscores):
// "Biên tập viên" -> "bien_tap_vien".
export function toRoleCode(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, MAX_CODE_LENGTH)
    .replace(/_+$/, '');
}
