import axios from "axios";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
export { BASE_URL as API_BASE_URL };

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  responseType: "json",
});

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

const getSavedToken = () => localStorage.getItem("token");
const getSavedRefreshToken = () => localStorage.getItem("refreshToken");

api.interceptors.request.use(
  (config) => {
    const token = getSavedToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const refreshTokens = async () => {
  const refreshToken = getSavedRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } },
  );

  if (response.status !== 200) {
    throw new Error("Unable to refresh token");
  }

  const data = response.data;
  if (data?.accessToken) {
    localStorage.setItem("token", data.accessToken);
  }
  if (data?.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  return data;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshTokens()
          .then((data) => {
            isRefreshing = false;
            refreshPromise = null;
            api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
            return data;
          })
          .catch((refreshError) => {
            isRefreshing = false;
            refreshPromise = null;
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            return Promise.reject(refreshError);
          });
      }

      try {
        const tokens = await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
