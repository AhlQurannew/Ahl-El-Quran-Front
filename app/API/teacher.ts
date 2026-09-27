import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const axiosGlobal = axios.create({
    baseURL: `${API_URL}/teacher`,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosGlobal.interceptors.request.use((config) => {
    const directToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const zustandToken = useAuthStore.getState().accessToken;
    const token = directToken || zustandToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});





// 🧾 TYPES


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

export interface TeacherAttendancePayload {
    teacher_id?: number;  // Optional - backend schema says it's optional
    date: string;          // DD-MM-YYYY format
    status: string;        // "present" | "late" | "absent" | "excused"
    notes?: string;        // Optional
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

const getTeachers = async (skip = 0, limit = 100): Promise<TeacherListResponse> => {
    const res = await axiosGlobal.get("/", { params: { skip, limit } });
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
    const res = await axiosGlobal.post(`/my-students/${student_id}/attendance`, data);
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
    const res = await axiosGlobal.post(
        `/my-students/${student_id}/achievements`,
        data
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

// ================= TEACHER ATTENDANCE =================

const createTeacherAttendance = async (
    teacher_id: number,
    data: TeacherAttendancePayload
) => {
    const payload = {
        teacher_id: teacher_id,
        ...data,
    };
    const res = await axiosGlobal.post(`/${teacher_id}/attendance`, payload);
    return res.data;
};

const getTeacherAttendance = async (
    teacher_id: number,
    params?: { date?: string; skip?: number; limit?: number }
) => {
    const res = await axiosGlobal.get(`/${teacher_id}/attendance`, { params });
    return res.data;
};

const updateTeacherAttendance = async (
    teacher_id: number,
    attendance_id: number,
    data: Partial<TeacherAttendancePayload>
) => {
    const res = await axiosGlobal.put(
        `/${teacher_id}/attendance/${attendance_id}`,
        data
    );
    return res.data;
};

const deleteTeacherAttendance = async (
    teacher_id: number,
    attendance_id: number
) => {
    await axiosGlobal.delete(
        `/${teacher_id}/attendance/${attendance_id}`
    );
};


const teacherAPI = {
    // CRUD
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,

    // teacher scope
    getMyStudents,
    getMyStudentDetail,
    getMyLectures,
    createSession,

    // student attendance (by teacher)
    createStudentAttendance,
    getStudentAttendance,
    updateStudentAttendance,
    deleteStudentAttendance,

    // achievements
    createAchievement,
    getAchievements,
    updateAchievement,
    deleteAchievement,

    // teacher attendance
    createTeacherAttendance,
    getTeacherAttendance,
    updateTeacherAttendance,
    deleteTeacherAttendance,
};

export default teacherAPI;