"use client"
import { useContext, useEffect, useState } from "react"
import { UserFollow } from "../interfaces"
import { getFollows } from "../api"
import { UserContext } from "../context/user"
import { useRouter } from "next/navigation"
import { Loader } from "../Loader"
import Link from "next/link"

interface FollowCardProps {
    follow: UserFollow
}

const FollowCard = ({ follow }: FollowCardProps) => (
    <div className="flex flex-col md:flex-row p-4 rounded bg-green-300 gap-4">
        <Link
            className="font-bold mr-auto hover:underline"
            href={`/users/${follow.userId}`}
        >
            {follow.displayName}
        </Link>
        <div>{follow.visitCount} visits</div>
        <div>{follow.uniqueVisitCount} venues</div>
    </div>
)

const Page = () => {
    const router = useRouter()
    const { token } = useContext(UserContext)

    const [isLoading, setLoading] = useState(true)
    const [follows, setFollows] = useState<UserFollow[]>([])

    useEffect(() => {
        const fetchFollows = async (token: string) => {
            const follows = await getFollows(token)
            setFollows(follows)
            setLoading(false)
        }
        if (!token) {
            router.push("/")
        } else {
            fetchFollows(token)
        }
    }, [router, token])

    return (
        <div className="flex flex-col md:mx-auto md:w-1/2 lg:w-1/3 p-4 items-center">
            {isLoading ? (
                <Loader />
            ) : (
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="font-bold text-2xl">Follows</h2>
                    <div className="flex flex-col gap-4">
                        {follows.map((follow) => (
                            <FollowCard key={follow.userId} follow={follow} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page
