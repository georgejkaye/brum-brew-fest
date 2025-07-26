import { Venue } from "./interfaces"

interface VenueCardProps {
    venue: Venue
}

const VenueCard = ({ venue }: VenueCardProps) => {
    let visitCount = venue.visits.length
    let venueAverageRating =
        venue.visits.reduce((a, b) => a + b.rating, 0) / visitCount
    return (
        <div>
            <div>{venue.name}</div>
            <div>{venue.address}</div>
            <div>{visitCount} visits</div>
            <div>
                {isNaN(venueAverageRating)
                    ? "Unrated"
                    : `${venueAverageRating} out of 5`}
            </div>
        </div>
    )
}

interface VenueListProps {
    venues: Venue[]
}

export const VenueList = ({ venues }: VenueListProps) => {
    return venues.map((venue) => <VenueCard venue={venue} />)
}
