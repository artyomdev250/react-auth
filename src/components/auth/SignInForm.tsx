import { useState } from "react";

import { Link } from "react-router-dom"
import { IconContext } from "react-icons"

import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";

function SignInForm() {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    return (
        <form className="w-[450px]">
            <p className="font-bold text-2xl">Enter an account</p>
            <div className="my-8 flex flex-col gap-6">
                <div>
                    <p className="mb-3 text-[15px] font-medium text-neutral-300">Email</p>
                    <input className="w-full focus:border-blue-600 transition-colors text-[15px] font-medium outline-0 p-[17px] border-neutral-800 border-2 rounded-[10px]" type="text" placeholder="Enter your email" />
                </div>
                <div>
                    <p className="mb-3 text-[15px] font-medium text-neutral-300">Password</p>
                    <div className="group flex items-center gap-[8.5px] border-2 border-neutral-800 rounded-[10px] pr-[17px] focus-within:border-blue-600 transition-colors">
                        <input
                            className="w-full outline-0 text-[15px] font-medium p-[17px]"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                        />
                        <button type="button" onClick={toggleShowPassword}>
                            <IconContext.Provider value={{ className: "eye" }}>
                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </IconContext.Provider>
                        </button>
                    </div>
                </div>
            </div>
            <button className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 transition-colors py-[17px] rounded-[10px] font-bold text-[15px]">
                Enter account
            </button>
            <center>
                <p className="mt-6 text-[15px] text-neutral-400 font-medium">
                    Don't Have An Account? <Link className="text-neutral-200" to="/signup">Sign Up</Link>
                </p>
            </center>
        </form>
    )
}

export default SignInForm