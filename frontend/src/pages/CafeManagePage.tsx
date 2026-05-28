import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  fetchCafes,
  createCafe,
  updateCafe,
  deleteCafe,
  getAuthUser,
  getAuthToken,
} from "../services/api";
import type { Cafe } from "../types/cafe";
import CafeForm from "../components/cafe/CafeForm";

export default function CafeManagePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language as "ja" | "vi";

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // View state: 'list' | 'create' | 'edit'
  const [viewState, setViewState] = useState<"list" | "create" | "edit">("list");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  const currentUser = getAuthUser();
  const isLoggedIn = getAuthToken() !== null;

  useEffect(() => {
    // Auth check: only owners allowed
    if (!isLoggedIn || currentUser?.role !== "owner") {
      navigate("/");
      return;
    }
    loadCafes();
  }, [isLoggedIn, currentUser?.role, navigate]);

  const loadCafes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all cafes (up to 100) to filter locally by owner ID
      const res = await fetchCafes({ limit: "100" });
      if (res && res.data) {
        const owned = res.data.filter((c: any) => {
          const ownerId = typeof c.owner === "object" && c.owner !== null ? c.owner._id : c.owner;
          return ownerId === currentUser?._id;
        });
        setCafes(owned);
      }
    } catch (err: any) {
      console.error(err);
      setError(t("cafe.list_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (data: any) => {
    try {
      await createCafe(data);
      setSuccessMessage(t("manage.success_create"));
      setViewState("list");
      loadCafes();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("auth.error_generic");
      throw new Error(msg);
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (!selectedCafe) return;
    try {
      await updateCafe(selectedCafe._id, data);
      setSuccessMessage(t("manage.success_update"));
      setViewState("list");
      setSelectedCafe(null);
      loadCafes();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("auth.error_generic");
      throw new Error(msg);
    }
  };

  const handleDelete = async (cafeId: string) => {
    if (!window.confirm(t("manage.delete_confirm"))) return;
    setError(null);
    try {
      await deleteCafe(cafeId);
      setSuccessMessage(t("manage.success_delete"));
      loadCafes();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError(t("auth.error_generic"));
    }
  };

  const handleEditClick = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setViewState("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateClick = () => {
    setViewState("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setViewState("list");
    setSelectedCafe(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-sage-200/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {t("manage.title")}
            </h1>
            <p className="mt-2 text-sm text-sage-600">
              {t("manage.my_cafes")}
            </p>
          </div>
          {viewState === "list" && (
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center justify-center rounded-xl bg-sage-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sage-700 focus:outline-none hover:shadow-md active:scale-95"
            >
              + {t("manage.add_new_cafe")}
            </button>
          )}
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700 border border-green-200/80 shadow-sm animate-fade-in">
            🍃 {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200 shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {/* List View */}
        {viewState === "list" && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-sage-300 border-t-transparent" />
                <span className="ml-3 text-gray-500">{t("cafe.loading")}</span>
              </div>
            ) : cafes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-sage-100 p-12 text-center shadow-sm">
                <p className="text-5xl mb-4">☕</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t("manage.no_cafes")}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {t("manage.no_cafes")}
                </p>
                <button
                  onClick={handleCreateClick}
                  className="inline-flex items-center justify-center rounded-xl bg-sage-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage-700 focus:outline-none"
                >
                  {t("manage.add_new_cafe")}
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {cafes.map((cafe) => (
                  <div
                    key={cafe._id}
                    className="flex flex-col bg-white rounded-2xl border border-sage-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Cafe image or placeholder */}
                    <div className="relative h-48 w-full bg-sage-50 overflow-hidden">
                      <img
                        src={cafe.images?.[0] || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600"}
                        alt={cafe.name[lang] || cafe.name.ja}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-sage-800 shadow-sm border border-sage-100">
                        ⭐ {cafe.averageRating?.toFixed(1) || "0.0"} ({cafe.reviewCount || 0})
                      </div>
                    </div>

                    {/* Cafe details */}
                    <div className="flex-1 p-5 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-sage-600 uppercase tracking-wider bg-sage-50 px-2.5 py-1 rounded-md">
                          {cafe.district}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-1">
                          {cafe.name[lang] || cafe.name.ja}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {cafe.description[lang] || cafe.description.ja}
                        </p>
                      </div>

                      <div className="text-xs text-gray-400 border-t border-sage-50 pt-3">
                        🕒 {t("cafe.hours")}: {cafe.openingHours?.open} - {cafe.openingHours?.close}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2 border-t border-sage-50">
                        <button
                          onClick={() => handleEditClick(cafe)}
                          className="flex-1 inline-flex items-center justify-center rounded-lg border border-sage-200 bg-white py-2 text-xs font-semibold text-sage-700 hover:bg-sage-50 transition-colors"
                        >
                          ✏️ {t("profile.edit")}
                        </button>
                        <button
                          onClick={() => handleDelete(cafe._id)}
                          className="flex-1 inline-flex items-center justify-center rounded-lg border border-red-100 bg-white py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          🗑️ {t("manage.remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Create View */}
        {viewState === "create" && (
          <CafeForm
            onSubmit={handleCreateSubmit}
            onCancel={handleCancel}
          />
        )}

        {/* Edit View */}
        {viewState === "edit" && selectedCafe && (
          <CafeForm
            initialData={selectedCafe}
            onSubmit={handleEditSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
