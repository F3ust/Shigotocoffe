import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CafeDetailLayout from "../components/cafe/CafeDetailLayout";
import {
  fetchCafeById,
  fetchReviewsForCafe,
  getAuthToken,
  getAuthUser,
  createReview,
  updateReview,
  deleteReview,
  replyToReview,
} from "../services/api";
import type { Cafe } from "../types/cafe";
import type { ReviewDTO } from "../types/review";

const MONGO_OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; cafe: Cafe; reviews: ReviewDTO[] }
  | { kind: "not_found" }
  | { kind: "invalid_id" }
  | { kind: "error" };

export default function CafeDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const lang = i18n.language as "ja" | "vi";

  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(async (cafeId: string) => {
    setState({ kind: "loading" });
    try {
      const [cafeRes, reviewsRes] = await Promise.all([
        fetchCafeById(cafeId),
        fetchReviewsForCafe(cafeId),
      ]);
      setState({
        kind: "ready",
        cafe: cafeRes.data,
        reviews: reviewsRes.data,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 404) {
          setState({ kind: "not_found" });
          return;
        }
        if (code === 400) {
          setState({ kind: "invalid_id" });
          return;
        }
      }
      setState({ kind: "error" });
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setState({ kind: "not_found" });
      return;
    }
    if (!MONGO_OBJECT_ID_REGEX.test(id)) {
      setState({ kind: "invalid_id" });
      return;
    }
    void load(id);
  }, [id, load]);

  if (state.kind === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sage-300 border-t-transparent" />
        <span className="ml-3 text-gray-500">{t("cafe.loading")}</span>
      </div>
    );
  }

  if (
    state.kind === "invalid_id" ||
    state.kind === "not_found" ||
    state.kind === "error"
  ) {
    const message =
      state.kind === "invalid_id"
        ? t("cafeDetail.invalid_id")
        : state.kind === "not_found"
          ? t("cafeDetail.not_found")
          : t("cafeDetail.error_load");

    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-5xl">☕</p>
        <p className="mt-6 text-lg font-medium text-gray-600">{message}</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-lg bg-sage-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-700"
        >
          {t("cafeDetail.back_home")}
        </Link>
      </div>
    );
  }

  const isLoggedIn = getAuthToken() !== null;
  const currentUser = getAuthUser();

  const userReview =
    currentUser && state.kind === "ready"
      ? state.reviews.find(
          (r) =>
            r.user &&
            (typeof r.user === "string"
              ? r.user === currentUser._id
              : r.user._id === currentUser._id)
        )
      : undefined;

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!id) return;
    if (userReview) {
      await updateReview(userReview._id, { rating, comment });
    } else {
      await createReview(id, { rating, comment });
    }
    void load(id);
  };

  const handleDeleteReview = async () => {
    if (userReview) {
      await deleteReview(userReview._id);
      if (id) {
        void load(id);
      }
    }
  };

  const handleReplyToReview = async (reviewId: string, comment: string) => {
    await replyToReview(reviewId, comment);
    if (id) {
      void load(id);
    }
  };

  if (state.kind !== "ready") {
    return null;
  }

  return (
    <CafeDetailLayout
      cafe={state.cafe}
      lang={lang}
      reviews={state.reviews}
      isLoggedIn={isLoggedIn}
      currentUser={currentUser}
      existingReview={userReview}
      onSubmitReview={handleSubmitReview}
      onDeleteReview={handleDeleteReview}
      onReplyToReview={handleReplyToReview}
    />
  );
}
