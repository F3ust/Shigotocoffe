import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-cream-50 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-gray-500">{t("footer.copyright")}</p>
        <div className="flex gap-6">
          <a
            href="/terms"
            className="text-sm text-sage-600 transition-colors hover:text-sage-800 hover:underline"
          >
            {t("footer.terms")}
          </a>
          <a
            href="/privacy"
            className="text-sm text-sage-600 transition-colors hover:text-sage-800 hover:underline"
          >
            {t("footer.privacy")}
          </a>
        </div>
      </div>
    </footer>
  );
}
