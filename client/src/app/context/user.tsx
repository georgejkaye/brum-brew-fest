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
    user: undefined as User | undefined,
    setUser: (() => undefined) as Dispatch<SetStateAction<User | undefined>>,
    isLoadingUser: false,
})

export const UserProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState<User | undefined>(undefined)
    const [isLoadingUser, setLoadingUser] = useState(true)
    useEffect(() => {
        setLoadingUser(true)
        const fetchUser = async (token: string) => {
            let user = await getUserDetails(token)
            if (user) {
                setUser(user)
            } else {
                localStorage.removeItem("token")
                setUser(undefined)
            }
            setLoadingUser(false)
        }
        let token = localStorage.getItem("token")
        if (token) {
            fetchUser(token)
        } else {
            setLoadingUser(false)
        }
    }, [])
    return (
        <UserContext.Provider value={{ user, setUser, isLoadingUser }}>
            {children}
        </UserContext.Provider>
    )
}
