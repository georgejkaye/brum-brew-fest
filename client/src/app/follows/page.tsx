"use client"
import { MouseEvent, useCallback, useContext, useEffect, useState } from "react"
import { UserCount, UserFollow } from "../interfaces"
import { addFollow, getFollows, getUserCounts, removeFollow } from "../api"
import { UserContext } from "../context/user"
import { useRouter } from "next/navigation"
import { Loader } from "../Loader"
import Link from "next/link"
import { LoginButton, LoginTextInput } from "../components/login"

interface FollowCardProps {
    token: string
    follow: UserFollow
    fetchFollows: () => Promise<void>
}

const FollowCard = ({ token, follow, fetchFollows }: FollowCardProps) => {
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
                    <div className="flex flex-row gap-4">
                        <div>{follow.visitCount} visits</div>
                        <div>{follow.uniqueVisitCount} venues</div>
                    </div>
                    <button
                        className="hover:underline cursor-pointer font-bold"
                        onClick={onClickRemoveButton}
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    )
}

interface AddFollowCardProps {
    token: string
    user: UserCount
    follows: UserFollow[]
    fetchFollows: () => Promise<void>
}

const AddFollowCard = ({
    token,
    user,
    follows,
    fetchFollows,
}: AddFollowCardProps) => {
    const [isLoading, setLoading] = useState(false)
    const onClickAddButton = async (e: MouseEvent<HTMLButtonElement>) => {
        setLoading(true)
        await addFollow(token, user.userId)
        await fetchFollows()
        setLoading(false)
    }
    return (
        <div className="flex flex-row items-center w-full">
            {isLoading ? (
                <Loader size={50} />
            ) : (
                <div className="flex flex-col md:flex-row p-4 rounded bg-green-200 gap-4 w-full">
                    <Link
                        className="font-bold mr-auto hover:underline"
                        href={`/users/${user.userId}`}
                    >
                        {user.displayName}
                    </Link>
                    <div className="flex flex-row gap-4">
                        <div>{user.visitCount} visits</div>
                        <div>{user.uniqueVisitCount} venues</div>
                        {follows.some(
                            (follow) => (follow.userId = user.userId)
                        ) ? (
                            <div className="font-bold">Followed</div>
                        ) : (
                            <button
                                className="font-bold hover:underline cursor-pointer"
                                onClick={onClickAddButton}
                            >
                                Follow
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
const Page = () => {
    const router = useRouter()
    const { isLoadingUser, token, user } = useContext(UserContext)

    const [follows, setFollows] = useState<UserFollow[]>([])
    const [users, setUsers] = useState<UserCount[]>([])
    const [filteredUsers, setFilteredUsers] = useState<UserCount[]>([])

    const [isLoadingFollows, setLoadingFollows] = useState(true)
    const [isLoadingUsers, setLoadingUsers] = useState(true)
    const [isAddingFollower, setAddingFollower] = useState(false)
    const [isEditingFollowers, setEditingFollowers] = useState(false)

    const [userSearchText, setUserSearchText] = useState("")

    const fetchFollows = useCallback(async (token: string) => {
        const follows = await getFollows(token)
        setFollows(follows)
        setLoadingFollows(false)
    }, [])

    useEffect(() => {
        const fetchUsers = async () => {
            const users: UserCount[] = await getUserCounts()
            setUsers(
                users.filter((userCount) => userCount.userId != user?.userId)
            )
            setLoadingUsers(false)
            console.log(users)
        }
        if (!token) {
            if (!isLoadingUser) {
                router.push("/")
            }
        } else {
            fetchFollows(token)
            fetchUsers()
        }
    }, [router, token, fetchFollows, isLoadingUser, user])

    useEffect(() => {
        setFilteredUsers(
            users.filter(
                (user) =>
                    userSearchText === "" ||
                    user.displayName
                        .toLowerCase()
                        .includes(userSearchText.toLowerCase())
            )
        )
    }, [userSearchText, users])

    const onClickAddFollowerButton = (e: MouseEvent<HTMLButtonElement>) => {
        setAddingFollower((old) => !old)
    }
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
                            label={
                                isAddingFollower
                                    ? "Stop adding followers"
                                    : "Add followers"
                            }
                            onClick={onClickAddFollowerButton}
                        />
                    </div>
                    {isAddingFollower ? (
                        <div className="flex flex-col gap-4">
                            <LoginTextInput
                                name="user"
                                value={userSearchText}
                                setValue={setUserSearchText}
                                type="text"
                                onKeyDown={() => {}}
                            />
                            <div className="flex flex-col gap-4">
                                {filteredUsers.map((user) => (
                                    <AddFollowCard
                                        key={user.userId}
                                        user={user}
                                        follows={follows}
                                        token={token}
                                        fetchFollows={() => fetchFollows(token)}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
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
                    )}
                </div>
            )}
        </div>
    )
}

export default Page
