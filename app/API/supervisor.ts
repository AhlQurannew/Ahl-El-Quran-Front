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

    // Check if admin is viewing a school (from session storage)
    if (typeof window !== 'undefined') {
        const adminViewData = sessionStorage.getItem('admin_viewing_school');
        if (adminViewData) {
            try {
                const { id } = JSON.parse(adminViewData);
                config.headers['x-role-override'] = 'CHIEF_SUPERVISOR';
                config.params = { ...config.params, school_id: id };
            } catch (e) {
                console.error('Error parsing admin view data:', e);
            }
        }
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

const getSupervisors = async (skip = 0, limit = 100, school_id?: number): Promise<SupervisorListResponse> => {
    const params: Record<string, any> = { skip, limit };
    if (school_id) {
        params.school_id = school_id;
    }
    const res = await axiosGlobal.get("/", { params });
    return res.data;
};

const createSupervisor = async (data: SupervisorCreatePayload, school_id?: number): Promise<Supervisor> => {
    const params = school_id ? { school_id } : undefined;
    const res = await axiosGlobal.post("/", data, { params });
    return res.data;
};

const getSupervisorById = async (supervisor_id: string, school_id?: number): Promise<Supervisor> => {
    const params = school_id ? { school_id } : undefined;
    const res = await axiosGlobal.get(`/${supervisor_id}`, { params });
    return res.data;
};

const updateSupervisor = async (supervisor_id: string, data: SupervisorUpdatePayload, school_id?: number) => {
    const params = school_id ? { school_id } : undefined;
    const res = await axiosGlobal.put(`/${supervisor_id}`, data, { params });
    return res.data;
};

const deleteSupervisor = async (supervisor_id: string, school_id?: number) => {
    const params = school_id ? { school_id } : undefined;
    await axiosGlobal.delete(`/${supervisor_id}`, { params });
};

const supervisorAPI = {
    getSupervisors,
    createSupervisor,
    getSupervisorById,
    updateSupervisor,
    deleteSupervisor,
};

export default supervisorAPI;
