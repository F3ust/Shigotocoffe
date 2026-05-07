import { useState } from "react";
import { useTranslation } from "react-i18next";

interface FilterPanelProps {
  onApply: (filters: { minRating: string; tags: string[] }) => void;
  onClear: () => void;
  isOpen: boolean;
}

const DISTANCE_OPTIONS = [
  "distance_1km",
  "distance_1_3km",
  "distance_3_5km",
  "distance_5km",
] as const;

const RATING_OPTIONS = [
  { key: "rating_4", value: "4" },
  { key: "rating_3", value: "3" },
] as const;

export default function FilterPanel({ onApply, onClear, isOpen }: FilterPanelProps) {
  const { t } = useTranslation();
  const [selectedDistances, setSelectedDistances] = useState<string[]>([]);
  const [minRating, setMinRating] = useState("");
  const [selectedTags] = useState<string[]>([]);

  function toggleDistance(d: string) {
    setSelectedDistances((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function handleApply() {
    onApply({ minRating, tags: selectedTags });
  }

  function handleClear() {
    setSelectedDistances([]);
    setMinRating("");
    onClear();
  }

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-5 shadow-xl">
      {/* Header */}
      <h3 className="mb-4 text-base font-bold text-gray-800">
        {t("filter.title")}
      </h3>

      {/* Distance section — spec element #12 */}
      <div className="mb-4 space-y-2">
        {DISTANCE_OPTIONS.map((key) => (
          <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={selectedDistances.includes(key)}
              onChange={() => toggleDistance(key)}
              className="h-4 w-4 rounded border-gray-300 text-sage-600 accent-sage-600"
            />
            {t(`filter.${key}`)}
          </label>
        ))}
      </div>

      {/* Rating section — spec element #12 */}
      <div className="mb-5">
        <h4 className="mb-2 text-sm font-bold text-gray-800">
          {t("filter.rating")}
        </h4>
        <div className="space-y-2">
          {RATING_OPTIONS.map(({ key, value }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={minRating === value}
                onChange={() => setMinRating(minRating === value ? "" : value)}
                className="h-4 w-4 rounded border-gray-300 text-sage-600 accent-sage-600"
              />
              <span className="text-amber-400">★</span>
              {t(`filter.${key}`)}
            </label>
          ))}
        </div>
      </div>

      {/* Action buttons — spec Áp dụng / Hủy bỏ */}
      <div className="flex gap-2 border-t border-gray-100 pt-4">
        <button
          id="filter-apply"
          onClick={handleApply}
          className="flex-1 rounded-lg bg-sage-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-sage-700"
        >
          {t("filter.apply")}
        </button>
        <button
          id="filter-clear"
          onClick={handleClear}
          className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          {t("filter.clear")}
        </button>
      </div>
    </div>
  );
}
