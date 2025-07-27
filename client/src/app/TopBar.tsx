"use client"
import Link from "next/link"
import { User } from "./interfaces"
import { useState, useEffect, useContext } from "react"
import { getUserDetails } from "./api"
import { UserContext } from "./context/user"

const TopBar = () => {
    const { user } = useContext(UserContext)
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
