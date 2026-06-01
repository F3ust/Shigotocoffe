import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  createCafe,
  getAuthUser,
  getAuthToken,
} from "../services/api";
import CafeForm from "../components/cafe/CafeForm";

export default function CafeManagePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const currentUser = getAuthUser();
  const isLoggedIn = getAuthToken() !== null;

  const [error, setError] = useState<string | null>(null);

  // Auth check: only owners
  if (!isLoggedIn || currentUser?.role !== "owner") {
    navigate("/");
    return null;
  }

  const handleCreateSubmit = async (data: any) => {
    setError(null);
    try {
      await createCafe(data);
      // Navigate back to profile (cafe list) after creating
      navigate("/profile");
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("auth.error_generic");
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4 border-b border-sage-200/60 pb-6">
          <button
            onClick={handleCancel}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-sage-200 bg-white text-sage-700 hover:bg-sage-50 transition-colors shadow-sm"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {t("manage.create_title")}
            </h1>
            <p className="mt-0.5 text-sm text-sage-600">{t("manage.my_cafes")}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200 shadow-sm">
            ⚠️ {error}
          </div>
        )}

        <CafeForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
