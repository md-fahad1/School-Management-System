"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setLanguage } from "@/redux/slices/languageSlice";

const LanguageSwitcher = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.language.language);

  const toggleLanguage = () => {
    dispatch(setLanguage(language === "en" ? "bn" : "en"));
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-300 text-xs font-medium hover:bg-gray-100 transition"
      title="Change language / ভাষা পরিবর্তন করুন"
    >
      {language === "en" ? "বাংলা" : "English"}
    </button>
  );
};

export default LanguageSwitcher;