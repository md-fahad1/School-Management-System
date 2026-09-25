import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = "en" | "bn";

interface LanguageState {
  language: Language;
}

const initialState: LanguageState = {
  language: "en",
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("language", action.payload);
      }
    },
    hydrateLanguage: (state) => {
      if (typeof window === "undefined") return;
      const saved = window.localStorage.getItem("language");
      state.language = saved === "bn" ? "bn" : "en";
    },
  },
});

export const { setLanguage, hydrateLanguage } = languageSlice.actions;
export default languageSlice.reducer;