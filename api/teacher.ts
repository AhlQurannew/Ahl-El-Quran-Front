import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const axiosGlobal = axios.create({
    baseURL: `${API_URL}/teacher`,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
});

axiosGlobal.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    
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

axiosGlobal.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            logout(true);
        }
        return Promise.reject(error);
    }
);

// Interceptors are configured above

export interface Teacher {
    id: number;
    user_id: number;
    firstname: string;
    lastname: string;
    email: string;
    riwaya: string;
    hire_date: string;
    is_active: boolean;
}

export interface TeacherListResponse {
    teachers: Teacher[];
    total: number;
}

export interface StudentAttendancePayload {
    date: string;
    status: string;
    notes?: string;
}

export interface AchievementPayload {
    from_surah: number;
    to_surah: number;
    from_verse: number;
    to_verse: number;
    note: string;
    achievement_type: string;
    date: string;
}
const createTeacher = async (data: {
    firstname: string;
    lastname: string;
    email: string;
    riwaya: string;
    password: string;
}) => {
    const res = await axiosGlobal.post("/", data);
    return res.data;
};

const getTeachers = async (skip = 0, limit = 100, school_id?: number): Promise<TeacherListResponse> => {
    const params: any = { skip, limit };
    if (school_id !== undefined) {
        params.school_id = school_id;
    }
    const res = await axiosGlobal.get("/", { params });
    return res.data;
};

const getTeacherById = async (teacher_id: number): Promise<Teacher> => {
    const res = await axiosGlobal.get(`/${teacher_id}`);
    return res.data;
};

const updateTeacher = async (teacher_id: number, data: Partial<Teacher>) => {
    const res = await axiosGlobal.put(`/${teacher_id}`, data);
    return res.data;
};

const deleteTeacher = async (teacher_id: number) => {
    await axiosGlobal.delete(`/${teacher_id}`);
};

const getMyStudents = async (params?: {
    skip?: number;
    limit?: number;
    lecture_id?: number;
}) => {
    const res = await axiosGlobal.get("/my-students", { params });
    return res.data;
};

const getMyStudentDetail = async (student_id: number) => {
    const res = await axiosGlobal.get(`/my-students/${student_id}`);
    return res.data;
};

const getMyLectures = async () => {
    const res = await axiosGlobal.get("/my-lectures");
    return res.data;
};

const createSession = async () => {
    const res = await axiosGlobal.post("/session_creation");
    return res.data;
};

const createStudentAttendance = async (
    student_id: number,
    data: StudentAttendancePayload
) => {
    const payload = {
        student_id: Number(student_id),
        ...data,
    };
    const res = await axiosGlobal.post(`/my-students/${student_id}/attendance`, payload);
    return res.data;
};

const getStudentAttendance = async (
    student_id: number,
    params?: { date?: string; skip?: number; limit?: number }
) => {
    const res = await axiosGlobal.get(`/my-students/${student_id}/attendance`, { params });
    return res.data;
};

const updateStudentAttendance = async (
    student_id: number,
    attendance_id: number,
    data: Partial<StudentAttendancePayload>
) => {
    const res = await axiosGlobal.put(
        `/my-students/${student_id}/attendance/${attendance_id}`,
        data
    );
    return res.data;
};

const deleteStudentAttendance = async (
    student_id: number,
    attendance_id: number
) => {
    await axiosGlobal.delete(
        `/my-students/${student_id}/attendance/${attendance_id}`
    );
};

const createAchievement = async (
    student_id: number,
    data: AchievementPayload
) => {
    const payload = {
        student_id: (data as any).student_id ?? Number(student_id),
        ...data,
    };
    const res = await axiosGlobal.post(
        `/my-students/${student_id}/achievements`,
        payload
    );
    return res.data;
};

const getAchievements = async (
    student_id: number,
    params?: { skip?: number; limit?: number; date?: string }
) => {
    const res = await axiosGlobal.get(
        `/my-students/${student_id}/achievements`,
        { params }
    );
    return res.data;
};

const updateAchievement = async (
    student_id: number,
    achievement_id: number,
    data: Partial<AchievementPayload>
) => {
    const res = await axiosGlobal.put(
        `/my-students/${student_id}/achievements/${achievement_id}`,
        data
    );
    return res.data;
};

const deleteAchievement = async (
    student_id: number,
    achievement_id: number
) => {
    await axiosGlobal.delete(
        `/my-students/${student_id}/achievements/${achievement_id}`
    );
};

const teacherAPI = {
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getMyStudents,
    getMyStudentDetail,
    getMyLectures,
    createSession,
    createStudentAttendance,
    getStudentAttendance,
    updateStudentAttendance,
    deleteStudentAttendance,
    createAchievement,
    getAchievements,
    updateAchievement,
    deleteAchievement,
};

export default teacherAPI;