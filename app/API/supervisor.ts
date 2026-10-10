import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const axiosGlobal = axios.create({
    baseURL: `${API_URL}/supervisors`,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
});

axiosGlobal.interceptors.request.use((config) => {
    const directToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const zustandToken = useAuthStore.getState().accessToken;
    const token = directToken || zustandToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    return config;
});

// TYPES
export interface Supervisor {
    id: string;
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

export interface SupervisorListResponse {
    supervisors: Supervisor[];
    total: number;
}

export interface SupervisorCreatePayload {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

export interface SupervisorUpdatePayload {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
}

const getSupervisors = async (skip = 0, limit = 100): Promise<SupervisorListResponse> => {
    const res = await axiosGlobal.get("/", { params: { skip, limit } });
    return res.data;
};

const getSupervisorById = async (supervisor_id: string): Promise<Supervisor> => {
    const res = await axiosGlobal.get(`/${supervisor_id}`);
    return res.data;
};

const updateSupervisor = async (supervisor_id: string, data: SupervisorUpdatePayload) => {
    const res = await axiosGlobal.put(`/${supervisor_id}`, data);
    return res.data;
};

const deleteSupervisor = async (supervisor_id: string) => {
    await axiosGlobal.delete(`/${supervisor_id}`);
};

const supervisorAPI = {
    getSupervisors,
    getSupervisorById,
    updateSupervisor,
    deleteSupervisor,
};

export default supervisorAPI;
