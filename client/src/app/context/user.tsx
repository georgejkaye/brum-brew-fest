"use client"

import {
    createContext,
    useState,
    PropsWithChildren,
    SetStateAction,
    Dispatch,
    useEffect,
} from "react"
import { User } from "../interfaces"
import { getUserDetails } from "../api"

export const UserContext = createContext({
    token: undefined as string | undefined,
    user: undefined as User | undefined,
    refreshUser: () => {},
    setUser: (() => undefined) as Dispatch<SetStateAction<User | undefined>>,
    isLoadingUser: false,
})

export const UserProvider = ({ children }: PropsWithChildren) => {
    const [token, setToken] = useState<string | undefined>(undefined)
    const [user, setUser] = useState<User | undefined>(undefined)
    const [isLoadingUser, setLoadingUser] = useState(true)
    const fetchUser = async (token: string) => {
        let user = await getUserDetails(token)
        if (user) {
            setUser(user)
            setToken(token)
        } else {
            localStorage.removeItem("token")
            setUser(undefined)
            setToken(undefined)
        }
        setLoadingUser(false)
    }
    const refreshUser = () => {
        let token = localStorage.getItem("token")
        if (token) {
            fetchUser(token)
        } else {
            setLoadingUser(false)
            setToken(undefined)
        }
    }
    useEffect(() => {
        setLoadingUser(true)
        refreshUser()
    }, [])
    return (
        <UserContext.Provider
            value={{ token, user, refreshUser, setUser, isLoadingUser }}
        >
            {children}
        </UserContext.Provider>
    )
}
