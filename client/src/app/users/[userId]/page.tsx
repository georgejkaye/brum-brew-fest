"use client"
import { UserSummaryContext } from "@/app/context/userSummary"
import { SingleUserVisit } from "@/app/interfaces"
import { Loader } from "@/app/Loader"
import { Rating } from "@smastrom/react-rating"
import { useContext } from "react"

interface UserSummaryVisitCardProps {
    visit: SingleUserVisit
}

const UserSummaryVisitCard = ({ visit }: UserSummaryVisitCardProps) => {
    return (
        <div className="rounded-xl bg-green-200 p-4 flex flex-col gap-2">
            <div className="font-bold text-xl">{visit.venueName}</div>
            <div className="">
                {visit.visitDate.toLocaleDateString()}{" "}
                {visit.visitDate.toLocaleTimeString("en-UK", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </div>
            <div>
                <span className="font-bold">Drink:</span> {visit.drink}
            </div>
            <div>'{visit.notes}'</div>
            <Rating style={{ maxWidth: 100 }} value={visit.rating} readOnly />
        </div>
    )
}

export const Page = () => {
    let { userSummary, isLoadingUserSummary } = useContext(UserSummaryContext)
    console.log(userSummary)
    return (
        <div className="w-1/3 flex flex-col items-center mx-auto p-4">
            {isLoadingUserSummary ? (
                <Loader />
            ) : !userSummary ? (
                ""
            ) : (
                <div className="w-full flex flex-col gap-4">
                    <h2 className="font-bold text-2xl">
                        {userSummary.displayName}
                    </h2>
                    <div>
                        {userSummary.visits.length}{" "}
                        {userSummary.visits.length === 1 ? "venue" : "venues"}{" "}
                        visited
                    </div>
                    <div className="flex flex-col">
                        {userSummary.visits.map((visit) => (
                            <UserSummaryVisitCard
                                key={visit.visitId}
                                visit={visit}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page
