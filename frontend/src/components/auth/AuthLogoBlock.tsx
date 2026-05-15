import { useTranslation } from "react-i18next";

export default function AuthLogoBlock() {
  const { t } = useTranslation();
  return (
    <div className="mb-6 flex flex-col items-center gap-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-600 text-white shadow-sm">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 8h1a4 4 0 110 8h-1" />
          <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-sage-800">{t("app_name")}</p>
        <p className="text-xs text-sage-500">{t("app_tagline")}</p>
      </div>
    </div>
  );
}
