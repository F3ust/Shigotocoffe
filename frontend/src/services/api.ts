import axios from "axios";
import type { CafeListResponse, CafeQueryParams, Cafe } from "../types/cafe";
import type { CafeReviewsResponse } from "../types/review";

export const AUTH_TOKEN_KEY = "shigoto_auth_token";

/** Persisted after successful login/register (name, email, role). Cleared with token on logout. */
export const AUTH_USER_KEY = "shigoto_auth_user";

/** Same-tab updates after login/logout (storage event only fires in other tabs). */
export const AUTH_TOKEN_CHANGE_EVENT = "shigoto-auth-token-change";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthSuccessBody {
  status: string;
  data: {
    token: string;
    user: AuthUser;
  };
}

type ApiErrorBody = {
  message?: string;
  errors?: Array<{ field?: string; message?: string }>;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
});

export function getAuthToken(): string | null {
  try {
    const v = localStorage.getItem(AUTH_TOKEN_KEY);
    return v && v.trim() !== "" ? v : null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token === null || token === "") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } else {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
  } catch {
    /* ignore quota / private mode */
  }
}

export function setAuthUser(user: AuthUser | null): void {
  try {
    if (user === null) {
      localStorage.removeItem(AUTH_USER_KEY);
    } else {
      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        })
      );
    }
    window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw || raw.trim() === "") return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      typeof parsed._id === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.email === "string"
    ) {
      return {
        _id: parsed._id,
        name: parsed.name,
        email: parsed.email,
        role: typeof parsed.role === "string" ? parsed.role : "user",
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Clears JWT and stored user profile (same-tab listeners via AUTH_TOKEN_CHANGE_EVENT). */
export function logoutUser(): void {
  setAuthToken(null);
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getAuthErrorMessage(err: unknown): string | null {
  if (!axios.isAxiosError(err)) return null;
  const data = err.response?.data as ApiErrorBody | undefined;
  if (!data) return null;

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const parts = data.errors
      .map((e) => (typeof e.message === "string" ? e.message : null))
      .filter((s): s is string => Boolean(s?.trim()));
    if (parts.length > 0) return parts.join(" ");
  }

  if (typeof data.message === "string" && data.message.trim() !== "") {
    return data.message.trim();
  }

  return null;
}

export async function loginUser(body: {
  email: string;
  password: string;
}): Promise<{ token: string; user: AuthUser }> {
  const { data } = await api.post<AuthSuccessBody>("/auth/login", body);
  const payload = data.data;
  setAuthToken(payload.token);
  setAuthUser({
    ...payload.user,
    role: payload.user.role ?? "user",
  });
  return payload;
}

export async function registerUser(body: {
  name: string;
  email: string;
  password: string;
  role: "user" | "owner";
}): Promise<{ token: string; user: AuthUser }> {
  const { data } = await api.post<AuthSuccessBody>("/auth/register", body);
  const payload = data.data;
  setAuthToken(payload.token);
  setAuthUser({
    ...payload.user,
    role: payload.user.role ?? "user",
  });
  return payload;
}

export async function fetchCafes(
  params: CafeQueryParams = {}
): Promise<CafeListResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  );
  const { data } = await api.get<CafeListResponse>("/cafes", {
    params: cleanParams,
  });
  return data;
}

export async function fetchCafeById(
  id: string
): Promise<{ status: string; data: Cafe }> {
  const { data } = await api.get<{ status: string; data: Cafe }>(
    `/cafes/${id}`
  );
  return data;
}

export async function fetchReviewsForCafe(
  cafeId: string
): Promise<CafeReviewsResponse> {
  const { data } = await api.get<CafeReviewsResponse>(
    `/cafes/${cafeId}/reviews`
  );
  return data;
}
