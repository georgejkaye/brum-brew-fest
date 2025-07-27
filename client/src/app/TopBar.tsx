"use client"
import Link from "next/link"
import { User } from "./interfaces"
import { useState, useEffect } from "react"
import { getUserDetails } from "./api"

const TopBar = () => {
    const [user, setUser] = useState<User | undefined>(undefined)
    useEffect(() => {
        const fetchUser = async (token: string) => {
            let user = await getUserDetails(token)
            if (user) {
                console.log(user)
                setUser(user)
            }
        }
        let token = localStorage.getItem("token")
        if (token) {
            fetchUser(token)
        }
    }, [])

    return (
        <div className="flex flex-row p-4 bg-[#38db98]">
            <div className="flex-1 text-2xl text-black font-bold">
                Brum Brew Fest Tracker
            </div>
            <div className="flex flex-row gap-4">
                <Link href="/">Map</Link>
                <Link href="/venues">Venues</Link>
                {user ? user.displayName : <Link href="/login">Login</Link>}
            </div>
        </div>
    )
}

export default TopBar
