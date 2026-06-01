import axios from "axios";
import { parseAxiosError } from "./errors";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(parseAxiosError(error)),
);
