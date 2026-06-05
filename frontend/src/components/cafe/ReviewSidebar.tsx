import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReviewDTO } from "../../types/review";
import { formatRelativeTime } from "../../utils/relativeTime";

interface ReviewSidebarProps {
  reviews: ReviewDTO[];
  lang: "ja" | "vi";
  isOwner: boolean;
  onReplyToReview?: (reviewId: string, comment: string) => Promise<void>;
  children?: React.ReactNode;
}

function reviewAuthorName(review: ReviewDTO, anonymous: string): string {
  const u = review.user;
  if (u && typeof u === "object" && typeof u.name === "string" && u.name.trim())
    return u.name.trim();
  return anonymous;
}

export default function ReviewSidebar({
  reviews,
  lang,
  isOwner,
  onReplyToReview,
  children,
}: ReviewSidebarProps) {
  const { t } = useTranslation();
  const locale = lang === "ja" ? "ja-JP" : "vi-VN";

  // Track reply input per reviewId
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  const handleSendReply = async (reviewId: string) => {
    const text = replyText[reviewId]?.trim();
    if (!text) {
      alert(t("sprint4.reply_empty_error"));
      return;
    }
    setSubmitting((prev) => ({ ...prev, [reviewId]: true }));
    try {
      if (onReplyToReview) {
        await onReplyToReview(reviewId, text);
      }
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-sage-100 bg-white shadow-sm lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)]">
      <div className="border-b border-sage-100 px-5 py-4">
        <h2 className="text-lg font-bold text-gray-900">
          {t("cafeDetail.comments_heading", { count: reviews.length })}
        </h2>
      </div>

      {children && (
        <div className="border-b border-sage-100 px-5 py-4 bg-sage-50/20">
          {children}
        </div>
      )}

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

                {/* Owner Reply Render */}
                {review.reply && (
                  <div className="mt-3 rounded-lg bg-sage-50 border border-sage-100 p-3 pl-4 border-l-4 border-l-sage-500 ml-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-sage-100 px-2.5 py-0.5 text-[11px] font-bold text-sage-800">
                        {t("sprint4.reply_badge")}
                      </span>
                      {review.reply.createdAt && (
                        <span className="text-[10px] text-gray-400">
                          {formatRelativeTime(review.reply.createdAt, lang)}
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-xs text-gray-700 leading-relaxed">
                      {review.reply.comment}
                    </p>
                  </div>
                )}

                {/* Owner Reply Composition Box */}
                {isOwner && !review.reply && (
                  <div className="mt-3 border-t border-dashed border-gray-200 pt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">
                      {t("sprint4.owner_reply_section")}
                    </p>
                    <div className="flex gap-2">
                      <textarea
                        rows={1}
                        value={replyText[review._id] || ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({
                            ...prev,
                            [review._id]: e.target.value,
                          }))
                        }
                        placeholder={t("sprint4.reply_placeholder")}
                        className="flex-1 rounded-lg border border-gray-200 p-2 text-xs focus:border-sage-500 focus:outline-none resize-none bg-white"
                      />
                      <button
                        type="button"
                        disabled={submitting[review._id]}
                        onClick={() => handleSendReply(review._id)}
                        className="rounded-lg bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white px-3 py-1 text-xs font-semibold transition-colors shadow-sm self-end"
                      >
                        {submitting[review._id] ? "..." : t("sprint4.reply_submit")}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
