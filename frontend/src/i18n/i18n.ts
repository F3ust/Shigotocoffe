import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "./locales/vi.json";
import ja from "./locales/ja.json";

const savedLang = localStorage.getItem("lang") || "vi";

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    ja: { translation: ja },
  },
  lng: savedLang,
  fallbackLng: "vi",
  interpolation: { escapeValue: false },
});

export default i18n;
