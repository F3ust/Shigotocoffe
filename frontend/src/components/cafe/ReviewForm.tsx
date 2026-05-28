import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ReviewDTO } from "../../types/review";

interface ReviewFormProps {
  existingReview?: ReviewDTO;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function ReviewForm({
  existingReview,
  onSubmit,
  onDelete,
}: ReviewFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
    setError(null);
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError(t("reviewForm.error_rating"));
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
    } catch (err: any) {
      setError(err?.response?.data?.message || t("auth.error_generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!window.confirm(t("reviewForm.delete_confirm"))) return;
    setError(null);
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (err: any) {
      setError(err?.response?.data?.message || t("auth.error_generic"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-sage-100 bg-white p-5 shadow-sm space-y-4"
    >
      <h3 className="text-base font-bold text-gray-900">
        {existingReview ? t("reviewForm.edit_title") : t("reviewForm.write_title")}
      </h3>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Star Selector */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t("reviewForm.rating_label")}
        </label>
        <div className="flex items-center gap-1.5 py-1">
          {Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            const isHighlighted =
              hoverRating > 0 ? starValue <= hoverRating : starValue <= rating;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl transition-transform duration-100 hover:scale-125 focus:outline-none"
              >
                <span className={isHighlighted ? "text-amber-400" : "text-gray-300"}>
                  ★
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment Field */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t("reviewForm.comment_label")}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("reviewForm.comment_placeholder")}
          rows={3}
          className="w-full rounded-xl border border-sage-200 bg-cream-50/20 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-sage-500 focus:bg-white focus:ring-1 focus:ring-sage-500"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="inline-flex items-center justify-center rounded-xl bg-sage-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage-700 focus:outline-none disabled:opacity-50"
          >
            {isSubmitting
              ? t("auth.submitting")
              : existingReview
                ? t("reviewForm.submit_edit")
                : t("reviewForm.submit")}
          </button>
          
          {existingReview && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
              className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 focus:outline-none disabled:opacity-50"
            >
              {isDeleting ? t("auth.submitting") : t("reviewForm.delete")}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
