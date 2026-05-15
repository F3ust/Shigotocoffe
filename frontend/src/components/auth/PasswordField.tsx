import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  id: string;
  label: ReactNode;
  error?: string;
}

export default function PasswordField({
  id,
  label,
  error,
  className = "",
  ...inputProps
}: PasswordFieldProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? "text" : "password"}
          {...inputProps}
          className={`w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-11 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 ${className}`}
        />
        <button
          type="button"
          aria-label={visible ? t("auth.hide_password") : t("auth.show_password")}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-sage-700 hover:bg-sage-50"
        >
          {visible ? t("auth.hide_password_short") : t("auth.show_password_short")}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
