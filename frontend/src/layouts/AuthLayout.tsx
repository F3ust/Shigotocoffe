import { Outlet } from "react-router-dom";
import LanguageToggle from "../components/common/LanguageToggle";

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-cream-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 120% 80% at 10% 0%, rgb(74 124 89 / 0.18), transparent 50%),
            radial-gradient(ellipse 90% 70% at 90% 10%, rgb(196 181 154 / 0.35), transparent 55%),
            radial-gradient(ellipse 70% 50% at 50% 100%, rgb(232 239 232 / 0.9), transparent 45%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2748%27%20height=%2748%27%20viewBox=%270%200%2048%2048%27%3E%3Cpath%20fill=%27%234a7c59%27%20fill-opacity=%27.06%27%20d=%27M24%2036c6-10%2018-10%2024%200-6%2010-18%2010-24%200z%27/%3E%3C/svg%3E')] opacity-60" aria-hidden />

      <div className="relative z-10 flex justify-end px-4 pt-4 sm:px-6">
        <LanguageToggle />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-12 pt-4 sm:px-6 sm:pb-16">
        <Outlet />
      </div>
    </div>
  );
}
