"use client"
import { useContext, useEffect, useState } from "react"
import { Venue } from "../../interfaces"
import { VenuesContext } from "@/app/context/venues"
import { Rating } from "@smastrom/react-rating"
import Link from "next/link"

interface VenueCardProps {
    venue: Venue
}

const VenueCard = ({ venue }: VenueCardProps) => {
    const visitCount = venue.visits.length
    const venueAverageRating =
        visitCount === 0
            ? 0
            : venue.visits.reduce((a, b) => a + b.rating, 0) / visitCount
    return (
        <Link href={`/venues/${venue.venueId}`}>
            <div className="p-4 flex md:flex-row items-end gap-4 bg-green-100 rounded-lg shadow hover:bg-green-200">
                <div className="flex flex-col flex-1 gap-2">
                    <div className="text-2xl font-bold">{venue.name}</div>
                    <div>{venue.address}</div>
                    <div>{visitCount} visits</div>
                    <Rating
                        style={{ maxWidth: 100 }}
                        value={venueAverageRating}
                        readOnly
                    />
                </div>
            </div>
        </Link>
    )
}

const partitionByArea = (venues: Venue[]) =>
    venues.reduce(
        (
            partitionedVenues: { [venueAreaName: string]: Venue[] },
            currentVenue
        ) => {
            if (!partitionedVenues[currentVenue.venueAreaName]) {
                partitionedVenues[currentVenue.venueAreaName] = []
            }
            partitionedVenues[currentVenue.venueAreaName].push(currentVenue)
            return partitionedVenues
        },
        {}
    )

const Page = () => {
    const { venues } = useContext(VenuesContext)
    const [filteredVenues, setFilteredVenues] = useState([...venues])
    const [searchValue, setSearchValue] = useState("")
    useEffect(() => {
        setFilteredVenues(
            venues.filter(
                (venue) =>
                    venue.name
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                    venue.address
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
            )
        )
    }, [searchValue])
    return (
        <div className="flex flex-col gap-4 lg:w-1/3 mx-auto p-4">
            <input
                type="text"
                placeholder="Type to filter..."
                className="p-4 rounded-xl border-gray-400 border-1"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
            />
            {filteredVenues.map((venue) => (
                <VenueCard key={venue.venueId} venue={venue} />
            ))}
        </div>
    )
}

export default Page
