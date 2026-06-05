import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import {
  fetchUserProfile,
  updateUserProfile,
  getAuthUser,
  getAuthToken,
  fetchFavorites,
  removeFavorite,
  fetchCafes,
  deleteCafe,
  createCafe,
} from "../services/api";
import type { Cafe } from "../types/cafe";
import CafeForm from "../components/cafe/CafeForm";

// ─── helpers ────────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < full ? "text-amber-400" : "text-gray-300"}
          style={{ fontSize: "0.85rem" }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

// ─── Profile Card ────────────────────────────────────────────────────────────

function ProfileCard() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile()
      .then((res) => {
        if (res?.data) {
          setName(res.data.name);
          setEmail(res.data.email);
          setRole(res.data.role);
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateUserProfile({ name, email });
      setSuccess(t("profile.success_update"));
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err?.response?.data?.message || t("profile.error_update"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    const u = getAuthUser();
    if (u) { setName(u.name); setEmail(u.email); }
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="rounded-2xl border border-sage-100 bg-white shadow-sm overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-sage-500 to-sage-700" />
      <div className="p-6">
        {/* Avatar placeholder */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-sage-100 border-2 border-sage-200 flex items-center justify-center shadow-sm">
            <svg className="w-8 h-8 text-sage-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12a5 5 0 110-10 5 5 0 010 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
              {role === "owner" ? t("auth.role_owner") : t("auth.role_user")}
            </p>
            <p className="font-bold text-gray-900 text-base leading-tight">{name}</p>
            <p className="text-sm text-gray-400">{email}</p>
          </div>
        </div>

        <div className="text-xs font-bold text-sage-700 uppercase tracking-wider border-b border-sage-100 pb-2 mb-4">
          {role === "owner" ? t("auth.role_owner") : t("auth.role_user")}
        </div>

        {success && (
          <div className="mb-4 rounded-xl bg-green-50 p-3 text-xs font-medium text-green-700 border border-green-200">
            🍃 {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
            ⚠️ {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t("profile.name")}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-sage-200 px-3 py-2 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t("profile.email")}</label>
              <input
                type="email"
                required
                disabled
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-sage-100 bg-gray-100 text-gray-400 px-3 py-2 text-sm cursor-not-allowed outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-sage-600 py-2 text-sm font-semibold text-white hover:bg-sage-700 transition-colors disabled:opacity-50"
              >
                {submitting ? t("auth.submitting") : t("profile.save")}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-xl border border-sage-200 bg-white py-2 text-sm font-semibold text-sage-700 hover:bg-sage-50 transition-colors"
              >
                {t("profile.cancel")}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-sage-200 bg-white px-6 py-2 text-sm font-semibold text-sage-700 hover:bg-sage-50 transition-colors shadow-sm cursor-pointer"
            >
              ✏️ {t("profile.edit")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Owner Cafe List ─────────────────────────────────────────────────────────

function OwnerCafeList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "ja" | "vi";
  const navigate = useNavigate();
  const currentUser = getAuthUser();

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCafes({ limit: "100" });
      if (res?.data) {
        const owned = res.data.filter((c: any) => {
          const ownerId =
            typeof c.owner === "object" && c.owner !== null
              ? c.owner._id
              : c.owner;
          return ownerId === currentUser?._id;
        });
        setCafes(owned);
      }
    } catch {
      setError(t("cafe.list_error"));
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id, t]);

  useEffect(() => { load(); }, [load, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("manage.delete_confirm"))) return;
    try {
      await deleteCafe(id);
      setSuccess(t("manage.success_delete"));
      setCafes((prev) => prev.filter((c) => c._id !== id));
      setTimeout(() => setSuccess(null), 3500);
    } catch {
      setError(t("auth.error_generic"));
    }
  };

  return (
    <div className="rounded-2xl border border-sage-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-sage-50">
        <span className="text-sage-600">🍃</span>
        <h2 className="text-base font-bold text-gray-900">{t("manage.my_cafes")}</h2>
      </div>

      {success && (
        <div className="mx-4 mt-4 rounded-xl bg-green-50 p-3 text-xs font-medium text-green-700 border border-green-200">
          🍃 {success}
        </div>
      )}
      {error && (
        <div className="mx-4 mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-300 border-t-transparent" />
        </div>
      ) : cafes.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">☕</p>
          <p className="text-gray-500 text-sm">{t("manage.no_cafes")}</p>
        </div>
      ) : (
        <div className="divide-y divide-sage-50">
          {cafes.map((cafe) => (
            <div
              key={cafe._id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-sage-50/50 transition-colors"
            >
              {/* Thumbnail */}
              <div
                className="w-16 h-16 rounded-xl overflow-hidden bg-cream-100 border border-sage-100 flex-shrink-0 cursor-pointer"
                onClick={() => navigate(`/cafes/${cafe._id}`)}
              >
                <img
                  src={
                    cafe.images?.[0] ||
                    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200"
                  }
                  alt={cafe.name[lang]}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/cafes/${cafe._id}`)}
              >
                <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                  {cafe.name[lang] || cafe.name.vi}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {cafe.district}, Hà Nội
                </p>
              </div>

              {/* Rating */}
              <div className="flex-shrink-0 text-right mr-2">
                <StarRow rating={cafe.averageRating} />
                <p className="text-sm font-bold text-gray-800 mt-0.5">
                  {cafe.averageRating.toFixed(1)}
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(cafe._id)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors shadow-sm"
              >
                🗑️ {t("manage.remove")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── User Favorites List ─────────────────────────────────────────────────────

function UserFavoritesList() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "ja" | "vi";
  const navigate = useNavigate();

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFavorites();
      setCafes(res.data);
    } catch {
      setError(t("cafe.list_error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const handleRemove = async (id: string) => {
    try {
      await removeFavorite(id);
      setCafes((prev) => prev.filter((c) => c._id !== id));
    } catch {
      console.error("Failed to remove favorite");
    }
  };

  return (
    <div className="rounded-2xl border border-sage-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-sage-50">
        <span className="text-rose-500">❤️</span>
        <h2 className="text-base font-bold text-gray-900">{t("sprint4.favorites_title")}</h2>
      </div>

      {error && (
        <div className="mx-4 mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-300 border-t-transparent" />
        </div>
      ) : cafes.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">❤️</p>
          <p className="text-gray-500 text-sm mb-4">{t("sprint4.no_favorites")}</p>
          <Link
            to="/"
            className="inline-flex rounded-xl bg-sage-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sage-700 transition-colors"
          >
            {t("cafeDetail.back_home")}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-sage-50">
          {cafes.map((cafe) => (
            <div
              key={cafe._id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-sage-50/50 transition-colors"
            >
              {/* Thumbnail */}
              <div
                className="w-16 h-16 rounded-xl overflow-hidden bg-cream-100 border border-sage-100 flex-shrink-0 cursor-pointer"
                onClick={() => navigate(`/cafes/${cafe._id}`)}
              >
                <img
                  src={
                    cafe.images?.[0] ||
                    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200"
                  }
                  alt={cafe.name[lang]}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/cafes/${cafe._id}`)}
              >
                <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                  {cafe.name[lang] || cafe.name.vi}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {cafe.district}, Hà Nội
                </p>
              </div>

              {/* Rating */}
              <div className="flex-shrink-0 text-right mr-2">
                <StarRow rating={cafe.averageRating} />
                <p className="text-sm font-bold text-gray-800 mt-0.5">
                  {cafe.averageRating.toFixed(1)}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => handleRemove(cafe._id)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors shadow-sm"
              >
                🗑️ {t("manage.remove")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = getAuthUser();
  const isLoggedIn = getAuthToken() !== null;
  const isOwner = currentUser?.role === "owner";

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <div
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&q=60')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" style={{ zIndex: 0 }} />

      <div className="relative mx-auto max-w-6xl" style={{ zIndex: 1 }}>
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl uppercase">
            {isOwner ? t("manage.title") : t("sprint4.favorites_title")}
          </h1>
          {isOwner && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-sage-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-sage-700 transition-colors"
            >
              + {t("manage.add_new_cafe")}
            </button>
          )}
        </div>

        {/* Content: Profile Card (left) + List (right) */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          {/* Left: Profile card */}
          <ProfileCard />

          {/* Right: cafe list or favorites list */}
          {isOwner ? <OwnerCafeList refreshTrigger={refreshTrigger} /> : <UserFavoritesList />}
        </div>
      </div>

      {/* Create Cafe Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-cream-100 rounded-3xl p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-sage-200 text-gray-500 hover:text-gray-700 hover:bg-sage-50 transition-colors shadow-sm text-lg font-bold z-10"
            >
              ✕
            </button>
            <div className="mt-4">
              <CafeForm
                onSubmit={async (data) => {
                  await createCafe(data);
                  setIsCreateModalOpen(false);
                  setRefreshTrigger((prev) => prev + 1);
                }}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
