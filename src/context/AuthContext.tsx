import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type AuthState = {
    accessToken: string | null;
    refreshToken: string | null;
};

type AuthContextValue = AuthState & {
    initializing: boolean;
    setAuthTokens: (tokens: AuthState) => void;
    clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "authTokens";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthState>({
        accessToken: null,
        refreshToken: null,
    });

    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as AuthState;
                setAuth(parsed);
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setInitializing(false);
    }, []);

    const setAuthTokens = (tokens: AuthState) => {
        setAuth(tokens);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    };

    const clearAuth = () => {
        setAuth({ accessToken: null, refreshToken: null });
        localStorage.removeItem(STORAGE_KEY);
    };

    const value: AuthContextValue = {
        ...auth,
        initializing,
        setAuthTokens,
        clearAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
