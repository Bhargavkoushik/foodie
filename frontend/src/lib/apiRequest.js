import axios from "axios";

// Determine the base backend URL dynamically:
// 1. VITE_BACKEND_URL (preferred, e.g. set in Vercel / Docker / .env)
// 2. VITE_API_URL (secondary Vite convention)
// 3. Smart production fallback: if deployed on *.vercel.app, route to production Render backend
// 4. Default for local development: http://localhost:4000
export const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname.includes("vercel.app") || window.location.hostname.includes("onrender.com"))
    ? "https://foodie-nzkz.onrender.com"
    : "http://localhost:4000");

const apiRequest = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

apiRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token && token !== "authenticated") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 503 || /buffering timed out|MongoDB|ECONNREFUSED|ENOTFOUND/.test(String(message || error?.message || ""))) {
      console.error("API service unavailable:", error?.response?.data || error?.message || error);
      if (error.response) {
        error.response.data = {
          ...error.response.data,
          message: "Service temporarily unavailable. Please try again.",
        };
      }
    }

    return Promise.reject(error);
  }
);

export default apiRequest;