import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import env from './env.configs';

const { BASE_URL } = env;

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (
      error.response?.status === 403 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        await axiosClient.post('/auth/refresh');
        return axiosClient(originalRequest);
      } catch (refreshError) {
        await axiosClient.post('/auth/logout');
        window.location.reload();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
