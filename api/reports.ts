import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

const axiosGlobal = axios.create({
    baseURL: `${API_URL}/president`,
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
