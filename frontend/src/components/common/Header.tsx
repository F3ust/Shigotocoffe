import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";
import {
  AUTH_TOKEN_CHANGE_EVENT,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  getAuthToken,
  getAuthUser,
  logoutUser,
} from "../../services/api";

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const syncAuthState = useCallback(() => {
    return {
      loggedIn: getAuthToken() !== null,
      name: getAuthUser()?.name ?? null,
    };
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(() => syncAuthState().loggedIn);
  const [accountName, setAccountName] = useState<string | null>(() => syncAuthState().name);

  useEffect(() => {
    function applyAuthState() {
      const s = syncAuthState();
      setIsLoggedIn(s.loggedIn);
      setAccountName(s.name);
    }

    applyAuthState();

    function onStorage(e: StorageEvent) {
      if (
        e.key === AUTH_TOKEN_KEY ||
        e.key === AUTH_USER_KEY ||
        e.key === null
      ) {
        applyAuthState();
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_TOKEN_CHANGE_EVENT, applyAuthState);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, applyAuthState);
    };
  }, [syncAuthState]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logoutUser();
    setMenuOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-sage-200/60 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-600 text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 110 8h-1" />
              <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
              <line x1="6" y1="2" x2="6" y2="4" />
              <line x1="10" y1="2" x2="10" y2="4" />
              <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
          </div>
          <div className="leading-tight">
            <span className="text-lg font-bold text-sage-800">
              {t("app_name")}
            </span>
            <span className="block text-[11px] text-sage-500">
              {t("app_tagline")}
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            id="nav-home"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50"
          >
            <span>🏠</span>
            {t("nav.home")}
          </Link>

          <LanguageToggle />

          <div className="relative" ref={menuRef}>
            <button
              id="account-icon"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-sage-300 bg-sage-50 text-sage-600 transition-all hover:border-sage-400 hover:bg-sage-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                {isLoggedIn ? (
                  <>
                    {accountName && (
                      <div
                        id="menu-account-name"
                        className="border-b border-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800"
                      >
                        {accountName}
                      </div>
                    )}
                    <button
                      id="menu-logout"
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-sage-50"
                    >
                      <span>🚪</span> {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      id="menu-login"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-sage-50"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      to="/register"
                      id="menu-register"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-sm text-sage-600 transition-colors hover:bg-sage-50"
                    >
                      {t("nav.register")}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
