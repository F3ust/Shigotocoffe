import type { ReactNode } from "react";

interface DetailSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function DetailSection({
  title,
  icon,
  children,
  className = "",
}: DetailSectionProps) {
  return (
    <section className={`rounded-2xl border border-sage-100 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-50 text-sage-700 [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </span>
        <h2 className="text-base font-bold tracking-tight text-sage-900 sm:text-lg">{title}</h2>
      </div>
      <div className="text-sm leading-relaxed text-gray-700 sm:text-[15px]">{children}</div>
    </section>
  );
}
