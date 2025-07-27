"use client"
import {
    ChangeEvent,
    Dispatch,
    KeyboardEvent,
    MouseEvent,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from "react"
import {
    getUser,
    getUserDetails,
    login,
    registerUser,
    requestVerifyToken,
} from "../api"
import { useRouter } from "next/navigation"
import { Loader } from "../Loader"
import { UserContext } from "../context/user"

interface LoginTextInputProps {
    value: string
    setValue: Dispatch<SetStateAction<string>>
    isPassword?: boolean
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
}

const LoginTextInput = ({
    value,
    setValue,
    isPassword,
    onKeyDown,
}: LoginTextInputProps) => {
    const inputStyle = "w-full text-lg p-2 rounded border-2 border-gray-400"
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
    }
    return (
        <input
            type={isPassword ? "password" : "text"}
            className={inputStyle}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
        />
    )
}

interface LoginButtonProps {
    label: string
    onClick: (e: MouseEvent<any>) => void
}

const LoginButton = ({ label, onClick }: LoginButtonProps) => {
    return (
        <button
            className="font-bold p-2 rounded bg-green-300 cursor-pointer hover:bg-green-200"
            onClick={onClick}
        >
            {label}
        </button>
    )
}

interface LoginBoxProps {
    isLoading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
    setLoginSuccessful: Dispatch<SetStateAction<boolean>>
}

const LoginBox = ({
    isLoading,
    setLoading,
    setLoginSuccessful,
}: LoginBoxProps) => {
    const { setUser } = useContext(UserContext)
    const [emailString, setEmailString] = useState("")
    const [passwordString, setPasswordString] = useState("")
    const [errorString, setErrorString] = useState("")
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
    const onClickLogin = async (e: MouseEvent<any>) => {
        performLogin()
    }
    const onKeyDownPassword = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            performLogin()
        }
    }
    return (
        <div className="w-full flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Login</h2>
            {errorString && (
                <div className="p-4 bg-red-300 rounded-lg">{errorString}</div>
            )}
            <div>
                <div>Email</div>
                <div>
                    <LoginTextInput
                        value={emailString}
                        setValue={setEmailString}
                    />
                </div>
            </div>
            <div>
                <div>Password</div>
                <div>
                    <LoginTextInput
                        value={passwordString}
                        setValue={setPasswordString}
                        isPassword
                        onKeyDown={onKeyDownPassword}
                    />
                </div>
            </div>
            <LoginButton label="Login" onClick={onClickLogin} />
        </div>
    )
}

interface RegisterBoxProps {
    isLoading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
}

const RegisterBox = ({ isLoading, setLoading }: RegisterBoxProps) => {
    const [emailString, setEmailString] = useState("")
    const [displayNameString, setDisplayNameString] = useState("")
    const [passwordString, setPasswordString] = useState("")
    const [confirmPasswordString, setConfirmPasswordString] = useState("")
    const [errorString, setErrorString] = useState("")
    const [successString, setSuccessString] = useState("")
    const onClickRegister = async (e: MouseEvent<any>) => {
        setLoading(true)
        if (passwordString !== confirmPasswordString) {
            setErrorString("Passwords do not match")
            setPasswordString("")
            setConfirmPasswordString("")
        } else {
            let registerResult = await registerUser(
                emailString,
                passwordString,
                displayNameString
            )
            if (registerResult.user === undefined) {
                setSuccessString("")
                setErrorString(`Registration failed: ${registerResult.error}`)
            } else {
                requestVerifyToken(registerResult.user.email)
                setSuccessString(
                    `Verification email sent to ${registerResult.user.email}!`
                )
                setErrorString("")
            }
        }
        setLoading(false)
    }
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Register</h2>
            {errorString && (
                <div className="p-4 bg-red-300 rounded-lg">{errorString}</div>
            )}
            {successString && (
                <div className="p-4 bg-green-300 rounded-lg">
                    {successString}
                </div>
            )}
            <div>
                <div>Email</div>
                <div>
                    <LoginTextInput
                        value={emailString}
                        setValue={setEmailString}
                    />
                </div>
            </div>
            <div>
                <div>Password</div>
                <div>
                    <LoginTextInput
                        value={passwordString}
                        setValue={setPasswordString}
                        isPassword
                    />
                </div>
            </div>
            <div>
                <div>Confirm password</div>
                <div>
                    <LoginTextInput
                        value={confirmPasswordString}
                        setValue={setConfirmPasswordString}
                        isPassword
                    />
                </div>
            </div>
            <div>
                <div>Display name</div>
                <div>
                    <LoginTextInput
                        value={displayNameString}
                        setValue={setDisplayNameString}
                    />
                </div>
            </div>
            <LoginButton label="Register" onClick={onClickRegister} />
        </div>
    )
}

export const Page = () => {
    const router = useRouter()
    const [isLoading, setLoading] = useState(false)
    const [isLoginSuccessful, setLoginSuccessful] = useState(false)
    useEffect(() => {
        if (isLoginSuccessful) {
            setTimeout(() => router.push("/"), 1000)
        }
    }, [isLoginSuccessful])
    return (
        <div className="flex flex-col md:w-1/3 lg:w-1/4 mx-auto p-4 items-center">
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
                <div className="w-full flex flex-col gap-8">
                    <LoginBox
                        isLoading={isLoading}
                        setLoading={setLoading}
                        setLoginSuccessful={setLoginSuccessful}
                    />
                    <RegisterBox
                        isLoading={isLoading}
                        setLoading={setLoading}
                    />
                </div>
            )}
        </div>
    )
}

export default Page
