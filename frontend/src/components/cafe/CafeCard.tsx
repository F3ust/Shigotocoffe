import { useTranslation } from "react-i18next";
import type { Cafe } from "../../types/cafe";

interface CafeCardProps {
  cafe: Cafe;
}

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;

  return (
    <span className="flex items-center gap-0.5 text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < fullStars
              ? "text-amber-400"
              : i === fullStars && hasHalf
                ? "text-amber-300"
                : "text-gray-300"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function CafeCard({ cafe }: CafeCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "ja" | "vi";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image — spec element #17 */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={cafe.images[0] || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600"}
          alt={cafe.name[lang]}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Bookmark icon — spec element #14 */}
        <button
          id={`bookmark-${cafe._id}`}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-md border border-sage-300/50 bg-white/90 text-sage-600 shadow-sm backdrop-blur-sm transition-all hover:bg-sage-50 hover:text-sage-800"
          aria-label="Bookmark"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name + rating — spec elements #11, #13, #14 */}
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 transition-colors group-hover:text-sage-700">
            {cafe.name[lang]}
          </h3>
          <div className="flex items-center gap-1.5">
            <RatingStars rating={cafe.averageRating} />
            <span className="text-sm font-semibold text-gray-700">
              {cafe.averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="mb-2 text-sm text-gray-500 line-clamp-1">
          {cafe.description[lang]}
        </p>

        {/* Hours — spec element with 🕐 */}
        <p className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
          <span>🕐</span>
          {cafe.openingHours.open} - {cafe.openingHours.close}
        </p>

        {/* Address — spec element with 📍 */}
        <p className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
          <span>📍</span>
          {cafe.address[lang]}
        </p>

        {/* Hashtags + View button — spec elements #15, #16 */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {cafe.hashtags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-sage-200 bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-700"
              >
                #{tag}
              </span>
            ))}
          </div>
          <button
            id={`view-${cafe._id}`}
            className="rounded-lg bg-sage-600 px-5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sage-700"
          >
            {t("cafe.view")}
          </button>
        </div>
      </div>
    </div>
  );
}
