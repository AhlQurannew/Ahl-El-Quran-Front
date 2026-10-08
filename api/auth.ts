import axios from "axios";
import { logout } from "@/utils/auth";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const axiosGlobal = axios.create({
    baseURL: `${API_URL}/auth`,
    headers: {
        "Content-Type": "application/json",
    },
});


axiosGlobal.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
axiosGlobal.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== "undefined" && error.response && error.response.status === 401) {
            if (!window.location.pathname.includes("/login")) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login?expired=true";
            }
        }
        return Promise.reject(error);
    }
);
export interface RegisterPayload {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    phone_number: string;
    school_name: string;
}

export interface LoginPayload {
    email?: string;
    user?: string;
    password: string;
}

const registerPresident = async (data: RegisterPayload) => {
    const res = await axiosGlobal.post("/president/register", data);
    return res.data;
};

const loginPresident = async (data: LoginPayload) => {
    const res = await axiosGlobal.post("/president/login", data);
    return res.data;
};

const loginSupervisor = async (data: LoginPayload) => {
    const res = await axiosGlobal.post("/supervisor/login", data);
    return res.data;
};

const loginTeacher = async (data: LoginPayload) => {
    const res = await axiosGlobal.post("/teacher/login", data);
    return res.data;
};

const loginGuardian = async (data: LoginPayload) => {
    const res = await axiosGlobal.post("/guardian/login", data);
    return res.data;
};

const loginAdmin = async (data: LoginPayload) => {
    const res = await axiosGlobal.post("/admin/login", data);
    return res.data;
};

const getCurrentUser = async () => {
    const res = await axiosGlobal.get("/me");
    return res.data;
};

const getCurrentAdmin = async () => {
    const res = await axiosGlobal.get("/admin/me");
    return res.data;
};

const refreshToken = async () => {
    const res = await axiosGlobal.post("/token/refresh");
    return res.data;
};

const authAPI = {
    registerPresident,
    loginPresident,
    loginSupervisor,
    loginTeacher,
    loginGuardian,
    loginAdmin,
    getCurrentUser,
    getCurrentAdmin,
    refreshToken
};

export default authAPI;
