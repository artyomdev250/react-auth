import { useEffect } from "react";
import axios, { AxiosError } from "axios";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

// dedicated instance ONLY for authenticated requests
const axiosPrivate = axios.create({
    baseURL: client.defaults.baseURL,
});

export default function useAxiosPrivate() {
    const { accessToken, refreshToken, setAuthTokens, clearAuth } = useAuth();

    useEffect(() => {
        // attach Authorization header
        const reqInterceptor = axiosPrivate.interceptors.request.use(
            (config) => {
                if (accessToken) {
                    if (
                        config.headers &&
                        typeof (config.headers as any).set === "function"
                    ) {
                        (config.headers as any).set(
                            "Authorization",
                            `Bearer ${accessToken}`
                        );
                    } else {
                        config.headers = config.headers ?? {};
                        (config.headers as any)["Authorization"] = `Bearer ${accessToken}`;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // handle 401 -> refresh -> retry
        const resInterceptor = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest: any = error.config;

                if (!error.response) {
                    return Promise.reject(error);
                }

                if (error.response.status !== 401) {
                    return Promise.reject(error);
                }

                const isRefreshRequest =
                    typeof originalRequest?.url === "string" &&
                    originalRequest.url.includes("/api/auth/refresh");

                if (!refreshToken || originalRequest._retry || isRefreshRequest) {
                    clearAuth();
                    return Promise.reject(error);
                }

                originalRequest._retry = true;

                try {
                    // refresh with *plain* client (no interceptors!)
                    const res = await client.post("/api/auth/refresh", {
                        refreshToken,
                    });

                    const newAccessToken = (res.data as any).accessToken;
                    if (!newAccessToken) {
                        clearAuth();
                        return Promise.reject(error);
                    }

                    setAuthTokens({
                        accessToken: newAccessToken,
                        refreshToken,
                    });

                    if (
                        originalRequest.headers &&
                        typeof originalRequest.headers.set === "function"
                    ) {
                        originalRequest.headers.set(
                            "Authorization",
                            `Bearer ${newAccessToken}`
                        );
                    } else {
                        originalRequest.headers = originalRequest.headers ?? {};
                        originalRequest.headers["Authorization"] =
                            `Bearer ${newAccessToken}`;
                    }

                    return axiosPrivate(originalRequest);
                } catch (refreshErr) {
                    clearAuth();
                    return Promise.reject(refreshErr);
                }
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(reqInterceptor);
            axiosPrivate.interceptors.response.eject(resInterceptor);
        };
    }, [accessToken, refreshToken, setAuthTokens, clearAuth]);

    return axiosPrivate;
}
