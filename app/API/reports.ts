import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { setupInterceptors } from "./interceptors";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const getAxiosClient = () => {
    const role = useAuthStore.getState().user?.role;
    const basePrefix = role === "TEACHER" ? "/teacher" : "/president";

    const client = axios.create({
        baseURL: `${API_URL}${basePrefix}`,
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
    });

    // Use the standard interceptors which include auth and school context
    setupInterceptors(client, true);

    // Add error logging interceptor
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            console.error("Reports API Error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url,
            });
            return Promise.reject(error);
        }
    );

    return client;
};

export interface StatsSummary {
    total_students: number;
    total_teachers?: number;
    total_supervisors?: number;
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
    const client = getAxiosClient();
    const res = await client.get("/statistics/summary");
    return res.data;
};

const getAttendanceTrend = async (limit: number = 10): Promise<AttendanceRecord[]> => {
    const client = getAxiosClient();
    const res = await client.get("/statistics/attendance-trend", {
        params: { limit },
    });
    return res.data;
};

const getTopMemorizers = async (limit: number = 5): Promise<MemorizationRecord[]> => {
    const client = getAxiosClient();
    const res = await client.get("/statistics/top-memorizers", {
        params: { limit },
    });
    return res.data;
};

const getLectureDistribution = async (): Promise<LectureDistribution[]> => {
    const client = getAxiosClient();
    const res = await client.get("/statistics/lecture-distribution");
    return res.data;
};

const getAchievementBreakdown = async (params?: {
    lecture_id?: number;
    student_id?: number;
    start_date?: string;
    end_date?: string;
}): Promise<{ normal: number; small: number; big: number }> => {
    const client = getAxiosClient();
    const res = await client.get("/statistics/achievement-breakdown", { params });
    return res.data;
};

const getAttendanceBreakdown = async (params?: {
    lecture_id?: number;
    student_id?: number;
    start_date?: string;
    end_date?: string;
}): Promise<{ present: number; late: number; absent: number; excused: number; total: number }> => {
    const client = getAxiosClient();
    const res = await client.get("/statistics/attendance-breakdown", { params });
    return res.data;
};

const getHalqaBreakdown = async (params: {
    lecture_id: number;
    start_date?: string;
    end_date?: string;
}): Promise<Array<{ student: string; pages: number }>> => {
    const client = getAxiosClient();
    const res = await client.get("/statistics/halqa-breakdown", { params });
    return res.data;
};

const getProgressTimeline = async (params: {
    student_id: number;
    start_date?: string;
    end_date?: string;
}): Promise<Array<{ date: string; memorization: number; minorRev: number; majorRev: number }>> => {
    const client = getAxiosClient();
    const res = await client.get("/statistics/progress-timeline", { params });
    return res.data;
};

const reportsAPI = {
    getStatsSummary,
    getAttendanceTrend,
    getTopMemorizers,
    getLectureDistribution,
    getAchievementBreakdown,
    getAttendanceBreakdown,
    getHalqaBreakdown,
    getProgressTimeline,
};

export default reportsAPI;
