import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const axiosGlobal = axios.create({
    baseURL: `${API_URL}/president`,
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

axiosGlobal.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Reports API Error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        
        if (error.response && error.response.status === 401) {
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login?expired=true";
            }
        }
        return Promise.reject(error);
    }
);

export interface StatsSummary {
    total_students: number;
    present_today: number;
    total_pages_memorized: number;
    total_lectures: number;
}

export interface AttendanceRecord {
    date: string;
    present: number;
    absent: number;
    total: number;
    percentage: string;
}

export interface MemorizationRecord {
    student: string;
    pages: number;
    rank: number;
}

export interface LectureDistribution {
    className: string;
    students: number;
    percentage: string;
}

const getStatsSummary = async (): Promise<StatsSummary> => {
    const res = await axiosGlobal.get("/statistics/summary");
    return res.data;
};

const getAttendanceTrend = async (limit: number = 10): Promise<AttendanceRecord[]> => {
    const res = await axiosGlobal.get("/statistics/attendance-trend", {
        params: { limit }
    });
    return res.data;
};

const getTopMemorizers = async (limit: number = 5): Promise<MemorizationRecord[]> => {
    const res = await axiosGlobal.get("/statistics/top-memorizers", {
        params: { limit }
    });
    return res.data;
};

const getLectureDistribution = async (): Promise<LectureDistribution[]> => {
    const res = await axiosGlobal.get("/statistics/lecture-distribution");
    return res.data;
};

const reportsAPI = {
    getStatsSummary,
    getAttendanceTrend,
    getTopMemorizers,
    getLectureDistribution
};

export default reportsAPI;
