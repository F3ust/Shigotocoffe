import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-sage-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative gradient border top */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sage-500 to-sage-700" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-sage-50 text-gray-400 hover:text-gray-600 hover:bg-sage-100 transition-colors"
        >
          ✕
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mt-4">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 border border-sage-100 shadow-sm text-2xl">
            🔒
          </div>
          <h3 className="text-lg font-bold text-gray-900 leading-snug">
            {t("loginModal.title")}
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-[240px]">
            {t("loginModal.description")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/login"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center rounded-xl bg-sage-600 py-3 text-sm font-bold text-white shadow-md hover:bg-sage-700 transition-colors"
          >
            🔑 {t("loginModal.login_btn")}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center rounded-xl border border-sage-200 bg-white py-3 text-sm font-semibold text-sage-700 hover:bg-sage-50 transition-colors shadow-sm"
          >
            {t("loginModal.close_btn")}
          </button>
        </div>
      </div>
    </div>
  );
}
