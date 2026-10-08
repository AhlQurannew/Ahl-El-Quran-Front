import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const axiosGlobal = axios.create({
    baseURL: `${API_URL}/lectures`,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosGlobal.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Check if admin is viewing a school (from session storage)
    if (typeof window !== 'undefined') {
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
});

// TYPES 

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