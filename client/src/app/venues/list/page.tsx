"use client"
import { useContext } from "react"
import { Venue } from "../../interfaces"
import { VenuesContext } from "@/app/context/venues"
import { Rating } from "@smastrom/react-rating"
import Link from "next/link"

interface VenueCardProps {
    venue: Venue
}

const VenueCard = ({ venue }: VenueCardProps) => {
    let visitCount = venue.visits.length
    let venueAverageRating =
        venue.visits.reduce((a, b) => a + b.rating, 0) / visitCount
    let venueAverageRatingValue = venueAverageRating ? venueAverageRating : 0
    return (
        <Link href={`/venues/${venue.venueId}`}>
            <div className="p-4 flex md:flex-row items-end gap-4 bg-green-100 rounded-lg shadow">
                <div className="flex flex-col flex-1">
                    <div className="text-2xl font-bold">{venue.name}</div>
                    <div>{venue.address}</div>
                    <div className="flex flex-row w-full">
                        {venueAverageRatingValue} out of 5
                    </div>
                </div>
                <div className="flex flex-col">
                    <div>{visitCount} visits</div>
                    <div className=""></div>
                </div>
            </div>
        </Link>
    )
}

interface VenueListProps {
    venues: Venue[]
}

export const Page = () => {
    const { venues } = useContext(VenuesContext)
    return (
        <div className="flex flex-col gap-4 lg:w-1/3 mx-auto p-4">
            {venues.map((venue) => (
                <VenueCard key={venue.venueId} venue={venue} />
            ))}
        </div>
    )
}

export default Page
