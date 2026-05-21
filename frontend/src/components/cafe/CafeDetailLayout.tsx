import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Cafe } from "../../types/cafe";
import type { ReviewDTO } from "../../types/review";
import DetailSection from "./DetailSection";
import MenuCard from "./MenuCard";
import ReviewSidebar from "./ReviewSidebar";
import ReviewForm from "./ReviewForm";

interface CafeDetailLayoutProps {
  cafe: Cafe;
  lang: "ja" | "vi";
  reviews: ReviewDTO[];
  isLoggedIn: boolean;
  existingReview?: ReviewDTO;
  onSubmitReview: (rating: number, comment: string) => Promise<void>;
  onDeleteReview?: () => Promise<void>;
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

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconIntro() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M7 9l-2 9M15 9l2 9M4 12h16M9 5l-1 14M14 5l1 14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCup() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17 8h1a4 4 0 110 8h-1" strokeLinecap="round" />
      <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" strokeLinejoin="round" />
    </svg>
  );
}

function IconStatus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CafeDetailLayout({
  cafe,
  lang,
  reviews,
  isLoggedIn,
  existingReview,
  onSubmitReview,
  onDeleteReview,
}: CafeDetailLayoutProps) {
  const { t } = useTranslation();
  const locale = lang === "ja" ? "ja-JP" : "vi-VN";

  const mainImage =
    cafe.images[0] ||
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900";

  const priceLocale = locale;

  const introBody: ReactNode = (
    <p className="text-base leading-relaxed text-gray-700">{cafe.description[lang]}</p>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:pb-16 lg:pt-8">
      <div className="overflow-hidden rounded-2xl border border-sage-100 bg-white shadow-md">
        <div className="relative aspect-[21/9] min-h-[220px] overflow-hidden bg-cream-200 sm:aspect-[21/8]">
          <img
            src={mainImage}
            alt={cafe.name[lang]}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                  {cafe.name[lang]}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm ${
                      cafe.isOpen ? "bg-emerald-600/95" : "bg-gray-700/95"
                    }`}
                  >
                    {cafe.isOpen ? t("cafe.open") : t("cafe.closed")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/35 bg-black/40 px-3 py-2 backdrop-blur-sm">
                <RatingStars rating={cafe.averageRating} />
                <span className="text-sm font-bold text-white">{cafe.averageRating.toFixed(1)}</span>
                <span className="text-sm text-white/90">· {cafe.reviewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <DetailSection title={t("cafeDetail.section_intro")} icon={<IconIntro />}>
            {introBody}
          </DetailSection>

          <DetailSection title={t("cafeDetail.section_hours")} icon={<IconClock />}>
            <p className="text-base font-medium text-gray-800">
              {cafe.openingHours.open} – {cafe.openingHours.close}
            </p>
          </DetailSection>

          <DetailSection title={t("cafeDetail.section_address")} icon={<IconMap />}>
            <p className="text-base font-medium text-gray-800">{cafe.address[lang]}</p>
          </DetailSection>

          <DetailSection title={t("cafeDetail.section_status")} icon={<IconStatus />}>
            <p className="text-base font-medium text-gray-800">
              {cafe.isOpen ? t("cafeDetail.status_open_detail") : t("cafeDetail.status_closed_detail")}
            </p>
          </DetailSection>

          {cafe.hashtags.length > 0 && (
            <DetailSection title={t("cafeDetail.section_tags")} icon={<IconHash />}>
              <div className="flex flex-wrap gap-2">
                {cafe.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-sage-200 bg-sage-50 px-3 py-1.5 text-xs font-semibold text-sage-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

          {cafe.menu.length > 0 && (
            <DetailSection title={t("cafeDetail.menu_heading")} icon={<IconCup />}>
              <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 pt-0.5 [scrollbar-width:thin]">
                {cafe.menu.map((item, index) => (
                  <MenuCard key={`${item.name}-${item.price}-${index}`} item={item} locale={priceLocale} />
                ))}
              </div>
            </DetailSection>
          )}

          {!isLoggedIn ? (
            <div className="flex justify-center sm:justify-start">
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-sage-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage-700 sm:w-auto"
              >
                {t("cafeDetail.rate_cta")}
              </Link>
            </div>
          ) : (
            <ReviewForm
              existingReview={existingReview}
              onSubmit={onSubmitReview}
              onDelete={onDeleteReview}
            />
          )}
        </div>

        <ReviewSidebar reviews={reviews} lang={lang} />
      </div>
    </div>
  );
}
