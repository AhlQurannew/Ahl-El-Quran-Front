import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// axios 
const axiosGlobal = axios.create({
    baseURL: `${API_URL}/guardian`,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosGlobal.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// TYPES

export interface GuardianPayload {
    guardian_info: {
        first_name: string;
        last_name: string;
        relationship: string;
        date_of_birth: string;
        phone_number: string;
        email: string;
        job: string;
        address: string;
    };
    account_info: {
        username: string;
        password: string;
    };
    student_id: number;
}



const getGuardians = async (skip = 0, limit = 100) => {
    const res = await axiosGlobal.get("/", {
        params: { skip, limit },
    });
    return res.data;
};

const getGuardian = async (guardianId: number) => {
    const res = await axiosGlobal.get(`/${guardianId}`);
    return res.data;
};

const createGuardian = async (data: GuardianPayload) => {
    const res = await axiosGlobal.post("/", data);
    return res.data;
};

const updateGuardian = async (
    guardianId: number,
    data: GuardianPayload
) => {
    const res = await axiosGlobal.put(`/${guardianId}`, data);
    return res.data;
};

const deleteGuardian = async (guardianId: number) => {
    const res = await axiosGlobal.delete(`/${guardianId}`);
    return res.data;
};



const getMyChildren = async (skip = 0, limit = 100) => {
    const res = await axiosGlobal.get("/my-children", {
        params: { skip, limit },
    });
    return res.data;
};

const getMyChild = async (studentId: number) => {
    const res = await axiosGlobal.get(`/my-children/${studentId}`);
    return res.data;
};



const getStudentAchievements = async (
    studentId: number,
    params?: {
        start_date?: string;
        end_date?: string;
        page?: number;
        page_size?: number;
    }
) => {
    const res = await axiosGlobal.get(
        `/students/${studentId}/achievements`,
        { params }
    );
    return res.data;
};

const getStudentAttendance = async (
    studentId: number,
    params?: {
        start_date?: string;
        end_date?: string;
        page?: number;
        page_size?: number;
    }
) => {
    const res = await axiosGlobal.get(
        `/students/${studentId}/attendance`,
        { params }
    );
    return res.data;
};



const guardianAPI = {
    getGuardians,
    getGuardian,
    createGuardian,
    updateGuardian,
    deleteGuardian,
    getMyChildren,
    getMyChild,
    getStudentAchievements,
    getStudentAttendance,
};

export default guardianAPI;