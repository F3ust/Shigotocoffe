import { useState, useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Cafe } from "../../types/cafe";
import type { ReviewDTO } from "../../types/review";
import DetailSection from "./DetailSection";
import MenuCard from "./MenuCard";
import ReviewSidebar from "./ReviewSidebar";
import ReviewForm from "./ReviewForm";
import CafeForm from "./CafeForm";
import { fetchFavorites, addFavorite, removeFavorite, updateCafe } from "../../services/api";

interface CafeDetailLayoutProps {
  cafe: Cafe;
  lang: "ja" | "vi";
  reviews: ReviewDTO[];
  isLoggedIn: boolean;
  currentUser?: any;
  existingReview?: ReviewDTO;
  onSubmitReview: (rating: number, comment: string) => Promise<void>;
  onDeleteReview?: () => Promise<void>;
  onReplyToReview?: (reviewId: string, comment: string) => Promise<void>;
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

function IconImages() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CafeDetailLayout({
  cafe,
  lang,
  reviews,
  isLoggedIn,
  currentUser,
  existingReview,
  onSubmitReview,
  onDeleteReview,
  onReplyToReview,
}: CafeDetailLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locale = lang === "ja" ? "ja-JP" : "vi-VN";

  const [editOpen, setEditOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites()
        .then((res) => {
          setIsFavorite(res.data.some((c) => c._id === cafe._id));
        })
        .catch((err) => console.error(err));
    }
  }, [isLoggedIn, cafe._id]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    try {
      if (isFavorite) {
        await removeFavorite(cafe._id);
        setIsFavorite(false);
      } else {
        await addFavorite(cafe._id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isOwner = currentUser?.role === "owner" && (cafe.owner === currentUser._id || !cafe.owner);

  const mainImage =
    cafe.images[0] ||
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900";

  const priceLocale = locale;

  const introBody: ReactNode = (
    <p className="text-base leading-relaxed text-gray-700">{cafe.description[lang]}</p>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:pb-16 lg:pt-8">
      {/* Visual Editor Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setEditOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-xl font-bold p-2"
            >
              ✕
            </button>
            <h2 className="mb-4 text-xl font-bold text-gray-900">{t("manage.edit_title")}</h2>
            <CafeForm
              initialData={cafe}
              onSubmit={async (data) => {
                await updateCafe(cafe._id, data);
                setEditOpen(false);
                window.location.reload();
              }}
              onCancel={() => setEditOpen(false)}
            />
          </div>
        </div>
      )}

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
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                    {cafe.name[lang]}
                  </h1>
                  {/* Bookmark Toggle Heart Button */}
                  <button
                    id={`bookmark-${cafe._id}`}
                    onClick={handleToggleFavorite}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all ${
                      isFavorite
                        ? "bg-rose-500 border-rose-500 text-white hover:bg-rose-600"
                        : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                    }`}
                    aria-label="Bookmark"
                    title={isFavorite ? t("sprint4.bookmark_tooltip_remove") : t("sprint4.bookmark_tooltip_add")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </button>

                  {/* Visual Edit Button for Cafe Owner */}
                  {isOwner && (
                    <button
                      onClick={() => setEditOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sage-600 hover:bg-sage-700 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-colors"
                    >
                      ✏️ {t("sprint4.edit_visually")}
                    </button>
                  )}
                </div>
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

          {cafe.images && cafe.images.filter(Boolean).length > 0 && (
            <DetailSection title={t("cafeDetail.section_images")} icon={<IconImages />}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {cafe.images.filter(Boolean).map((img, index) => (
                  <div key={index} className="aspect-video overflow-hidden rounded-xl bg-gray-100 border border-sage-100">
                    <img
                      src={img}
                      alt={`${cafe.name[lang]} - ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
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
          ) : currentUser?.role === "owner" ? null : (
            <ReviewForm
              existingReview={existingReview}
              onSubmit={onSubmitReview}
              onDelete={onDeleteReview}
            />
          )}
        </div>

        <ReviewSidebar
          reviews={reviews}
          lang={lang}
          isOwner={isOwner}
          onReplyToReview={onReplyToReview}
        />
      </div>
    </div>
  );
}
