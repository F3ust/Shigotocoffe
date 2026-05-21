import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  fetchUserProfile,
  updateUserProfile,
  getAuthUser,
  getAuthToken,
} from "../services/api";

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLoggedIn = getAuthToken() !== null;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [isLoggedIn, navigate]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUserProfile();
      if (res && res.data) {
        setName(res.data.name);
        setEmail(res.data.email);
        setRole(res.data.role);
      }
    } catch (err: any) {
      console.error(err);
      setError(t("cafeDetail.error_load"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      await updateUserProfile({ name, email });
      setSuccessMessage(t("profile.success_update"));
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || t("profile.error_update"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset fields
    const user = getAuthUser();
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden">
          {/* Header Accent */}
          <div className="h-2 bg-sage-600" />

          <div className="p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight text-center">
              {t("profile.title")}
            </h1>

            {successMessage && (
              <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700 border border-green-200/80 shadow-sm">
                🍃 {successMessage}
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200 shadow-sm">
                ⚠️ {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-300 border-t-transparent" />
                <span className="mt-3 text-sm text-gray-500">{t("cafe.loading")}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("profile.name")}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 transition-all"
                    />
                  ) : (
                    <div className="w-full rounded-xl border border-transparent bg-sage-50/40 px-3.5 py-2.5 text-sm text-gray-800 font-medium">
                      {name}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("profile.email")}
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 transition-all"
                    />
                  ) : (
                    <div className="w-full rounded-xl border border-transparent bg-sage-50/40 px-3.5 py-2.5 text-sm text-gray-800 font-medium">
                      {email}
                    </div>
                  )}
                </div>

                {/* Role (Read-only always) */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("auth.role")}
                  </label>
                  <div className="w-full rounded-xl border border-transparent bg-sage-50/40 px-3.5 py-2.5 text-sm text-gray-500 font-semibold uppercase tracking-wider">
                    {role === "owner" ? t("auth.role_owner") : t("auth.role_user")}
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 border-t border-sage-50 flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 inline-flex items-center justify-center rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sage-700 transition-colors disabled:opacity-50"
                      >
                        {submitting ? t("auth.submitting") : t("profile.save")}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={submitting}
                        className="flex-1 inline-flex items-center justify-center rounded-xl border border-sage-200 bg-white px-4 py-3 text-sm font-semibold text-sage-700 shadow-sm hover:bg-sage-50 transition-colors disabled:opacity-50"
                      >
                        {t("profile.cancel")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full inline-flex items-center justify-center rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sage-700 transition-colors"
                    >
                      {t("profile.edit")}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
