import { useTranslation } from "react-i18next";

interface RoleRadioGroupProps {
  value: "user" | "owner";
  onChange: (role: "user" | "owner") => void;
}

export default function RoleRadioGroup({ value, onChange }: RoleRadioGroupProps) {
  const { t } = useTranslation();

  const options: Array<{ key: "user" | "owner"; label: string }> = [
    { key: "user", label: t("auth.role_user") },
    { key: "owner", label: t("auth.role_owner") },
  ];

  return (
    <fieldset id="signup-role" className="border-0 p-0">
      <legend className="mb-2 block text-sm font-medium text-gray-700">{t("auth.role")}</legend>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {options.map(({ key, label }) => (
          <label
            key={key}
            className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sage-500/30 ${
              value === key
                ? "border-sage-600 bg-sage-50"
                : "border-gray-200 bg-white hover:border-sage-300"
            }`}
          >
            <input
              type="radio"
              name="signup-role-option"
              value={key}
              checked={value === key}
              onChange={() => onChange(key)}
              className="h-4 w-4 border-gray-300 text-sage-600 focus:ring-sage-500"
            />
            <span className="text-sm font-medium text-gray-800">{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
