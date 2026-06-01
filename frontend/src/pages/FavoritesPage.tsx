import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import CafeCard from "../components/cafe/CafeCard";
import {
  getAuthToken,
  fetchFavorites,
  removeFavorite,
} from "../services/api";
import type { Cafe } from "../types/cafe";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const isLoggedIn = getAuthToken() !== null;

  const loadFavorites = useCallback(async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetchFavorites();
      setCafes(res.data);
    } catch (err) {
      console.error("Failed to load favorites:", err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemoveFavorite = async (cafeId: string) => {
    try {
      await removeFavorite(cafeId);
      setCafes((prev) => prev.filter((c) => c._id !== cafeId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {t("sprint4.favorites_title")}
        </h1>
        <span className="text-rose-500">❤️</span>
      </div>

      {loadError && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-red-800">{t("cafe.list_error")}</p>
          <button
            type="button"
            onClick={loadFavorites}
            className="shrink-0 rounded-lg bg-sage-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sage-700"
          >
            {t("cafe.retry")}
          </button>
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sage-300 border-t-transparent" />
          <span className="ml-3 text-gray-500">{t("cafe.loading")}</span>
        </div>
      )}

      {/* Card grid */}
      {!loading && cafes.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cafes.map((cafe) => (
            <CafeCard
              key={cafe._id}
              cafe={cafe}
              isFavorite={true}
              onToggleFavorite={() => handleRemoveFavorite(cafe._id)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && cafes.length === 0 && (
        <div className="py-20 text-center bg-cream-50 rounded-2xl border border-cream-100/50">
          <p className="text-5xl">❤️</p>
          <p className="mt-4 text-lg font-medium text-gray-500">
            {t("sprint4.no_favorites")}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-sage-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage-700"
          >
            {t("cafeDetail.back_home")}
          </Link>
        </div>
      )}
    </div>
  );
}
