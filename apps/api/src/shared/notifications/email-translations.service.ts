import { Injectable } from '@nestjs/common';
import { translations, TranslationLanguage } from './translations';

@Injectable()
export class EmailTranslationsService {
  private translations = translations;

  constructor() {
    console.log(
      `[EmailTranslations] Constructor called - Using built-in translations`,
    );
    console.log(`[EmailTranslations] Translations structure:`, {
      hasVi: !!this.translations.vi,
      hasEn: !!this.translations.en,
      viKeys: this.translations.vi ? Object.keys(this.translations.vi) : [],
      enKeys: this.translations.en ? Object.keys(this.translations.en) : [],
      viEmailNotifications: this.translations.vi?.emailNotifications
        ? Object.keys(this.translations.vi.emailNotifications)
        : [],
      enEmailNotifications: this.translations.en?.emailNotifications
        ? Object.keys(this.translations.en.emailNotifications)
        : [],
    });
  }

  /**
   * Get translation for a specific key and language
   */
  getTranslation(key: string, language: TranslationLanguage = 'en'): string {
    console.log(
      `[EmailTranslations.getTranslation] Key: ${key}, Language: ${language}`,
    );
    try {
      const keys = key.split('.');
      let result: any = this.translations[language];

      console.log(`[EmailTranslations.getTranslation] Translations loaded:`, {
        vi: !!this.translations.vi,
        en: !!this.translations.en,
      });

      for (const k of keys) {
        console.log(
          `[EmailTranslations.getTranslation] Looking for key: ${k}, result before:`,
          result,
        );
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
          console.log(
            `[EmailTranslations.getTranslation] Found key: ${k}, result after:`,
            result,
          );
        } else {
          console.log(`[EmailTranslations.getTranslation] Key not found: ${k}`);
          // Fallback to English if key not found in target language
          if (language !== 'en') {
            console.log(
              `[EmailTranslations.getTranslation] Falling back to English`,
            );
            return this.getTranslation(key, 'en');
          }
          console.log(
            `[EmailTranslations.getTranslation] Returning key as-is: ${key}`,
          );
          return key; // Return key if not found in English either
        }
      }

      const finalResult = typeof result === 'string' ? result : key;
      console.log(
        `[EmailTranslations.getTranslation] Final result: ${finalResult}`,
      );
      return finalResult;
    } catch (error) {
      console.error(
        '[EmailTranslations.getTranslation] Error getting translation:',
        error,
      );
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
    language: TranslationLanguage = 'en',
  ): string {
    console.log(
      `[EmailTranslations.getEmailTranslation] Key: ${key}, Language: ${language}, Placeholders:`,
      placeholders,
    );
    const translation = this.getTranslation(key, language);
    console.log(
      `[EmailTranslations.getEmailTranslation] Raw translation: ${translation}`,
    );
    const finalTranslation = this.replacePlaceholders(
      translation,
      placeholders,
    );
    console.log(
      `[EmailTranslations.getEmailTranslation] Final translation: ${finalTranslation}`,
    );
    return finalTranslation;
  }
}
