import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/cafe/SearchBar";
import FilterPanel from "../components/cafe/FilterPanel";
import CafeCard from "../components/cafe/CafeCard";
import {
  fetchCafes,
  getAuthUser,
  getAuthToken,
  fetchFavorites,
  addFavorite,
  removeFavorite,
} from "../services/api";
import type { Cafe, CafeQueryParams } from "../types/cafe";

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<CafeQueryParams>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const isLoggedIn = getAuthToken() !== null;

  const loadFavorites = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetchFavorites();
      setFavoriteIds(res.data.map((c) => c._id));
    } catch (err) {
      console.error("Failed to load favorites:", err);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleToggleFavorite = async (cafeId: string) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    const isFav = favoriteIds.includes(cafeId);
    try {
      if (isFav) {
        await removeFavorite(cafeId);
        setFavoriteIds((prev) => prev.filter((id) => id !== cafeId));
      } else {
        await addFavorite(cafeId);
        setFavoriteIds((prev) => [...prev, cafeId]);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  useEffect(() => {
    const user = getAuthUser();
    if (user && user.role === "owner") {
      navigate("/manage", { replace: true });
    }
  }, [navigate]);

  const loadCafes = useCallback(async (searchParams: CafeQueryParams) => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetchCafes(searchParams);
      setCafes(response.data);
      setTotal(response.pagination.total);
    } catch (err) {
      console.error("Failed to load cafes:", err);
      setLoadError(true);
      setCafes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCafes(params);
  }, [params, loadCafes]);

  function handleSearch(query: string, district: string) {
    setParams((prev) => ({ ...prev, q: query, district }));
  }

  function handleFilterApply(filters: {
    minRating: string;
    tags: string[];
  }) {
    setParams((prev) => ({
      ...prev,
      minRating: filters.minRating,
      tags: filters.tags.length > 0 ? filters.tags.join(",") : undefined,
    }));
    setFilterOpen(false);
  }

  function handleFilterClear() {
    setParams((prev) => ({
      ...prev,
      minRating: undefined,
      tags: undefined,
    }));
    setFilterOpen(false);
  }

  return (
    <div>
      {/* Hero banner — spec element #7 */}
      <section className="relative overflow-hidden bg-cream-200 py-16 sm:py-24">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1400')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream-100/40 to-cream-200/80" />

        {/* Decorative leaves */}
        <div className="absolute left-0 top-0 h-32 w-32 opacity-20">
          <svg viewBox="0 0 100 100" fill="none" stroke="#4A7C59" strokeWidth="1">
            <path d="M10 90 Q30 50 50 20 Q55 30 60 50 Q40 60 30 80 Z" />
            <path d="M20 80 Q35 60 45 35 Q48 45 52 60 Q40 65 35 75 Z" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 h-32 w-32 rotate-180 opacity-20">
          <svg viewBox="0 0 100 100" fill="none" stroke="#4A7C59" strokeWidth="1">
            <path d="M10 90 Q30 50 50 20 Q55 30 60 50 Q40 60 30 80 Z" />
            <path d="M20 80 Q35 60 45 35 Q48 45 52 60 Q40 65 35 75 Z" />
          </svg>
        </div>

        {/* Title text — spec shows bold, centered, dark text */}
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h1 className="whitespace-pre-line text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {t("hero.title")}
          </h1>
        </div>
      </section>

      {/* Search bar — sits between hero and content, spec elements #8-#11 */}
      <section className="relative z-10 mx-auto -mt-6 max-w-4xl px-4">
        <div className="relative">
          <SearchBar
            onSearch={handleSearch}
            onToggleFilter={() => setFilterOpen(!filterOpen)}
            filterOpen={filterOpen}
          />
          <FilterPanel
            onApply={handleFilterApply}
            onClear={handleFilterClear}
            isOpen={filterOpen}
          />
        </div>
      </section>

      {/* Cafe list — spec elements #13-#18 */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loadError && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-red-800">{t("cafe.list_error")}</p>
            <button
              type="button"
              onClick={() => loadCafes(params)}
              className="shrink-0 rounded-lg bg-sage-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sage-700"
            >
              {t("cafe.retry")}
            </button>
          </div>
        )}
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            {t("cafe.featured")}
          </h2>
          <span className="text-sage-500">🍃</span>
          {!loading && (
            <span className="text-sm text-gray-400">
              ({total})
            </span>
          )}
        </div>

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
                isFavorite={favoriteIds.includes(cafe._id)}
                onToggleFavorite={() => handleToggleFavorite(cafe._id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && cafes.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-5xl">☕</p>
            <p className="mt-4 text-lg font-medium text-gray-500">
              {t("cafe.no_results")}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
