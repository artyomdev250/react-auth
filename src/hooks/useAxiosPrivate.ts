import { useEffect } from "react";
import axios, { AxiosError } from "axios";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "authTokens";

// dedicated instance ONLY for authenticated requests
const axiosPrivate = axios.create({
    baseURL: client.defaults.baseURL,
});

type StoredTokens = {
    accessToken: string | null;
    refreshToken: string | null;
};

function getStoredTokens(): StoredTokens {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null, refreshToken: null };
    try {
        return JSON.parse(raw) as StoredTokens;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return { accessToken: null, refreshToken: null };
    }
}

export default function useAxiosPrivate() {
    const { setAuthTokens, clearAuth } = useAuth();

    useEffect(() => {
        // REQUEST interceptor – always read latest token
        const reqInterceptor = axiosPrivate.interceptors.request.use(
            (config) => {
                const { accessToken } = getStoredTokens();

                if (accessToken) {
                    if (config.headers && typeof (config.headers as any).set === "function") {
                        (config.headers as any).set("Authorization", `Bearer ${accessToken}`);
                    } else {
                        config.headers = config.headers ?? {};
                        (config.headers as any)["Authorization"] = `Bearer ${accessToken}`;
                    }
                }

                return config;
            },
            (error) => Promise.reject(error),
        );

        // RESPONSE interceptor – refresh then retry once
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

                const { refreshToken } = getStoredTokens();

                if (!refreshToken || originalRequest._retry || isRefreshRequest) {
                    clearAuth();
                    return Promise.reject(error);
                }

                originalRequest._retry = true;

                try {
                    // call /refresh WITHOUT axiosPrivate (no interceptors)
                    const res = await client.post("/api/auth/refresh", {
                        refreshToken,
                    });

                    const newAccessToken = (res.data as any).accessToken;

                    if (!newAccessToken) {
                        clearAuth();
                        return Promise.reject(error);
                    }

                    // update context + localStorage
                    setAuthTokens({
                        accessToken: newAccessToken,
                        refreshToken,
                    });

                    // make sure retry request carries the new token explicitly
                    if (
                        originalRequest.headers &&
                        typeof originalRequest.headers.set === "function"
                    ) {
                        originalRequest.headers.set(
                            "Authorization",
                            `Bearer ${newAccessToken}`,
                        );
                    } else {
                        originalRequest.headers = originalRequest.headers ?? {};
                        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    }

                    return axiosPrivate(originalRequest);
                } catch (refreshErr) {
                    clearAuth();
                    return Promise.reject(refreshErr);
                }
            },
        );

        return () => {
            axiosPrivate.interceptors.request.eject(reqInterceptor);
            axiosPrivate.interceptors.response.eject(resInterceptor);
        };
    }, [setAuthTokens, clearAuth]);

    return axiosPrivate;
}
