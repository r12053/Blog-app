import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://blog-app-cial.onrender.com/api", // Change to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;
