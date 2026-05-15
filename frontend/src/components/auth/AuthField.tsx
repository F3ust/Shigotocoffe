import type { InputHTMLAttributes, ReactNode } from "react";

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: ReactNode;
  error?: string;
}

export default function AuthField({
  id,
  label,
  error,
  className = "",
  ...inputProps
}: AuthFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className={`mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 ${className}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
