import { describe, expect, it } from 'vitest';
import { avatarSchema } from './person';

describe('avatarSchema', () => {
  it.each([
    ['a small PNG', new File(['x'], 'a.png', { type: 'image/png' }), true],
    ['a GIF', new File(['x'], 'a.gif', { type: 'image/gif' }), false],
    [
      'a 6 MB JPEG',
      new File([new Uint8Array(6 * 1024 * 1024)], 'a.jpg', { type: 'image/jpeg' }),
      false,
    ],
  ])('%s -> %s', (_, file, isValid) => {
    expect(avatarSchema.safeParse(file).success).toBe(isValid);
  });
});
