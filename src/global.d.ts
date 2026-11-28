import type authMessages from './features/auth/messages/en.json';
import type usersMessages from './features/users/messages/en.json';
import type messages from './messages/en.json';
import type { Locale } from './i18n/config';

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages & typeof authMessages & typeof usersMessages;
  }
}
