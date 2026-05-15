import type { MenuItem } from "../../types/cafe";

const MENU_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80";

interface MenuCardProps {
  item: MenuItem;
  locale: string;
}

export default function MenuCard({ item, locale }: MenuCardProps) {
  const src = item.image?.trim() ? item.image : MENU_FALLBACK_IMAGE;

  return (
    <article className="w-[168px] shrink-0 overflow-hidden rounded-2xl border border-sage-100 bg-cream-50 shadow-sm">
      <div className="aspect-[4/3] w-full overflow-hidden bg-cream-200">
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{item.name}</p>
        <p className="text-sm font-bold text-sage-700">
          {item.price.toLocaleString(locale)}
        </p>
      </div>
    </article>
  );
}
