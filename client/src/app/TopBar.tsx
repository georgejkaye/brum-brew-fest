import { useContext } from "react"
import { DataContext } from "./context/data"
import Link from "next/link"

const TopBar = () => {
    return (
        <div className="flex flex-row p-4 bg-[#38db98]">
            <div className="flex-1 text-2xl text-black font-bold">
                Brum Brew Fest Tracker
            </div>
            <div className="flex flex-row gap-4">
                <Link href="/">Map</Link>
                <Link href="/venues">Venues</Link>
                <Link href="/login">Login</Link>
            </div>
        </div>
    )
}

export default TopBar
