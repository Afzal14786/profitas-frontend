import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/* ----------------------------- token helpers ----------------------------- */

export const tokenStore = {
  get access() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  },
  set(access: string, refresh: string) {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  },
  clear() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

/* ----------------------------- request interceptor ----------------------------- */

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ----------------------------- response interceptor ----------------------------- */

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Avoid loop: only refresh once, and skip the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      tokenStore.refresh &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${BASE_URL}/auth/refresh`, {
            refreshToken: tokenStore.refresh,
          })
          .then((r) => {
            const newToken = r.data.data.accessToken as string;
            localStorage.setItem("accessToken", newToken);
            return newToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        tokenStore.clear();
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

/* ----------------------------- error helper ----------------------------- */

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 403) {
      return (
        (err.response.data as { message?: string })?.message ||
        "You don't have permission to perform this action."
      );
    }
    if (err.response?.status === 401) {
      return "Your session has expired. Please log in again.";
    }
    if (err.response?.status === 404) {
      return (
        (err.response.data as { message?: string })?.message ||
        "Resource not found."
      );
    }
    return (
      (err.response?.data as { message?: string })?.message ||
      err.message ||
      "Request failed"
    );
  }
  return "Unexpected error";
}
