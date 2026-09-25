"use client";

import { useAppSelector } from "@/redux/hooks";
import { translations } from "./translations";

export const useTranslation = () => {
  const language = useAppSelector((state) => state.language.language);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  return { t, language };
};