import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

const axiosGlobal = axios.create({
    baseURL: `${API_URL}/admin`,
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
                console.log("🔑 Auth token attached to request:", config.url); // Debug log
            } else {
                console.warn("⚠️ No auth token found for request:", config.url); // Debug log
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
            if (!window.location.pathname.includes("/login")) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login?expired=true";
            }
        }
        return Promise.reject(error);
    }
);

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

const getStatistics = async () => {
    const res = await axiosGlobal.get("/statistics/overview");
    return res.data;
};

const getSchoolsStatistics = async (limit: number = 3) => {
    const res = await axiosGlobal.get(`/statistics/schools?limit=${limit}`);
    return res.data;
};

const getAllSchools = async () => {
    const res = await axiosGlobal.get("/schools");
    return res.data;
};

const adminAPI = {
    getPendingPresidents,
    approvePresident,
    rejectPresident,
    getAllUsers,
    deactivateUser,
    getStatistics,
    getSchoolsStatistics,
    getAllSchools
};

export default adminAPI;
