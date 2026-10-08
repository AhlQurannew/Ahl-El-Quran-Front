import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// axios
const axiosGlobal = axios.create({
    baseURL: `${API_URL}/auth`,
    headers: {
        "Content-Type": "application/json",
    },
});

//  TYPES
export interface RegisterPayload {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    phone_number: string;
    school_name: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

const registerPresident = async (data: RegisterPayload) => {
    const res = await axiosGlobal.post("/president/register", data);
    return res.data;
};

const loginPresident = async (data: LoginPayload) => {
    const res = await axiosGlobal.post("/president/login", data);
    return res.data;
};

const loginSupervisor = async (data: LoginPayload) => {
    const res = await axiosGlobal.post("/supervisor/login", data);
    return res.data;
};

const loginTeacher = async (data: LoginPayload) => {
    const res = await axiosGlobal.post("/teacher/login", data);
    return res.data;
};

const loginGuardian = async (data: LoginPayload) => {
    const res = await axiosGlobal.post("/guardian/login", data);
    return res.data;
};

const loginAdmin = async (data: { user?: string; email?: string; password: string }) => {
    const payload = {
        user: data.user || data.email || "",
        password: data.password,
    };
    const res = await axiosGlobal.post("/admin/login", payload);
    return res.data;
};
const getCurrentUser = async () => {
    const res = await axiosGlobal.get("/me");
    return res.data;
}
const getCurrentAdmin = async () => {
    const res = await axiosGlobal.get("/admin/me");
    return res.data;
}
const refreshToken = async () => {
    const res = await axiosGlobal.post("/token/refresh");
    return res.data;
}
const authAPI = {
    registerPresident,
    loginPresident,
    loginSupervisor,
    loginTeacher,
    loginGuardian,
    loginAdmin,
    getCurrentUser,
    getCurrentAdmin,
    refreshToken
};

export default authAPI;