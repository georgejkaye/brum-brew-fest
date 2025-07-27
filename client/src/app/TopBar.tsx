"use client"
import Link from "next/link"
import { useContext } from "react"
import { UserContext } from "./context/user"

const TopBar = () => {
    const { user, isLoadingUser } = useContext(UserContext)
    return (
        <div className="flex flex-row p-4 bg-[#38db98]">
            <div className="flex-1 text-2xl text-black font-bold">
                Brum Brew Fest Tracker
            </div>
            {!isLoadingUser && (
                <div className="flex flex-row gap-4">
                    <Link href="/">Map</Link>
                    <Link href="/venues">Venues</Link>
                    {user ? (
                        <Link href="/user/account">{user.displayName}</Link>
                    ) : (
                        <Link href="/login">Login</Link>
                    )}
                </div>
            )}
        </div>
    )
}

export default TopBar
