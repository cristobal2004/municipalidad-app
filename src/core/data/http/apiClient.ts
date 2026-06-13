import axios from "axios";
import { environment } from "../../config/environment";
import { sessionStore } from "../../../features/auth/data/local/sessionStore";

const apiClient = axios.create({
  baseURL: environment.apiUrl,
  timeout: 15_000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStore.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStore.clear();

      if (typeof window !== "undefined") {
        window.location.assign("/");
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
