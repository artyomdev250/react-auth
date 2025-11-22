import { useState } from "react";
import type { FormEvent } from "react";

import { Link, useNavigate } from "react-router-dom";
import { IconContext } from "react-icons";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

import client from "../../api/client";

type SignUpResponse = {
    message: string;
};

function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitted(true);

        if (!email || !password || !name) {
            return;
        }

        setLoading(true);

        try {
            await client.post<SignUpResponse>("/api/auth/signup", {
                email,
                password,
                name,
            });

            setSuccess(true);

            setTimeout(() => {
                navigate("/signin");
            }, 2000);

        } catch (err: any) {
            const msg =
                err?.response?.data?.message || "Failed to create account.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const emailHasError = submitted && !email;
    const passwordHasError = submitted && !password;
    const nicknameHasError = submitted && !name;

    const toggleShowPassword = () => setShowPassword(!showPassword);

    return (
        <form className="w-[450px]" onSubmit={handleSubmit}>
            <p className="font-bold text-2xl">Create an account</p>

            <div className="my-8 flex flex-col gap-6">

                <div>
                    <p className="mb-3 text-[15px] font-medium text-neutral-300">Name</p>
                    <input
                        className={`w-full text-[15px] font-medium outline-0 p-[17px] border-2 rounded-[10px] transition-colors
                            ${nicknameHasError
                                ? "border-red-400"
                                : "border-neutral-800 focus:border-blue-600"
                            }`}
                        type="text"
                        placeholder="Create your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {nicknameHasError && (
                        <p className="mt-3 text-[15px] font-medium text-red-400">
                            Fill up the field
                        </p>
                    )}
                </div>

                <div>
                    <p className="mb-3 text-[15px] font-medium text-neutral-300">Email</p>
                    <input
                        className={`w-full text-[15px] font-medium outline-0 p-[17px] border-2 rounded-[10px] transition-colors
                            ${emailHasError
                                ? "border-red-400"
                                : "border-neutral-800 focus:border-blue-600"
                            }`}
                        type="text"
                        placeholder="Create your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {emailHasError && (
                        <p className="mt-3 text-[15px] font-medium text-red-400">
                            Fill up the field
                        </p>
                    )}
                </div>

                <div>
                    <p className="mb-3 text-[15px] font-medium text-neutral-300">Password</p>
                    <div
                        className={`group flex items-center gap-[8.5px] border-2 rounded-[10px] pr-[17px] transition-colors
                            ${passwordHasError
                                ? "border-red-400"
                                : "border-neutral-800 focus-within:border-blue-600"
                            }`}
                    >
                        <input
                            className="w-full outline-0 text-[15px] font-medium p-[17px]"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="button" onClick={toggleShowPassword}>
                            <IconContext.Provider value={{ className: "eye" }}>
                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </IconContext.Provider>
                        </button>
                    </div>
                    {passwordHasError && (
                        <p className="mt-3 text-[15px] font-medium text-red-400">
                            Fill up the field
                        </p>
                    )}
                </div>
            </div>

            {error && (
                <p className="mb-4 text-sm p-3 bg-red-200 rounded text-red-600 font-medium">
                    {error}
                </p>
            )}

            {success && (
                <p className="mb-4 text-sm p-3 bg-green-200 rounded text-green-600 font-medium">
                    Account created successfully!
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 transition-colors py-3 rounded font-medium mt-4 disabled:opacity-60"
            >
                {loading ? "Creating..." : "Create account"}
            </button>

            <center>
                <p className="mt-6 text-[15px] text-neutral-400 font-medium">
                    Already Have An Account? <Link className="text-neutral-200" to="/signin">Log In</Link>
                </p>
            </center>
        </form>
    );
}

export default SignUpForm;