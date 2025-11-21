import { useEffect } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const axiosPrivate = client;

export default function useAxiosPrivate() {
    const { accessToken } = useAuth();

    useEffect(() => {
        const reqInterceptor = axiosPrivate.interceptors.request.use(
            (config) => {
                if (accessToken) {
                    if (config.headers && typeof (config.headers as any).set === "function") {
                        (config.headers as any).set("Authorization", `Bearer ${accessToken}`);
                    } else {
                        config.headers = config.headers ?? {};
                        config.headers["Authorization"] = `Bearer ${accessToken}`;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            axiosPrivate.interceptors.request.eject(reqInterceptor);
        };
    }, [accessToken]);

    return axiosPrivate;
}
