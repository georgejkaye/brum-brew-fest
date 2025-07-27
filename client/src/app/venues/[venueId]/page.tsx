"use client"

import { LoginButton } from "@/app/components/login"
import { UserContext } from "@/app/context/user"
import { VenueContext } from "@/app/context/venue"
import { Venue, VenueVisit } from "@/app/interfaces"
import { Rating } from "@smastrom/react-rating"
import { Layer, LayerProps, Map, Source } from "@vis.gl/react-maplibre"
import { Feature } from "geojson"
import { useRouter } from "next/navigation"
import { useContext } from "react"

interface VenueDetailsProps {
    venue: Venue
}

const VenueMap = ({ venue }: VenueDetailsProps) => {
    let venuePoint: Feature = {
        type: "Feature",
        properties: { id: venue.venueId },
        geometry: {
            type: "Point",
            coordinates: [venue.longitude, venue.latitude],
        },
    }
    const layer: LayerProps = {
        id: "layer",
        type: "circle",
        source: "venue",
        paint: {
            "circle-color": "#11b4da",
            "circle-radius": 20,
        },
    }
    return (
        <Map
            initialViewState={{
                latitude: venue.latitude,
                longitude: venue.longitude,
                zoom: 15,
            }}
            style={{ height: "500px" }}
            mapStyle={"https://tiles.openfreemap.org/styles/bright"}
        >
            <Source id="venue" type="geojson" data={venuePoint} />
            <Layer {...layer} />
        </Map>
    )
}

const VenueDetails = ({ venue }: VenueDetailsProps) => {
    let venueVisitCount = venue.visits.length
    let averageVenueRating =
        venue.visits.reduce((a, b) => a + b.rating, 0) / venueVisitCount
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">{venue.name}</h2>
            <div>{venue.address}</div>
            <div className="flex flex-row gap-2">
                <div>{venueVisitCount} visits</div>
                <Rating
                    style={{ maxWidth: 100 }}
                    value={averageVenueRating}
                    readOnly={true}
                />
            </div>
            <VenueMap venue={venue} />
        </div>
    )
}

interface VenueVisitProps {
    visit: VenueVisit
}

const VenueVisitCard = ({ visit }: VenueVisitProps) => {
    return (
        <div className="rounded p-2 bg-green-200 flex flex-col gap-2">
            <div className="font-bold text-xl">{visit.userDisplayName}</div>
            <div>{visit.visitDate.toLocaleDateString()}</div>
            <Rating
                style={{ maxWidth: 100 }}
                value={visit.rating}
                readOnly={true}
            />
            <div>
                <span className="font-bold">Drink: </span>
                {visit.drink}
            </div>
            <div>'{visit.notes}'</div>
        </div>
    )
}

export const Page = () => {
    const router = useRouter()
    const { venue } = useContext(VenueContext)
    const { user } = useContext(UserContext)
    const onClickRecordVisit = () => {
        router.push(`/venues/${venue?.venueId}/visit`)
    }
    return (
        <div className="flex flex-col w-1/2 lg:w-1/3 p-4 mx-auto">
            {venue && (
                <div className="flex flex-col gap-4">
                    <VenueDetails venue={venue} />
                    {user && (
                        <LoginButton
                            label="Record visit"
                            onClick={onClickRecordVisit}
                        />
                    )}
                    {venue.visits.map((visit) => (
                        <VenueVisitCard key={visit.visitId} visit={visit} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Page
