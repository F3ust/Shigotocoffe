import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLogoBlock from "../components/auth/AuthLogoBlock";
import AuthField from "../components/auth/AuthField";
import PasswordField from "../components/auth/PasswordField";
import { getAuthErrorMessage, loginUser } from "../services/api";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = t("auth.error_required");
    if (!password) next.password = t("auth.error_required");
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await loginUser({ email: email.trim(), password });
      navigate("/", { replace: true });
    } catch (err) {
      const msg = getAuthErrorMessage(err);
      setApiError(msg ? t(`auth_errors.${msg}`, msg) : t("auth.error_generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-sage-200/70 bg-white/95 p-6 shadow-lg backdrop-blur-sm sm:p-8">
        <button
          type="button"
          id="login-back"
          onClick={handleBack}
          className="mb-2 text-sm font-medium text-sage-700 hover:text-sage-900"
        >
          ← {t("auth.back")}
        </button>

        <AuthLogoBlock />

        <h1 className="text-center text-2xl font-bold text-sage-800">{t("auth.login_title")}</h1>
        <p className="mt-1 text-center text-sm text-sage-600">{t("auth.login_subtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {apiError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {apiError}
            </p>
          )}

          <AuthField
            id="login-email"
            label={t("auth.email")}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder={t("auth.email_placeholder")}
            error={fieldErrors.email}
          />

          <PasswordField
            id="login-password"
            label={t("auth.password")}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder={t("auth.password_placeholder")}
            error={fieldErrors.password}
          />

          <div className="text-right">
            <a
              id="login-forgot-password"
              href="#"
              className="text-sm font-medium text-sage-700 underline-offset-2 hover:underline"
            >
              {t("auth.forgot_password")}
            </a>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? t("auth.submitting") : t("auth.submit_login")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-sage-600">
          {t("auth.no_account")}{" "}
          <Link
            to="/register"
            className="font-semibold text-sage-700 underline-offset-2 hover:underline"
          >
            {t("auth.link_to_signup")}
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-sage-500">
          <a id="login-terms" href="#" className="underline-offset-2 hover:underline">
            {t("auth.terms")}
          </a>
          <span className="mx-2">·</span>
          <a id="login-privacy" href="#" className="underline-offset-2 hover:underline">
            {t("auth.privacy")}
          </a>
        </p>
      </div>
    </div>
  );
}
