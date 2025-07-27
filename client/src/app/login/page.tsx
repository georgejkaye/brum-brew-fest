"use client"
import { KeyboardEvent, MouseEvent, useContext, useState } from "react"
import { getUserDetails, login } from "../api"
import { Loader } from "../Loader"
import { UserContext } from "../context/user"
import Link from "next/link"
import { LoginButton, LoginTextInput } from "../components/login"

const LoginBox = () => {
    const { setUser } = useContext(UserContext)
    const [emailString, setEmailString] = useState("")
    const [passwordString, setPasswordString] = useState("")
    const [errorString, setErrorString] = useState("")
    const [isLoading, setLoading] = useState(false)
    const [isLoginSuccessful, setLoginSuccessful] = useState(false)
    const performLogin = async () => {
        setLoading(true)
        let loginResult = await login(emailString, passwordString)
        if (loginResult.token === undefined) {
            setErrorString(`Could not log in: ${loginResult.error}`)
            setPasswordString("")
        } else {
            localStorage.setItem("token", loginResult.token)
            let user = await getUserDetails(loginResult.token)
            setUser(user)
            setErrorString("")
            setLoginSuccessful(true)
        }
        setLoading(false)
    }
    const onClickLogin = (e: MouseEvent<any>) => {
        performLogin()
    }
    const onKeyDownPassword = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            performLogin()
        }
    }
    return (
        <div className="w-full flex flex-col gap-4">
            {isLoginSuccessful ? (
                <>
                    <div className="w-full p-4 bg-green-300 rounded">
                        Login successful, redirecting you to the home page...
                    </div>
                    <Loader />
                </>
            ) : isLoading ? (
                <Loader />
            ) : (
                <>
                    <h2 className="text-2xl font-bold">Login</h2>
                    {errorString && (
                        <div className="p-4 bg-red-300 rounded-lg">
                            {errorString}
                        </div>
                    )}
                    <div>
                        <div>Email</div>
                        <div>
                            <LoginTextInput
                                name="user"
                                type="email"
                                value={emailString}
                                setValue={setEmailString}
                            />
                        </div>
                    </div>
                    <div>
                        <div>Password</div>
                        <div>
                            <LoginTextInput
                                name="password"
                                type="password"
                                value={passwordString}
                                setValue={setPasswordString}
                                onKeyDown={onKeyDownPassword}
                            />
                        </div>
                    </div>
                    <LoginButton label="Login" onClick={onClickLogin} />
                </>
            )}
        </div>
    )
}

export const Page = () => {
    return (
        <div className="flex flex-col md:w-1/3 lg:w-1/4 mx-auto p-4 items-center">
            <div className="w-full flex flex-col gap-8">
                <LoginBox />
                <div className="flex flex-row gap-2">
                    <span>Don't have an account?</span>
                    <Link
                        href="/register"
                        className="font-bold text-blue-500 underline"
                    >
                        Click here to register.
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Page
