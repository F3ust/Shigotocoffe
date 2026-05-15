import { useTranslation } from "react-i18next";

export default function AuthLogoBlock() {
  const { t } = useTranslation();
  return (
    <div className="mb-6 flex flex-col items-center gap-2">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-600 text-white shadow-md">
        <img src="/logo-mark-inverse.svg" alt="" className="h-9 w-9" width={36} height={36} />
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-sage-800">{t("app_name")}</p>
        <p className="text-xs text-sage-500">{t("app_tagline")}</p>
      </div>
    </div>
  );
}
