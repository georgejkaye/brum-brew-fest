"use client"
import { KeyboardEvent, MouseEvent, useContext, useState } from "react"
import { getUserDetails, login } from "../api"
import { Loader } from "../Loader"
import { UserContext } from "../context/user"
import Link from "next/link"
import { LoginButton, LoginTextInput } from "../components/login"
import { useRouter } from "next/navigation"

interface LoginBoxProps {
    performLogin: (email: string, password: string) => Promise<boolean>
}

const LoginBox = ({ performLogin }: LoginBoxProps) => {
    const [emailString, setEmailString] = useState("")
    const [passwordString, setPasswordString] = useState("")
    const submitForm = async () => {
        let loginResult = await performLogin(emailString, passwordString)
        setPasswordString("")
    }
    const onClickLogin = (e: MouseEvent<any>) => {
        submitForm()
    }
    const onKeyDownPassword = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            submitForm()
        }
    }
    return (
        <div className="w-full flex flex-col gap-4">
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
        </div>
    )
}

export const Page = () => {
    const { setUser } = useContext(UserContext)
    const router = useRouter()
    const [isLoading, setLoading] = useState(false)
    const [isLoginSuccessful, setLoginSuccessful] = useState(false)
    const [errorString, setErrorString] = useState("")
    const performLogin = async (email: string, password: string) => {
        setLoading(true)
        let loginResult = await login(email, password)
        if (loginResult.token === undefined) {
            setErrorString(`Could not log in: ${loginResult.error}`)
            setLoading(false)
            return false
        } else {
            setLoginSuccessful(true)
            localStorage.setItem("token", loginResult.token)
            let user = await getUserDetails(loginResult.token)
            setUser(user)
            setErrorString("")
            setLoading(false)
            setTimeout(() => router.push("/"), 1000)
            return true
        }
    }
    return (
        <div className="flex flex-col w-1/2 lg:w-1/4 mx-auto p-4 items-center">
            {isLoading ? (
                <Loader />
            ) : isLoginSuccessful ? (
                <>
                    <div className="w-full p-4 bg-green-300 rounded">
                        Login successful, redirecting you to the home page...
                    </div>
                    <Loader />
                </>
            ) : (
                <div className="w-full flex flex-col gap-4">
                    <>
                        <h2 className="text-2xl font-bold">Login</h2>
                        {errorString && (
                            <div className="p-4 bg-red-300 rounded-lg">
                                {errorString}
                            </div>
                        )}
                        <LoginBox performLogin={performLogin} />
                        <div className="flex flex-col md:flex-row gap-2">
                            <span>Don't have an account?</span>
                            <Link
                                href="/register"
                                className="font-bold text-blue-500 underline"
                            >
                                Click here to register.
                            </Link>
                        </div>
                    </>
                </div>
            )}
        </div>
    )
}

export default Page
