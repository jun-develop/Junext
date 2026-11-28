import { describe, expect, it } from 'vitest';
import { PASSWORD_RULES, strongPassword } from './password';

describe('PASSWORD_RULES', () => {
  it.each(['Str0ng!pass', 'password1', 'PASSWORD!1', 'Short1!', 'NoSymbol12', 'ÀBc1!xyzz'])(
    'agrees with strongPassword for %s',
    (password) => {
      const passesRules = PASSWORD_RULES.every((rule) => rule.pattern.test(password));
      expect(passesRules).toBe(strongPassword.safeParse(password).success);
    },
  );
});
