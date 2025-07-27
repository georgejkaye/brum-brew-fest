import { Venue } from "./interfaces"

interface VenueCardProps {
    venue: Venue
}

const VenueCard = ({ venue }: VenueCardProps) => {
    let visitCount = venue.visits.length
    let venueAverageRating =
        venue.visits.reduce((a, b) => a + b.rating, 0) / visitCount
    return (
        <div className="p-4 flex md:flex-row items-end gap-4 bg-green-100 rounded-lg shadow">
            <div className="flex flex-col flex-1">
                <div className="text-2xl font-bold">{venue.name}</div>
                <div>{venue.address}</div>
            </div>
            <div className="flex flex-col">
                <div>{visitCount} visits</div>
                <div>
                    {isNaN(venueAverageRating)
                        ? "Unrated"
                        : `${venueAverageRating} out of 5`}
                </div>
            </div>
        </div>
    )
}

interface VenueListProps {
    venues: Venue[]
}

export const VenueList = ({ venues }: VenueListProps) => {
    return (
        <div className="flex flex-col gap-4 md:w-1/4 mx-auto p-4">
            {venues.map((venue) => (
                <VenueCard key={venue.venueId} venue={venue} />
            ))}
        </div>
    )
}
