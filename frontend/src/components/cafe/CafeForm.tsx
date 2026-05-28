import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Cafe, MenuItem } from "../../types/cafe";

interface CafeFormProps {
  initialData?: Cafe;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const VALID_HASHTAGS = ["wifi", "outlets", "quiet", "japanese", "noTimeLimit"];
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
  "Bắc Từ Liêm"
];

export default function CafeForm({
  initialData,
  onSubmit,
  onCancel,
}: CafeFormProps) {
  const { t } = useTranslation();

  // Form states
  const [nameJa, setNameJa] = useState("");
  const [nameVi, setNameVi] = useState("");
  const [descJa, setDescJa] = useState("");
  const [descVi, setDescVi] = useState("");
  const [addrJa, setAddrJa] = useState("");
  const [addrVi, setAddrVi] = useState("");
  
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const [lat, setLat] = useState<number>(21.0285);
  const [lng, setLng] = useState<number>(105.8542);
  
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [images, setImages] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNameJa(initialData.name.ja);
      setNameVi(initialData.name.vi);
      setDescJa(initialData.description.ja);
      setDescVi(initialData.description.vi);
      setAddrJa(initialData.address.ja);
      setAddrVi(initialData.address.vi);
      setDistrict(initialData.district);
      setOpenTime(initialData.openingHours.open);
      setCloseTime(initialData.openingHours.close);
      
      const coords = (initialData as any).location?.coordinates;
      if (coords && coords.length === 2) {
        setLng(coords[0]);
        setLat(coords[1]);
      }

      setHashtags(initialData.hashtags || []);
      setMenu(initialData.menu || []);
      setImages(initialData.images?.length ? initialData.images : [""]);
    }
  }, [initialData]);

  const handleHashtagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setHashtags((prev) => [...prev, tag]);
    } else {
      setHashtags((prev) => prev.filter((t) => t !== tag));
    }
  };

  const handleAddImage = () => {
    setImages((prev) => [...prev, ""]);
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      setImages([""]);
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleImageChange = (index: number, value: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? value : img)));
  };

  const handleAddMenuItem = () => {
    setMenu((prev) => [...prev, { name: "", price: 0 }]);
  };

  const handleRemoveMenuItem = (index: number) => {
    setMenu((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMenuItemChange = (index: number, key: keyof MenuItem, value: any) => {
    setMenu((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name: { ja: nameJa, vi: nameVi },
      description: { ja: descJa, vi: descVi },
      address: { ja: addrJa, vi: addrVi },
      district,
      openingHours: { open: openTime, close: closeTime },
      location: {
        type: "Point",
        coordinates: [Number(lng), Number(lat)]
      },
      images: images.map((img) => img.trim()).filter(Boolean),
      hashtags,
      menu: menu.filter((item) => item.name.trim() !== "")
    };

    try {
      await onSubmit(payload);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t("auth.error_generic");
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-sage-100 p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b border-sage-100 pb-3">
          {initialData ? t("manage.edit_title") : t("manage.create_title")}
        </h3>

        {/* Bilingual Names */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("manage.name_ja")} *
            </label>
            <input
              type="text"
              required
              value={nameJa}
              onChange={(e) => setNameJa(e.target.value)}
              className="w-full rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("manage.name_vi")} *
            </label>
            <input
              type="text"
              required
              value={nameVi}
              onChange={(e) => setNameVi(e.target.value)}
              className="w-full rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
            />
          </div>
        </div>

        {/* District */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("manage.district")} *
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 bg-white"
          >
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Bilingual Addresses */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("manage.address")} (JA) *
            </label>
            <input
              type="text"
              required
              value={addrJa}
              onChange={(e) => setAddrJa(e.target.value)}
              className="w-full rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("manage.address")} (VI) *
            </label>
            <input
              type="text"
              required
              value={addrVi}
              onChange={(e) => setAddrVi(e.target.value)}
              className="w-full rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
            />
          </div>
        </div>

        {/* Times */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("manage.open_time")} *
            </label>
            <input
              type="text"
              placeholder="08:00"
              required
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="w-full rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("manage.close_time")} *
            </label>
            <input
              type="text"
              placeholder="22:00"
              required
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="w-full rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
            />
          </div>
        </div>

        {/* Cafe Images */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-sage-100 pb-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("manage.image_url")}
            </label>
            <button
              type="button"
              onClick={handleAddImage}
              className="text-xs font-bold text-sage-600 bg-sage-50 hover:bg-sage-100 px-2.5 py-1 rounded-md transition-colors"
            >
              + {t("manage.add_image")}
            </button>
          </div>
          <div className="space-y-2">
            {images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={img}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  className="flex-1 rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-2.5 rounded-xl border border-transparent hover:border-red-100 transition-colors"
                >
                  {t("manage.remove")}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bilingual Descriptions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("manage.description_ja")} *
            </label>
            <textarea
              required
              value={descJa}
              onChange={(e) => setDescJa(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("manage.description_vi")} *
            </label>
            <textarea
              required
              value={descVi}
              onChange={(e) => setDescVi(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-sage-200 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
            />
          </div>
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("manage.hashtags")}
          </label>
          <div className="flex flex-wrap gap-4">
            {VALID_HASHTAGS.map((tag) => (
              <label key={tag} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hashtags.includes(tag)}
                  onChange={(e) => handleHashtagChange(tag, e.target.checked)}
                  className="rounded text-sage-600 focus:ring-sage-500 border-sage-300"
                />
                {t(`filter.${tag}`)}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Menu items list */}
      <div className="bg-white rounded-2xl border border-sage-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-sage-100 pb-3">
          <h3 className="text-base font-bold text-gray-900">
            {t("manage.menu_heading")}
          </h3>
          <button
            type="button"
            onClick={handleAddMenuItem}
            className="text-xs font-bold text-sage-600 bg-sage-50 hover:bg-sage-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            + {t("manage.add_menu_item")}
          </button>
        </div>

        {menu.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">メニュー項目がありません</p>
        ) : (
          <div className="space-y-3">
            {menu.map((item, index) => (
              <div key={index} className="flex flex-wrap items-center gap-3 bg-cream-50/20 p-3 rounded-xl border border-gray-100">
                <div className="flex-1 min-w-[150px]">
                  <input
                    type="text"
                    required
                    placeholder="メニュー名 (Coffee, Cake etc.)"
                    value={item.name}
                    onChange={(e) => handleMenuItemChange(index, "name", e.target.value)}
                    className="w-full rounded-lg border border-sage-200 px-3 py-1.5 text-sm outline-none focus:border-sage-500"
                  />
                </div>
                <div className="w-[120px]">
                  <input
                    type="number"
                    required
                    placeholder="価格 (VND)"
                    value={item.price}
                    onChange={(e) => handleMenuItemChange(index, "price", Number(e.target.value))}
                    className="w-full rounded-lg border border-sage-200 px-3 py-1.5 text-sm outline-none focus:border-sage-500"
                  />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <input
                    type="text"
                    placeholder={t("manage.menu_image_placeholder")}
                    value={item.image || ""}
                    onChange={(e) => handleMenuItemChange(index, "image", e.target.value)}
                    className="w-full rounded-lg border border-sage-200 px-3 py-1.5 text-sm outline-none focus:border-sage-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMenuItem(index)}
                  className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  {t("manage.remove")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-sage-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage-700 focus:outline-none disabled:opacity-50"
        >
          {isSubmitting
            ? t("auth.submitting")
            : initialData
              ? t("manage.submit_edit")
              : t("manage.submit_create")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl border border-sage-200 bg-white px-6 py-3 text-sm font-semibold text-sage-700 shadow-sm transition-colors hover:bg-sage-50 focus:outline-none disabled:opacity-50"
        >
          {t("manage.cancel")}
        </button>
      </div>
    </form>
  );
}
