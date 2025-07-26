import Link from "next/link"
import { User } from "./interfaces"

interface TopBarProps {
    user: User | undefined
}

const TopBar = ({ user }: TopBarProps) => {
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
