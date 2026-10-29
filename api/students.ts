import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://6d87-105-99-72-20.ngrok-free.app/api/v1";

// Create dedicated axios instance for students with proper baseURL
const axiosGlobal = axios.create({
    baseURL: `${API_URL}/students`,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
});

// Add interceptors for authentication and school_id
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
}, (error) => Promise.reject(error));

axiosGlobal.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().clearAuth();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// TYPES 

export interface PersonalInfo {
    firstNameAr: string;
    lastNameAr: string;
    firstNameEn: string;
    lastNameEn: string;
    sex: string;
    dateOfBirth: string;
    placeOfBirth: string;
    homeAddress: string;
    nationality: string;
    fatherStatus: string;
    motherStatus: string;
}

export interface AccountInfo {
    username: string;
    passcode: string;
    accountType: string;
}

export interface ContactInfo {
    phoneNumber: string;
    email: string;
}

export interface Guardian {
    guardianId?: number;
    firstName: string;
    lastName: string;
    email: string;
    relationship: string;
    guardianContactId?: number;
    guardianAccountId?: number;
    homeAddress: string;
    job: string;
    profileImage?: string;
}

export interface FormalEducationInfo {
    academicLevel: string;
    grade: string;
    schoolName: string;
}

export interface CreateStudentPayload {
    personalInfo: PersonalInfo;
    accountInfo: AccountInfo;
    contactInfo: ContactInfo;
    guardian: Guardian;
    lectures: any[];
    formalEducationInfo: FormalEducationInfo;
}


export interface UpdateStudentPayload {
    firstname: string;
    lastname: string;
    email: string;
    parent_name: string;
    parent_phone: string;
    guardian_email: string;
    golden: boolean;
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

export interface AttendancePayload {
    student_id?: number;
    date: string;
    status: string;
    notes?: string;
}




const createStudent = async (data: CreateStudentPayload) => {
    const res = await axiosGlobal.post("/", data);
    return res.data;
};


const getStudents = async () => {
    const res = await axiosGlobal.get("/");
    return res.data;
};


const getStudent = async (student_id: number) => {
    const res = await axiosGlobal.get(`/${student_id}`);
    return res.data;
};

const updateStudent = async (
    student_id: number,
    data: UpdateStudentPayload
) => {
    const res = await axiosGlobal.put(`/${student_id}`, data);
    return res.data;
};


const updateStudentFull = async (
    student_id: number,
    data: CreateStudentPayload
) => {
    const res = await axiosGlobal.put(`/${student_id}/full`, data);
    return res.data;
};


const deleteStudent = async (student_id: number) => {
    await axiosGlobal.delete(`/${student_id}`);
};

// ================= ACHIEVEMENTS =================


const addAchievement = async (
    student_id: number,
    data: AchievementPayload
) => {
    const res = await axiosGlobal.post(
        `/${student_id}/achievements`,
        data
    );
    return res.data;
};


const getAchievements = async (
    student_id: number,
    params?: { skip?: number; limit?: number; date?: string }
) => {
    const res = await axiosGlobal.get(
        `/${student_id}/achievements`,
        { params }
    );
    return res.data;
};


const updateAchievement = async (
    student_id: number,
    achievement_id: number,
    data: AchievementPayload
) => {
    const res = await axiosGlobal.put(
        `/${student_id}/achievements/${achievement_id}`,
        data
    );
    return res.data;
};

const deleteAchievement = async (
    student_id: number,
    achievement_id: number
) => {
    await axiosGlobal.delete(
        `/${student_id}/achievements/${achievement_id}`
    );
};



const createAttendance = async (
    student_id: number,
    data: AttendancePayload
) => {
    const payload = {
        student_id: student_id,
        ...data,
    };
    const res = await axiosGlobal.post(
        `/${student_id}/attendance`,
        payload
    );
    return res.data;
};


const getAttendance = async (
    student_id: number,
    params?: { skip?: number; limit?: number; date?: string }
) => {
    const res = await axiosGlobal.get(
        `/${student_id}/attendance`,
        { params }
    );
    return res.data;
};


const updateAttendance = async (
    student_id: number,
    attendance_id: number,
    data: Partial<AttendancePayload>
) => {
    const res = await axiosGlobal.put(
        `/${student_id}/attendance/${attendance_id}`,
        data
    );
    return res.data;
};

const deleteAttendance = async (
    student_id: number,
    attendance_id: number
) => {
    await axiosGlobal.delete(
        `/${student_id}/attendance/${attendance_id}`
    );
};



const studentsAPI = {
    createStudent,
    getStudents,
    getStudent,
    updateStudent,
    updateStudentFull,
    deleteStudent,

    addAchievement,
    getAchievements,
    updateAchievement,
    deleteAchievement,

    createAttendance,
    getAttendance,
    updateAttendance,
    deleteAttendance,
};

export default studentsAPI;