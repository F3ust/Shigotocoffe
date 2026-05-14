import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-5xl">☕</p>
      <h1 className="mt-6 text-xl font-bold text-sage-800">
        {t("errors.not_found_title")}
      </h1>
      <p className="mt-3 text-base text-gray-600">
        {t("errors.not_found_body")}
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-lg bg-sage-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-700"
      >
        {t("cafeDetail.back_home")}
      </Link>
    </div>
  );
}
