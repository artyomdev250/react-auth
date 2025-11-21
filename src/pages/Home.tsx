import { useEffect, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

type User = {
    nickname?: string;
};

function Home() {
    const axiosPrivate = useAxiosPrivate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchUser = async () => {
            try {
                const res = await axiosPrivate.get("/api/user/home", {
                    signal: controller.signal,
                });

                const data = res.data as any;
                const userData = data.user || data;
                if (isMounted) {
                    setUser(userData);
                }
            } catch (err: any) {
                if (err?.code === "ERR_CANCELED") return;
                console.error(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchUser();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [axiosPrivate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-neutral-900 text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-neutral-900 text-white gap-2">
            <h1 className="text-2xl font-semibold">
                Welcome{user?.nickname ? `, ${user.nickname}` : ""}!
            </h1>
        </div>
    );
}

export default Home;
