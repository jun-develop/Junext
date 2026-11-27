import 'server-only';
import { z } from '@/core/validation';

// "false" must not coerce to true, so booleans are parsed from the literal strings.
const bool = (fallback: boolean) =>
  z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? fallback : v === 'true'));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JUNGO_API_URL: z.url(),
  JUNGO_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  COOKIE_SECURE: bool(process.env.NODE_ENV === 'production'),
  TRUST_PROXY_HEADERS: bool(false),
  DEFAULT_LOCALE: z.string().min(2).default('en'),
  DEFAULT_TIME_ZONE: z.string().min(1).default('Asia/Ho_Chi_Minh'),
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = schema.safeParse(source);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.code}`);
    throw new Error(`Invalid environment variables (see .env.example):\n${lines.join('\n')}`);
  }
  return result.data;
}

export const env = parseEnv(process.env);
