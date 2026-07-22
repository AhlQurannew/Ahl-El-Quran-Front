import axios from "axios";
//auth.ts


const API_URL = process.env.NEXT_PUBLIC_API_URL;


if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
}


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
    email?: string;
    user?: string;
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


const loginAdmin = async (data: LoginPayload) => {
    const res = await axiosGlobal.post("/admin/login", data);
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
