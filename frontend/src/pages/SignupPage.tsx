import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAuthErrorMessage, registerUser } from "../services/api";

export default function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    if (!name.trim()) next.name = t("auth.error_required");
    if (!email.trim()) next.email = t("auth.error_required");
    if (!password) next.password = t("auth.error_required");
    if (!confirmPassword) next.confirmPassword = t("auth.error_required");
    else if (password !== confirmPassword) next.confirmPassword = t("auth.error_password_mismatch");
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await registerUser({ name: name.trim(), email: email.trim(), password });
      navigate("/", { replace: true });
    } catch (err) {
      const msg = getAuthErrorMessage(err);
      setApiError(msg ?? t("auth.error_generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-cream-100/80 px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-sage-200/60 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-center text-2xl font-bold text-sage-800">
            {t("auth.signup_title")}
          </h1>
          <p className="mt-1 text-center text-sm text-sage-600">
            {t("auth.signup_subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {apiError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                {apiError}
              </p>
            )}

            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700">
                {t("auth.name")}
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder={t("auth.name_placeholder")}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                {t("auth.email")}
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder={t("auth.email_placeholder")}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                {t("auth.password")}
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                }}
                placeholder={t("auth.password_placeholder")}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                {t("auth.confirm_password")}
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword)
                    setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
                }}
                placeholder={t("auth.confirm_password_placeholder")}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-sage-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t("auth.submitting") : t("auth.submit_signup")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-sage-600">
            {t("auth.have_account")}{" "}
            <Link to="/login" className="font-semibold text-sage-700 underline-offset-2 hover:underline">
              {t("auth.link_to_login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
