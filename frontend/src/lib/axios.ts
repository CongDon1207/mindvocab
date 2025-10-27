import axios, { AxiosInstance } from "axios";

const BASE_URL: string =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

export default api;
