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

export async function createReview(
  cafeId: string,
  body: { rating: number; comment?: string }
): Promise<void> {
  await api.post(`/cafes/${cafeId}/reviews`, body);
}

export async function updateReview(
  reviewId: string,
  body: { rating: number; comment?: string }
): Promise<void> {
  await api.patch(`/reviews/${reviewId}`, body);
}

export async function deleteReview(reviewId: string): Promise<void> {
  await api.delete(`/reviews/${reviewId}`);
}

export async function fetchUserProfile(): Promise<{ status: string; data: AuthUser }> {
  const { data } = await api.get<{ status: string; data: AuthUser }>("/users/me");
  return data;
}

export async function updateUserProfile(
  body: { name?: string; email?: string }
): Promise<{ status: string; data: AuthUser }> {
  const { data } = await api.patch<{ status: string; data: AuthUser }>("/users/me", body);
  // Also update stored user in localStorage
  const currentUser = getAuthUser();
  if (currentUser) {
    setAuthUser({
      ...currentUser,
      ...data.data,
    });
  }
  return data;
}

export async function createCafe(
  body: Partial<Cafe>
): Promise<{ status: string; data: Cafe }> {
  const { data } = await api.post<{ status: string; data: Cafe }>("/cafes", body);
  return data;
}

export async function updateCafe(
  id: string,
  body: Partial<Cafe>
): Promise<{ status: string; data: Cafe }> {
  const { data } = await api.patch<{ status: string; data: Cafe }>(`/cafes/${id}`, body);
  return data;
}

export async function deleteCafe(id: string): Promise<void> {
  await api.delete(`/cafes/${id}`);
}

export async function logoutUserToServer(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.error("Server logout error:", err);
  } finally {
    setAuthToken(null);
  }
}

function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.7
): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  let fileToUpload = file;
  try {
    fileToUpload = await compressImage(file);
  } catch (err) {
    console.error("Image compression failed, using original file:", err);
  }

  const formData = new FormData();
  formData.append("image", fileToUpload);
  const { data } = await api.post<{ status: string; data: { url: string } }>("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data.data;
}

export async function replyToReview(reviewId: string, comment: string): Promise<void> {
  await api.post(`/reviews/${reviewId}/reply`, { comment });
}

export async function addFavorite(cafeId: string): Promise<void> {
  await api.post(`/users/favorites/${cafeId}`);
}

export async function removeFavorite(cafeId: string): Promise<void> {
  await api.delete(`/users/favorites/${cafeId}`);
}

export async function fetchFavorites(): Promise<{ status: string; data: Cafe[] }> {
  const { data } = await api.get<{ status: string; data: Cafe[] }>("/users/favorites");
  return data;
}

