import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailTranslationsService {
  private translations: {
    vi: any;
    en: any;
  } = {
    vi: null,
    en: null,
  };

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations() {
    try {
      // Load Vietnamese translations
      const viPath = path.join(process.cwd(), 'apps/web/public/locale/vi.json');
      const viTranslations = JSON.parse(fs.readFileSync(viPath, 'utf8'));
      this.translations.vi = viTranslations;

      // Load English translations
      const enPath = path.join(process.cwd(), 'apps/web/public/locale/en.json');
      const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      this.translations.en = enTranslations;
    } catch (error) {
      console.error('Error loading email translations:', error);
    }
  }

  /**
   * Get translation for a specific key and language
   */
  getTranslation(key: string, language: 'vi' | 'en' = 'en'): string {
    try {
      const keys = key.split('.');
      let result: any = this.translations[language];

      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          // Fallback to English if key not found in target language
          if (language !== 'en') {
            return this.getTranslation(key, 'en');
          }
          return key; // Return key if not found in English either
        }
      }

      return typeof result === 'string' ? result : key;
    } catch (error) {
      console.error('Error getting translation:', error);
      return key;
    }
  }

  /**
   * Replace placeholders in translation string
   */
  replacePlaceholders(
    translation: string,
    placeholders: Record<string, string | number>,
  ): string {
    let result = translation;
    for (const [key, value] of Object.entries(placeholders)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }
    return result;
  }

  /**
   * Get email notification translation with placeholders replaced
   */
  getEmailTranslation(
    key: string,
    placeholders: Record<string, string | number> = {},
    language: 'vi' | 'en' = 'en',
  ): string {
    const translation = this.getTranslation(key, language);
    return this.replacePlaceholders(translation, placeholders);
  }
}
