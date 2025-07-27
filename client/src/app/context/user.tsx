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
})

export const UserProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState<User | undefined>(undefined)
    useEffect(() => {
        const fetchUser = async (token: string) => {
            let user = await getUserDetails(token)
            if (user) {
                setUser(user)
            }
        }
        let token = localStorage.getItem("token")
        console.log(token)
        if (token) {
            fetchUser(token)
        }
    }, [])
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}
