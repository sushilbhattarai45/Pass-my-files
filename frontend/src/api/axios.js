import axios from 'axios';
import { showToast } from '../utils/toast';

const RATE_LIMIT_MESSAGE = 'Too many requests. Please wait a minute.';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Let axios set multipart/form-data with the correct boundary
    if (config.headers?.delete) {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
    }
  } else if (config.data && typeof config.data === "object") {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      showToast(RATE_LIMIT_MESSAGE, 'warning');
      return Promise.reject(new Error(RATE_LIMIT_MESSAGE));
    }

    let message = error.message || 'Something went wrong';
    const data = error.response?.data;

    if (data instanceof Blob) {
      try {
        const json = JSON.parse(await data.text());
        message = json.error || message;
      } catch {
        message = 'Something went wrong';
      }
    } else if (data?.error) {
      message = data.error;
    } else if (data?.message) {
      message = data.message;
    }

    return Promise.reject(new Error(message));
  },
);

export default api;
