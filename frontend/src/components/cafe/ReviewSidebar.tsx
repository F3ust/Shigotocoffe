import { useTranslation } from "react-i18next";
import type { ReviewDTO } from "../../types/review";
import { formatRelativeTime } from "../../utils/relativeTime";

interface ReviewSidebarProps {
  reviews: ReviewDTO[];
  lang: "ja" | "vi";
}

function reviewAuthorName(review: ReviewDTO, anonymous: string): string {
  const u = review.user;
  if (u && typeof u === "object" && typeof u.name === "string" && u.name.trim())
    return u.name.trim();
  return anonymous;
}

export default function ReviewSidebar({ reviews, lang }: ReviewSidebarProps) {
  const { t } = useTranslation();
  const locale = lang === "ja" ? "ja-JP" : "vi-VN";

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-sage-100 bg-white shadow-sm lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)]">
      <div className="border-b border-sage-100 px-5 py-4">
        <h2 className="text-lg font-bold text-gray-900">
          {t("cafeDetail.comments_heading", { count: reviews.length })}
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sage-200 bg-sage-50/40 py-12 text-center text-sm text-gray-500">
            {t("cafeDetail.no_reviews")}
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li
                key={review._id}
                className="rounded-xl border border-gray-100 bg-cream-50/40 p-4 shadow-sm"
              >
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <span className="font-semibold text-gray-800">
                    {reviewAuthorName(review, t("cafeDetail.anonymous"))}
                  </span>
                  <time
                    dateTime={review.createdAt}
                    className="text-xs font-medium text-gray-500"
                    title={new Date(review.createdAt).toLocaleString(locale)}
                  >
                    {formatRelativeTime(review.createdAt, lang)}
                  </time>
                </div>
                <div className="mb-2 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className="text-sm">
                      {i < review.rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
