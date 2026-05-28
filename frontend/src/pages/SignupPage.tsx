import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLogoBlock from "../components/auth/AuthLogoBlock";
import AuthField from "../components/auth/AuthField";
import PasswordField from "../components/auth/PasswordField";
import RoleRadioGroup from "../components/auth/RoleRadioGroup";
import { getAuthErrorMessage, registerUser } from "../services/api";

export default function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"user" | "owner">("user");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
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
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      navigate("/login", { replace: true });
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
          id="signup-back"
          onClick={handleBack}
          className="mb-2 text-sm font-medium text-sage-700 hover:text-sage-900"
        >
          ← {t("auth.back")}
        </button>

        <AuthLogoBlock />

        <h1 className="text-center text-2xl font-bold text-sage-800">{t("auth.signup_title")}</h1>
        <p className="mt-1 text-center text-sm text-sage-600">{t("auth.signup_subtitle")}</p>

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
            id="signup-name"
            label={t("auth.name")}
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
            }}
            placeholder={t("auth.name_placeholder")}
            error={fieldErrors.name}
          />

          <AuthField
            id="signup-email"
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

          <RoleRadioGroup value={role} onChange={setRole} />

          <PasswordField
            id="signup-password"
            label={t("auth.password")}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder={t("auth.password_placeholder")}
            error={fieldErrors.password}
          />

          <PasswordField
            id="signup-confirm-password"
            label={t("auth.confirm_password")}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword)
                setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
            }}
            placeholder={t("auth.confirm_password_placeholder")}
            error={fieldErrors.confirmPassword}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? t("auth.submitting") : t("auth.submit_signup")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-sage-600">
          {t("auth.have_account")}{" "}
          <Link
            to="/login"
            className="font-semibold text-sage-700 underline-offset-2 hover:underline"
          >
            {t("auth.link_to_login")}
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-sage-500">
          <a id="signup-terms" href="#" className="underline-offset-2 hover:underline">
            {t("auth.terms")}
          </a>
          <span className="mx-2">·</span>
          <a id="signup-privacy" href="#" className="underline-offset-2 hover:underline">
            {t("auth.privacy")}
          </a>
        </p>
      </div>
    </div>
  );
}
