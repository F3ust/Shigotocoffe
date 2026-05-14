import { useTranslation } from "react-i18next";
import type { ReviewDTO } from "../../types/review";

interface ReviewListProps {
  reviews: ReviewDTO[];
}

function reviewAuthorName(review: ReviewDTO, anonymous: string): string {
  const u = review.user;
  if (u && typeof u === "object" && typeof u.name === "string" && u.name.trim())
    return u.name.trim();
  return anonymous;
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ja" ? "ja" : "vi";

  return (
    <section className="mt-10 w-full">
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        {t("cafeDetail.reviews_title")}
      </h2>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sage-200 bg-sage-50/40 py-14 text-center text-gray-500">
          {t("cafeDetail.no_reviews")}
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review._id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-gray-800">
                  {reviewAuthorName(review, t("cafeDetail.anonymous"))}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleString(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="mb-2 flex gap-1 text-amber-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i}>
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
    </section>
  );
}
