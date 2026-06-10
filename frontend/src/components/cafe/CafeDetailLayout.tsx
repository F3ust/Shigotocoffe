import { useState, useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { Cafe, MenuItem } from "../../types/cafe";
import type { ReviewDTO } from "../../types/review";
import DetailSection from "./DetailSection";
import MenuCard from "./MenuCard";
import ReviewSidebar from "./ReviewSidebar";
import ReviewForm from "./ReviewForm";
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
  updateCafe,
  uploadImage,
} from "../../services/api";
import LoginPromptModal from "../common/LoginPromptModal";
import { CAFE_HASHTAG_IDS } from "../../constants/cafeHashtags";

// ─── constants ───────────────────────────────────────────────────────────────


const DISTRICTS = [
  "Hoàn Kiếm",
  "Ba Đình",
  "Đống Đa",
  "Tây Hồ",
  "Cầu Giấy",
  "Hai Bà Trưng",
  "Thanh Xuân",
  "Long Biên",
  "Hà Đông",
  "Nam Từ Liêm",
  "Bắc Từ Liêm",
];

// ─── helpers ─────────────────────────────────────────────────────────────────

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

// ─── Inline editable section wrapper ─────────────────────────────────────────

function EditableInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl border border-sage-300 bg-sage-50/50 px-3 py-2 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 transition-all ${className}`}
    />
  );
}

function EditableTextarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-xl border border-sage-300 bg-sage-50/50 px-3 py-2 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 transition-all resize-none"
    />
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

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
  const locale = lang === "ja" ? "ja-JP" : "vi-VN";
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  // ── favorite state ─────────────────────────────────────────────────────────
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites()
        .then((res) => setIsFavorite(res.data.some((c) => c._id === cafe._id)))
        .catch(console.error);
    }
  }, [isLoggedIn, cafe._id]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) { setIsLoginPromptOpen(true); return; }
    try {
      if (isFavorite) { await removeFavorite(cafe._id); setIsFavorite(false); }
      else { await addFavorite(cafe._id); setIsFavorite(true); }
    } catch (err) { console.error(err); }
  };

  // ── owner check ────────────────────────────────────────────────────────────
  const isOwner =
    currentUser?.role === "owner" &&
    (cafe.owner === currentUser._id || !cafe.owner);

  // ── edit state ─────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // editable fields
  const [nameJa, setNameJa] = useState(cafe.name.ja);
  const [nameVi, setNameVi] = useState(cafe.name.vi);
  const [descJa, setDescJa] = useState(cafe.description.ja);
  const [descVi, setDescVi] = useState(cafe.description.vi);
  const [addrJa, setAddrJa] = useState(cafe.address.ja);
  const [addrVi, setAddrVi] = useState(cafe.address.vi);
  const [district, setDistrict] = useState(cafe.district);
  const [openTime, setOpenTime] = useState(cafe.openingHours.open);
  const [closeTime, setCloseTime] = useState(cafe.openingHours.close);
  const [isOpen, setIsOpen] = useState(cafe.isOpen);
  const [hashtags, setHashtags] = useState<string[]>(cafe.hashtags || []);
  const [menu, setMenu] = useState<MenuItem[]>(cafe.menu || []);
  const [images, setImages] = useState<string[]>(
    cafe.images?.length ? cafe.images : [""]
  );

  const imageInputRef = useRef<HTMLInputElement>(null);

  const resetEdits = () => {
    setNameJa(cafe.name.ja);
    setNameVi(cafe.name.vi);
    setDescJa(cafe.description.ja);
    setDescVi(cafe.description.vi);
    setAddrJa(cafe.address.ja);
    setAddrVi(cafe.address.vi);
    setDistrict(cafe.district);
    setOpenTime(cafe.openingHours.open);
    setCloseTime(cafe.openingHours.close);
    setIsOpen(cafe.isOpen);
    setHashtags(cafe.hashtags || []);
    setMenu(cafe.menu || []);
    setImages(cafe.images?.length ? cafe.images : [""]);
    setSaveError(null);
  };

  const handleEnterEdit = () => {
    resetEdits();
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetEdits();
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: { ja: nameJa, vi: nameVi },
        description: { ja: descJa, vi: descVi },
        address: { ja: addrJa, vi: addrVi },
        district,
        openingHours: { open: openTime, close: closeTime },
        isOpen,
        hashtags,
        menu: menu.filter((m) => m.name.trim() !== ""),
        images: images.map((img) => img.trim()).filter(Boolean),
      };
      await updateCafe(cafe._id, payload);
      setIsEditing(false);
      window.location.reload();
    } catch (err: any) {
      setSaveError(
        err?.response?.data?.message || t("auth.error_generic")
      );
    } finally {
      setSaving(false);
    }
  };

  // ── image upload helpers ───────────────────────────────────────────────────
  const handleUploadCover = async (file: File) => {
    try {
      const res = await uploadImage(file);
      setImages((prev) => {
        const next = [...prev];
        next[0] = res.url;
        return next;
      });
    } catch { alert(t("sprint4.upload_failed")); }
  };

  const handleUploadGallery = async (file: File) => {
    try {
      const res = await uploadImage(file);
      setImages((prev) => [...prev, res.url]);
    } catch { alert(t("sprint4.upload_failed")); }
  };

  const handleRemoveImage = (idx: number) => {
    if (images.length <= 1) { setImages([""]); return; }
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── menu helpers ──────────────────────────────────────────────────────────
  const handleMenuChange = (
    idx: number,
    key: keyof MenuItem,
    value: any
  ) => {
    setMenu((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item))
    );
  };

  const handleMenuImageUpload = async (idx: number, file: File) => {
    try {
      const res = await uploadImage(file);
      handleMenuChange(idx, "image", res.url);
    } catch { alert(t("sprint4.upload_failed")); }
  };

  // ── derived ───────────────────────────────────────────────────────────────
  const mainImage =
    (isEditing ? images[0] : cafe.images[0]) ||
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900";

  const priceLocale = locale;

  const introBody: ReactNode = isEditing ? (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">🇯🇵 JA</label>
        <EditableTextarea value={descJa} onChange={setDescJa} rows={3} placeholder="紹介文（日本語）" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">🇻🇳 VI</label>
        <EditableTextarea value={descVi} onChange={setDescVi} rows={3} placeholder="Mô tả quán (Tiếng Việt)" />
      </div>
    </div>
  ) : (
    <p className="text-base leading-relaxed text-gray-700">{cafe.description[lang]}</p>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:pb-16 lg:pt-8">

      {/* ── Banner / Cover ─────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-sage-100 bg-white shadow-md">
        <div className="relative aspect-[21/9] min-h-[220px] overflow-hidden bg-cream-200 sm:aspect-[21/8]">
          <img
            src={mainImage}
            alt={cafe.name[lang]}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Cover upload in edit mode */}
          {isEditing && (
            <>
              <label className="absolute top-4 left-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/70 transition-all backdrop-blur-sm">
                📷 {t("sprint4.upload_button")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadCover(f);
                  }}
                />
              </label>
              {images[0] && (
                <input
                  type="text"
                  value={images[0]}
                  onChange={(e) => setImages((prev) => { const n=[...prev]; n[0]=e.target.value; return n; })}
                  placeholder="URL ảnh bìa"
                  className="absolute bottom-20 left-4 right-4 rounded-lg border border-white/40 bg-black/40 px-3 py-1.5 text-xs text-white placeholder-white/50 backdrop-blur-sm outline-none focus:border-white/70"
                />
              )}
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Name */}
                  {isEditing ? (
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="text"
                        value={nameJa}
                        onChange={(e) => setNameJa(e.target.value)}
                        placeholder="店名（日本語）"
                        className="rounded-lg bg-white/20 border border-white/40 px-3 py-1.5 text-lg font-bold text-white placeholder-white/60 backdrop-blur-sm outline-none focus:bg-white/30 focus:border-white/70 w-full"
                      />
                      <input
                        type="text"
                        value={nameVi}
                        onChange={(e) => setNameVi(e.target.value)}
                        placeholder="Tên quán (Tiếng Việt)"
                        className="rounded-lg bg-white/20 border border-white/40 px-3 py-1.5 text-sm font-semibold text-white placeholder-white/60 backdrop-blur-sm outline-none focus:bg-white/30 focus:border-white/70 w-full"
                      />
                    </div>
                  ) : (
                    <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                      {cafe.name[lang]}
                    </h1>
                  )}

                  {/* Bookmark */}
                  {!isEditing && (
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
                  )}
                </div>

                {/* Status badge */}
                <div className="flex flex-wrap items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer text-white text-sm">
                        <input
                          type="radio"
                          name="isOpen"
                          checked={isOpen}
                          onChange={() => setIsOpen(true)}
                          className="accent-emerald-400"
                        />
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-emerald-600/95 text-white">
                          {t("cafe.open")}
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-white text-sm">
                        <input
                          type="radio"
                          name="isOpen"
                          checked={!isOpen}
                          onChange={() => setIsOpen(false)}
                          className="accent-gray-400"
                        />
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-gray-700/95 text-white">
                          {t("cafe.closed")}
                        </span>
                      </label>
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm ${
                        cafe.isOpen ? "bg-emerald-600/95" : "bg-gray-700/95"
                      }`}
                    >
                      {cafe.isOpen ? t("cafe.open") : t("cafe.closed")}
                    </span>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="flex items-center gap-2 rounded-xl border border-white/35 bg-black/40 px-3 py-2 backdrop-blur-sm">
                  <RatingStars rating={cafe.averageRating} />
                  <span className="text-sm font-bold text-white">{cafe.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-white/90">· {cafe.reviewCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Save error ─────────────────────────────────────────────────────── */}
      {saveError && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
          ⚠️ {saveError}
        </div>
      )}

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">

          {/* Intro */}
          <DetailSection title={isEditing ? t("manage.edit_title") : t("cafeDetail.section_intro")} icon={<IconIntro />}>
            {introBody}
          </DetailSection>

          {/* Hours */}
          <DetailSection title={t("cafeDetail.section_hours")} icon={<IconClock />}>
            {isEditing ? (
              <div className="flex items-center gap-3">
                <EditableInput value={openTime} onChange={setOpenTime} placeholder="08:00" className="w-28" />
                <span className="text-gray-500 font-medium">–</span>
                <EditableInput value={closeTime} onChange={setCloseTime} placeholder="22:00" className="w-28" />
              </div>
            ) : (
              <p className="text-base font-medium text-gray-800">
                {cafe.openingHours.open} – {cafe.openingHours.close}
              </p>
            )}
          </DetailSection>

          {/* Address */}
          <DetailSection title={t("cafeDetail.section_address")} icon={<IconMap />}>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t("manage.district")} *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-sage-300 bg-sage-50/50 px-3 py-2 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 bg-white"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">🇯🇵 JA</label>
                  <EditableInput value={addrJa} onChange={setAddrJa} placeholder="住所（日本語）" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">🇻🇳 VI</label>
                  <EditableInput value={addrVi} onChange={setAddrVi} placeholder="Địa chỉ (Tiếng Việt)" />
                </div>
              </div>
            ) : (
              <p className="text-base font-medium text-gray-800">{cafe.address[lang]}</p>
            )}
          </DetailSection>

          {/* Status */}
          {!isEditing && (
            <DetailSection title={t("cafeDetail.section_status")} icon={<IconStatus />}>
              <p className="text-base font-medium text-gray-800">
                {cafe.isOpen ? t("cafeDetail.status_open_detail") : t("cafeDetail.status_closed_detail")}
              </p>
            </DetailSection>
          )}

          {/* Hashtags */}
          {(cafe.hashtags.length > 0 || isEditing) && (
            <DetailSection title={t("cafeDetail.section_tags")} icon={<IconHash />}>
              {isEditing ? (
                <div className="flex flex-wrap gap-3">
                  {CAFE_HASHTAG_IDS.map((tag) => (
                    <label key={tag} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hashtags.includes(tag)}
                        onChange={(e) => {
                          if (e.target.checked) setHashtags((prev) => [...prev, tag]);
                          else setHashtags((prev) => prev.filter((h) => h !== tag));
                        }}
                        className="rounded text-sage-600 focus:ring-sage-500 border-sage-300"
                      />
                      <span className="rounded-lg border border-sage-200 bg-sage-50 px-2.5 py-1 text-xs font-semibold text-sage-800">
                        #{tag}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
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
              )}
            </DetailSection>
          )}

          {/* Menu */}
          {(cafe.menu.length > 0 || isEditing) && (
            <DetailSection title={t("cafeDetail.menu_heading")} icon={<IconCup />}>
              {isEditing ? (
                <div className="space-y-3">
                  {menu.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl border border-sage-100 bg-sage-50/30 p-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleMenuChange(idx, "name", e.target.value)}
                        placeholder="Tên món"
                        className="flex-1 min-w-[120px] rounded-lg border border-sage-200 px-3 py-1.5 text-sm outline-none focus:border-sage-500"
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleMenuChange(idx, "price", Number(e.target.value))}
                        placeholder="Giá"
                        className="w-24 rounded-lg border border-sage-200 px-3 py-1.5 text-sm outline-none focus:border-sage-500"
                      />
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-sage-100" />
                        )}
                        <label className="cursor-pointer text-xs font-semibold text-sage-600 bg-sage-50 hover:bg-sage-100 px-2 py-1.5 rounded-lg border border-sage-200 transition-colors">
                          📷
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleMenuImageUpload(idx, f);
                            }}
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMenu((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg text-xs border border-transparent hover:border-red-100 transition-colors font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMenu((prev) => [...prev, { name: "", price: 0 }])}
                    className="w-full rounded-xl border-2 border-dashed border-sage-300 py-3 text-sm font-semibold text-sage-600 hover:border-sage-400 hover:bg-sage-50 transition-all"
                  >
                    + {t("manage.add_menu_item")}
                  </button>
                </div>
              ) : (
                <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 pt-0.5 [scrollbar-width:thin]">
                  {cafe.menu.map((item, index) => (
                    <MenuCard key={`${item.name}-${item.price}-${index}`} item={item} locale={priceLocale} />
                  ))}
                </div>
              )}
            </DetailSection>
          )}

          {/* Gallery */}
          {(cafe.images?.filter(Boolean).length > 0 || isEditing) && (
            <DetailSection title={t("cafeDetail.section_images")} icon={<IconImages />}>
              {isEditing ? (
                <div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 mb-3">
                    {images.filter(Boolean).map((img, idx) => (
                      <div key={idx} className="relative group aspect-video overflow-hidden rounded-xl bg-gray-100 border border-sage-100">
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Upload more */}
                    <label className="aspect-video flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sage-300 bg-sage-50/50 cursor-pointer hover:border-sage-400 hover:bg-sage-50 transition-all">
                      <span className="text-2xl">+</span>
                      <span className="text-xs text-sage-600 font-semibold mt-1">{t("sprint4.upload_button")}</span>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadGallery(f);
                        }}
                      />
                    </label>
                  </div>
                </div>
              ) : (
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
              )}
            </DetailSection>
          )}

          {isOwner && !isEditing && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleEnterEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-sage-200 bg-white px-6 py-2.5 text-sm font-semibold text-sage-700 shadow-sm hover:bg-sage-50 transition-colors cursor-pointer"
              >
                ✏️ {t("sprint4.edit_visually")}
              </button>
            </div>
          )}
        </div>

        <ReviewSidebar
          reviews={reviews}
          lang={lang}
          isOwner={isOwner}
          onReplyToReview={onReplyToReview}
        >
          {/* Review form (users only, not owners, not when editing) */}
          {!isEditing && (
            !isLoggedIn ? (
              <div className="flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => setIsLoginPromptOpen(true)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-sage-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage-700 cursor-pointer"
                >
                  {t("cafeDetail.rate_cta")}
                </button>
              </div>
            ) : currentUser?.role === "owner" ? null : (
              <ReviewForm
                existingReview={existingReview}
                onSubmit={onSubmitReview}
                onDelete={onDeleteReview}
              />
            )
          )}
        </ReviewSidebar>
      </div>

      {/* ── Sticky save/cancel footer in edit mode ────────────────────────── */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-sage-200 bg-white/95 backdrop-blur-sm shadow-lg px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-sage-600 font-medium hidden sm:block">
            ✏️ {t("manage.edit_title")}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="rounded-xl border border-sage-200 bg-white px-5 py-2.5 text-sm font-semibold text-sage-700 hover:bg-sage-50 transition-colors disabled:opacity-50"
            >
              {t("manage.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-sage-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-sage-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("auth.submitting")}
                </>
              ) : (
                <>💾 {t("manage.submit_edit")}</>
              )}
            </button>
          </div>
        </div>
      )}

      <LoginPromptModal isOpen={isLoginPromptOpen} onClose={() => setIsLoginPromptOpen(false)} />
    </div>
  );
}
