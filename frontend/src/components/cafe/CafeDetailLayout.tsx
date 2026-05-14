import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { Cafe } from "../../types/cafe";

interface CafeDetailLayoutProps {
  cafe: Cafe;
  lang: "ja" | "vi";
  children?: ReactNode;
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

export default function CafeDetailLayout({
  cafe,
  lang,
  children,
}: CafeDetailLayoutProps) {
  const { t } = useTranslation();

  const mainImage =
    cafe.images[0] ||
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900";

  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 pt-8 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="relative aspect-[21/9] min-h-[200px] overflow-hidden bg-cream-200 sm:aspect-[21/8]">
          <img
            src={mainImage}
            alt={cafe.name[lang]}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                {cafe.name[lang]}
              </h1>
              <div className="flex items-center gap-2 rounded-lg border border-white/30 bg-black/35 px-3 py-1.5 backdrop-blur-sm">
                <RatingStars rating={cafe.averageRating} />
                <span className="text-sm font-bold text-white">
                  {cafe.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-white/90">
                  · {cafe.reviewCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-sage-100 p-5 sm:p-8">
          <p className="text-base leading-relaxed text-gray-600">
            {cafe.description[lang]}
          </p>

          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p className="flex items-start gap-2">
              <span className="shrink-0">🕐</span>
              <span>
                {cafe.openingHours.open} – {cafe.openingHours.close}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="shrink-0">📍</span>
              <span>{cafe.address[lang]}</span>
            </p>
          </div>

          {cafe.hashtags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {cafe.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-sage-200 bg-sage-50 px-3 py-1 text-xs font-medium text-sage-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {cafe.menu.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                {t("cafeDetail.menu_heading")}
              </h2>
              <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-cream-50/60">
                {cafe.menu.map((item) => (
                  <li
                    key={`${item.name}-${item.price}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="shrink-0 font-semibold text-sage-700">
                      {item.price.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
