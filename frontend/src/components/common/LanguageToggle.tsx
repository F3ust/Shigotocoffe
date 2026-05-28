import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = i18n.language;

  const LANGUAGES = [
    { code: "vi", label: "Tiếng Việt" },
    { code: "ja", label: "日本語" },
  ] as const;

  function switchLang(lang: string) {
    console.log("switchLang called with:", lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        console.log("handleClickOutside triggered. target outside ref:", e.target);
        setIsOpen(false);
      } else {
        console.log("handleClickOutside triggered. target is INSIDE ref:", e.target);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        id="language-toggle"
        type="button"
        onClick={() => {
          console.log("Language toggle button clicked. Next state:", !isOpen);
          setIsOpen(!isOpen);
        }}
        className="flex h-9 items-center gap-1.5 rounded-md border border-sage-300 px-3 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50"
      >
        {t("nav.language")}
        <span className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              onClick={(e) => {
                console.log(`Dropdown item ${code} clicked.`);
                e.stopPropagation();
                switchLang(code);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-sage-50 ${
                current === code ? "bg-sage-50 font-semibold text-sage-700" : "text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

