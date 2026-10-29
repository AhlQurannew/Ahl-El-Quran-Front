import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// axios
const axiosGlobal = axios.create({
    baseURL: `${API_URL}/admin`,
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
    return config;
});


const getPendingPresidents = async () => {
    const res = await axiosGlobal.get("/pending-presidents");
    return res.data;
};


const approvePresident = async (user_id: number) => {
    const res = await axiosGlobal.post(`/approve-president/${user_id}`);
    return res.data;
};


const rejectPresident = async (user_id: number) => {
    const res = await axiosGlobal.delete(`/reject-president/${user_id}`);
    return res.data;
};


const getAllUsers = async () => {
    const res = await axiosGlobal.get("/all-users");
    return res.data;
};


const deactivateUser = async (user_id: number) => {
    const res = await axiosGlobal.patch(`/deactivate-user/${user_id}`);
    return res.data;
};

// School Management
const getAllSchools = async () => {
    const res = await axiosGlobal.get("/schools");
    return res.data;
};

const createSchool = async (schoolData: {
    school_name: string;
    chief_supervisor_firstname: string;
    chief_supervisor_lastname: string;
    email: string;
    password: string;
    phone_number?: string;
}) => {
    const res = await axiosGlobal.post("/schools", schoolData);
    return res.data;
};

const updateSchool = async (schoolId: number, schoolData: {
    school_name?: string;
    chief_supervisor_firstname?: string;
    chief_supervisor_lastname?: string;
    email?: string;
    password?: string;
    phone_number?: string;
}) => {
    const res = await axiosGlobal.put(`/schools/${schoolId}`, schoolData);
    return res.data;
};

const deleteSchool = async (schoolId: number) => {
    const res = await axiosGlobal.delete(`/schools/${schoolId}`);
    return res.data;
};

const getSchoolPresident = async (school_id: number) => {
    const res = await axiosGlobal.get(`/school/${school_id}/president`);
    return res.data;
};

// Statistics
const getAdminStatistics = async () => {
    const res = await axiosGlobal.get("/statistics/overview");
    return res.data;
};

const getSchoolsStatistics = async (limit: number = 3) => {
    const res = await axiosGlobal.get(`/statistics/schools?limit=${limit}`);
    return res.data;
};

const adminAPI = {
    getPendingPresidents,
    approvePresident,
    rejectPresident,
    getAllUsers,
    deactivateUser,
    getAllSchools,
    createSchool,
    updateSchool,
    deleteSchool,
    getSchoolPresident,
    getAdminStatistics,
    getSchoolsStatistics
};

export default adminAPI;