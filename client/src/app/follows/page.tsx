"use client"
import { MouseEvent, useCallback, useContext, useEffect, useState } from "react"
import { UserFollow } from "../interfaces"
import { getFollows, removeFollow } from "../api"
import { UserContext } from "../context/user"
import { useRouter } from "next/navigation"
import { Loader } from "../Loader"
import Link from "next/link"
import { LoginButton } from "../components/login"

interface FollowCardProps {
    token: string
    follow: UserFollow
    isEditingFollowers: boolean
    fetchFollows: () => Promise<void>
}

const FollowCard = ({
    token,
    follow,
    isEditingFollowers,
    fetchFollows,
}: FollowCardProps) => {
    const [isLoading, setLoading] = useState(false)
    const onClickRemoveButton = async (e: MouseEvent<HTMLButtonElement>) => {
        setLoading(true)
        await removeFollow(token, follow.followId)
        await fetchFollows()
    }
    return (
        <div className="flex flex-row items-center w-full">
            {isLoading ? (
                <Loader size={50} />
            ) : (
                <div className="flex flex-col md:flex-row p-4 rounded bg-green-200 gap-4 w-full">
                    <Link
                        className="font-bold mr-auto hover:underline"
                        href={`/users/${follow.userId}`}
                    >
                        {follow.displayName}
                    </Link>
                    {isEditingFollowers ? (
                        <button
                            className="hover:underline cursor-pointer font-bold"
                            onClick={onClickRemoveButton}
                        >
                            Remove
                        </button>
                    ) : (
                        <div className="flex flex-row gap-4">
                            <div>{follow.visitCount} visits</div>
                            <div>{follow.uniqueVisitCount} venues</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const Page = () => {
    const router = useRouter()
    const { isLoadingUser, token } = useContext(UserContext)

    const [follows, setFollows] = useState<UserFollow[]>([])
    const [users, setUsers] = useState<UserFollow[]>([])

    const [isLoadingFollows, setLoadingFollows] = useState(true)
    const [isLoadingUsers, setLoadingUsers] = useState(true)
    const [isAddingFollower, setAddingFollower] = useState(false)
    const [isEditingFollowers, setEditingFollowers] = useState(false)

    const fetchFollows = useCallback(async (token: string) => {
        const follows = await getFollows(token)
        setFollows(follows)
        setLoadingFollows(false)
    }, [])

    useEffect(() => {
        const fetchUsers = async () => {
            const users: UserFollow[] = []
            setUsers(users)
            setLoadingUsers(false)
        }
        if (!token) {
            if (!isLoadingUser) {
                router.push("/")
            }
        } else {
            fetchFollows(token)
            fetchUsers()
        }
    }, [router, token, fetchFollows, isLoadingUser])

    const onClickAddFollowerButton = (e: MouseEvent<HTMLButtonElement>) => {}
    const onClickEditFollowersButton = (e: MouseEvent<HTMLButtonElement>) => {
        setEditingFollowers((old) => !old)
    }

    return (
        <div className="flex flex-col md:mx-auto md:w-1/2 lg:w-1/3 p-4 items-center">
            {!token || isLoadingFollows ? (
                <Loader />
            ) : (
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="font-bold text-2xl">Follows</h2>
                    <div className="flex flex-row gap-4">
                        <LoginButton
                            label="Add followers"
                            onClick={onClickAddFollowerButton}
                        />
                        <LoginButton
                            label={
                                isEditingFollowers
                                    ? "Stop editing followers"
                                    : "Edit followers"
                            }
                            onClick={onClickEditFollowersButton}
                        />
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        {follows.map((follow) => (
                            <FollowCard
                                key={follow.userId}
                                follow={follow}
                                isEditingFollowers={isEditingFollowers}
                                token={token}
                                fetchFollows={() => fetchFollows(token)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page
