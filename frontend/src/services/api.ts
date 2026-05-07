import axios from "axios";
import type { CafeListResponse, CafeQueryParams } from "../types/cafe";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
});

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
