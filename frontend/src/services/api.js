import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api", // Reemplaza con la URL de tu API
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