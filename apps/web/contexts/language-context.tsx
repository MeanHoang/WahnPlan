"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Định nghĩa các ngôn ngữ được hỗ trợ
export type SupportedLanguage = "en" | "vi";

// Định nghĩa interface cho translations
export interface Translations {
  [key: string]: string | Translations;
}

// Định nghĩa interface cho LanguageContext
interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  translations: Translations | null;
  loading: boolean;
}

// Tạo context
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Props cho LanguageProvider
interface LanguageProviderProps {
  children: ReactNode;
}

// LanguageProvider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [loading, setLoading] = useState(true);

  // Load translations khi language thay đổi
  useEffect(() => {
    const loadTranslations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/locale/${language}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${language}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Error loading translations:", error);
        // Fallback về tiếng Anh nếu có lỗi
        if (language !== "en") {
          const fallbackResponse = await fetch("/locale/en.json");
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setTranslations(fallbackData);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  // Load ngôn ngữ từ localStorage khi component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "preferred-language"
    ) as SupportedLanguage;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "vi")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Hàm để thay đổi ngôn ngữ và lưu vào localStorage
  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    localStorage.setItem("preferred-language", newLanguage);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    translations,
    loading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook để sử dụng LanguageContext
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Hook để lấy translation
export const useTranslation = () => {
  const { translations, loading } = useLanguage();

  const t = (key: string, fallback?: string): string => {
    if (loading || !translations) {
      return fallback || key;
    }

    const keys = key.split(".");
    let result: any = translations;

    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k];
      } else {
        return fallback || key;
      }
    }

    return typeof result === "string" ? result : fallback || key;
  };

  return { t, loading };
};
