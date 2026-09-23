import axios from "axios";

const apiRequest = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true,
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

export default apiRequest;