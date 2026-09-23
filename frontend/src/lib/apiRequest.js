import axios from "axios";

const apiRequest = axios.create({
  baseURL: "http://localhost:4000",
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