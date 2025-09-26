import axios from "axios"
import { BASE_URL } from "./apiPath"

const axiosInstance =axios.create({
    baseURL:BASE_URL,
    timeout:15000,
    headers:{
        "Content-Type":"application/json",
        Accept:"application/json",
    }
})
axiosInstance.interceptors.request.use(
    (config)=>{
        const accessToken=localStorage.getItem("token");
        if(accessToken){
            config.headers.Authorization=`Bearer${accessToken}`
        }
        return config;
    },
    (err)=>{
        return Promise.reject(err);
    }
)
axiosInstance.interceptors.response.use(
    (res)=>{
        return res;
    },
    (err)=>{
        if(err.res){
            if(err.res.status===400){
                window.location.href="/login";
            }
            else if(err.res.status===500){
                console.error("Server error. Please try again later.");
            }
        }
        else if(err.code==="ECONNABORTED"){
            console.error("Request timeout. Please try again.")
        }
        return Promise.reject(err);
    }
)
export default axiosInstance;