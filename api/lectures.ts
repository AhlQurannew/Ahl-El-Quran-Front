import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

const axiosGlobal = axios.create({
    baseURL: `${API_URL}/lectures`,
    headers: {
        "Content-Type": "application/json",
    },
});
axiosGlobal.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = 
                localStorage.getItem("access_token") || 
                localStorage.getItem("token") || 
                localStorage.getItem("jwt");

            if (token) {
                const cleanToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
                config.headers.Authorization = cleanToken;
            } else {
                console.warn(" Aucun token d'authentification trouvé dans localStorage !");
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
            
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("token");
            localStorage.removeItem("jwt");

            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login?expired=true";
            }
        }
        return Promise.reject(error);
    }
);
export interface TeacherRef {
    teacher_id: number;
}

export interface Schedule {
    day_of_week: string;
    start_time: string;
    end_time: string;
    weekly_schedule_id?: number;
}

export interface Lecture {
    lecture_id: number;
    lecture_name_ar: string;
    lecture_name_en: string;
    circle_type: string;
    category: string;
    shown_on_website: boolean;
    teachers: any[];
    schedules: Schedule[];
    student_count: number;
    created_at: string;
    updated_at: string;
}

export interface LecturePayload {
    lecture: {
        lecture_name_ar: string;
        lecture_name_en: string;
        circle_type: string;
        category: string;
        shown_on_website: boolean;
        lecture_id?: number;
    };
    teachers: TeacherRef[];
    schedules: Schedule[];
}

const getLecturesBasic = async (): Promise<Lecture[]> => {
    const res = await axiosGlobal.get("/");
    return res.data;
};

const getAllLectures = async (): Promise<Lecture[]> => {
    const res = await axiosGlobal.get("/special/lectures");
    return res.data;
};

const getLectureById = async (lecture_id: number): Promise<Lecture> => {
    const res = await axiosGlobal.get(`/special/lectures/${lecture_id}`);
    return res.data;
};

const createLecture = async (data: LecturePayload): Promise<Lecture> => {
    const res = await axiosGlobal.post("/special/lectures/submit", data);
    return res.data;
};

const updateLecture = async (
    lecture_id: number,
    data: LecturePayload
): Promise<Lecture> => {
    const res = await axiosGlobal.put(
        `/special/lectures/${lecture_id}`,
        data
    );
    return res.data;
};

const deleteLecture = async (lecture_id: number): Promise<void> => {
    await axiosGlobal.delete(`/${lecture_id}`);
};

const lecturesAPI = {
    getLecturesBasic,
    getAllLectures,
    getLectureById,
    createLecture,
    updateLecture,
    deleteLecture,
};

export default lecturesAPI;