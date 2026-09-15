import axios from "axios";

const api = axios.create({
    baseURL: "https://346dqh3n-3000.use2.devtunnels.ms/api"
});

// Interceptor de solicitudes para adjuntar automáticamente el token JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;