import { useState } from "react";
import { useTranslation } from "react-i18next";

const DISTRICTS = [
  "Hoàn Kiếm",
  "Ba Đình",
  "Đống Đa",
  "Tây Hồ",
  "Cầu Giấy",
  "Hai Bà Trưng",
];

interface SearchBarProps {
  onSearch: (query: string, district: string) => void;
  onToggleFilter: () => void;
  filterOpen: boolean;
  initialQuery?: string;
  initialDistrict?: string;
}

export default function SearchBar({
  onSearch,
  onToggleFilter,
  filterOpen,
  initialQuery = "",
  initialDistrict = "",
}: SearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [district, setDistrict] = useState(initialDistrict);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query, district);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:flex-row sm:items-stretch"
    >
      {/* District selector — spec element #8 */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 sm:border-b-0 sm:border-r sm:py-0">
        <span className="text-sage-500">📍</span>
        <select
          id="search-district"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-700 focus:outline-none sm:w-40"
        >
          <option value="">{t("search.district_placeholder")}</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Search input — spec element #9 */}
      <div className="relative flex flex-1 items-center border-b border-gray-200 px-4 py-3 sm:border-b-0 sm:py-0">
        <span className="mr-2 text-gray-400">🔍</span>
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
        />
      </div>

      {/* Search button + filter toggle — spec elements #10, #11 */}
      <div className="flex">
        <button
          id="search-button"
          type="submit"
          className="flex-1 bg-sage-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-700 sm:flex-initial"
        >
          {t("search.button")}
        </button>
        <button
          id="filter-toggle"
          type="button"
          onClick={onToggleFilter}
          className={`flex items-center justify-center border-l border-sage-700 bg-sage-600 px-3 text-white transition-colors hover:bg-sage-700 ${
            filterOpen ? "bg-sage-700" : ""
          }`}
          aria-label="Toggle filter"
        >
          <span className={`text-sm transition-transform ${filterOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
      </div>
    </form>
  );
}
