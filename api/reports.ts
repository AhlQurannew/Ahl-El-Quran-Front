import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://6d87-105-99-72-20.ngrok-free.app/api/v1";

const axiosGlobal = axios.create({
    baseURL: `${API_URL}/president`,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
});

axiosGlobal.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
    config.headers['ngrok-skip-browser-warning'] = 'true';
            }

            // Check if admin is viewing a school (from session storage)
            const adminViewData = sessionStorage.getItem('admin_viewing_school');
            if (adminViewData) {
                try {
                    const { id } = JSON.parse(adminViewData);
                    // Add school_id as query parameter for GET requests
                    // or as body parameter for POST/PUT/PATCH requests
                    if (config.method?.toLowerCase() === 'get') {
                        config.params = { ...config.params, school_id: id };
                    } else if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
                        if (config.data && typeof config.data === 'object') {
                            config.data = { ...config.data, school_id: id };
                        }
                    }
                } catch (e) {
                    console.error('Error parsing admin view data:', e);
                }
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
