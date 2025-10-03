import { emailNotificationsVi } from './email-notifications.vi';
import { emailNotificationsEn } from './email-notifications.en';

export const translations = {
  vi: {
    emailNotifications: emailNotificationsVi,
  },
  en: {
    emailNotifications: emailNotificationsEn,
  },
};

export type TranslationLanguage = 'vi' | 'en';
export type TranslationKey = string;
