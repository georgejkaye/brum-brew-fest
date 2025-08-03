"use client"
import Link from "next/link"
import { useContext, useState } from "react"
import { UserContext } from "./context/user"

const TopBar = () => {
    const { user, isLoadingUser } = useContext(UserContext)
    const [isMenuOpen, setMenuOpen] = useState(false)
    const onClickLink = () => {
        setMenuOpen(false)
    }
    return (
        <div>
            <div className="flex flex-row p-4 bg-[#38db98] w-full items-center h-[60px]">
                <div className="flex-1 text-2xl text-black font-bold">
                    <Link href="/">Brum Brew Fest Tracker</Link>
                </div>
                {!isLoadingUser && (
                    <>
                        <div className="hidden md:flex flex-row gap-4">
                            <Link href="/">Map</Link>
                            <Link href="/venues/list">Venues</Link>
                            {user ? (
                                <Link href="/users/account">
                                    {user.displayName}
                                </Link>
                            ) : (
                                <Link href="/login">Login</Link>
                            )}
                        </div>
                        <div
                            onClick={() =>
                                setMenuOpen((isMenuOpen) => !isMenuOpen)
                            }
                            className="md:hidden cursor-pointer"
                        >
                            Menu
                        </div>
                    </>
                )}
            </div>
            {isMenuOpen && (
                <div className="absolute z-999 top-16 left-0 bg-green-300 p-4 flex flex-col gap-3 items-end w-full">
                    <Link onClick={onClickLink} href="/">
                        Map
                    </Link>
                    <Link onClick={onClickLink} href="/venues/list">
                        Venues
                    </Link>
                    {user ? (
                        <Link onClick={onClickLink} href="/users/account">
                            {user.displayName}
                        </Link>
                    ) : (
                        <Link onClick={onClickLink} href="/login">
                            Login
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}

export default TopBar
