"use client"
import {
    Map,
    MapRef,
    Marker,
    MarkerEvent,
    Popup,
    Source,
} from "@vis.gl/react-maplibre"
import { GeoJSON, Geometry, GeoJsonProperties, Feature } from "geojson"
import { User, Venue } from "./interfaces"
import {
    Dispatch,
    MouseEvent,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from "react"
import { UserContext } from "./context/user"
import Pin from "./Pin"
import { LoginButton } from "./components/login"
import { useRouter } from "next/navigation"
import { Rating } from "@smastrom/react-rating"
import Link from "next/link"
import { getFirstVisitToVenue } from "./utils"

const getVenueFeatureCollection = (
    venues: Venue[]
): GeoJSON<Geometry, GeoJsonProperties> => {
    const features: Feature[] = venues.map((venue) => ({
        type: "Feature",
        properties: {
            id: venue.venueId,
        },
        geometry: {
            type: "Point",
            coordinates: [venue.longitude, venue.latitude],
        },
    }))
    return {
        type: "FeatureCollection",
        features,
    }
}

interface VenueMarkerProps {
    venue: Venue
    currentVenue: Venue | undefined
    setCurrentVenue: (venue: Venue | undefined) => void
}

const VenueMarker = ({
    venue,
    currentVenue,
    setCurrentVenue,
}: VenueMarkerProps) => {
    const { user } = useContext(UserContext)
    const onClickMarker = (e: MarkerEvent<any>) => {
        e.originalEvent.stopPropagation()
        if (currentVenue && currentVenue.venueId === venue.venueId) {
            setCurrentVenue(undefined)
        } else {
            setCurrentVenue(venue)
        }
    }
    const userHasVisitedVenue = !user
        ? false
        : user.visits.filter((visit) => visit.venueId === venue.venueId)
              .length > 0
    const pinColour = !user || !userHasVisitedVenue ? "#960000" : "#00a300"
    return (
        <Marker
            key={venue.venueId}
            longitude={venue.longitude}
            latitude={venue.latitude}
            anchor="bottom"
            onClick={onClickMarker}
        >
            <Pin
                colour={pinColour}
                size={
                    currentVenue && currentVenue.venueId === venue.venueId
                        ? 40
                        : 30
                }
            />
        </Marker>
    )
}

interface CurrentVenueBoxProps {
    user: User | undefined
    venue: Venue
    setCurrentVenue: (venue: Venue | undefined) => void
}

const CurrentVenueBox = ({
    user,
    venue,
    setCurrentVenue,
}: CurrentVenueBoxProps) => {
    const router = useRouter()
    const venueVisitCount = venue.visits.length
    const averageVenueRating =
        venueVisitCount === 0
            ? 0
            : venue.visits.reduce((a, b) => a + b.rating, 0) / venueVisitCount
    const onClickDetails = (e: MouseEvent<HTMLButtonElement>) => {
        router.push(`/venues/${venue.venueId}`)
    }
    const onClickRecord = (e: MouseEvent<HTMLButtonElement>) => {
        router.push(`/venues/${venue.venueId}/visit`)
    }
    const firstVisitToVenue = !user
        ? undefined
        : getFirstVisitToVenue(user, venue)

    return (
        <Popup
            anchor="bottom"
            longitude={venue.longitude}
            latitude={venue.latitude}
            onClose={() => setCurrentVenue(undefined)}
            closeButton={false}
            offset={47}
            maxWidth="60"
            className="w-3/4 md:w-1/2 lg:w-1/10"
        >
            <div className="flex flex-col gap-2">
                <div className="font-bold text-xl">
                    <Link href={`/venues/${venue.venueId}`}>{venue.name}</Link>
                </div>
                <div className="flex flex-row gap-2 h-5">
                    <div>
                        {venueVisitCount}{" "}
                        {venueVisitCount === 1 ? "visit" : "visits"}
                    </div>
                    <Rating
                        style={{ maxWidth: 100 }}
                        value={averageVenueRating}
                        readOnly={true}
                    />
                </div>
                {firstVisitToVenue && (
                    <div>
                        You visited on{" "}
                        {firstVisitToVenue.visitDate.toLocaleDateString()}
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    <LoginButton
                        label="More details"
                        onClick={onClickDetails}
                    />
                    {user && (
                        <LoginButton
                            label="Record visit"
                            onClick={onClickRecord}
                        />
                    )}
                </div>
            </div>
        </Popup>
    )
}

interface VenueMapProps {
    user: User | undefined
    venues: Venue[]
    currentVenue: Venue | undefined
    setCurrentVenue: Dispatch<SetStateAction<Venue | undefined>>
}

export const VenueMap = ({
    user,
    venues,
    currentVenue,
    setCurrentVenue,
}: VenueMapProps) => {
    const venueFeatureCollection = getVenueFeatureCollection(venues)
    const venuePins = useMemo(
        () =>
            venues.map((venue) => (
                <VenueMarker
                    key={venue.venueId}
                    venue={venue}
                    setCurrentVenue={setCurrentVenue}
                    currentVenue={currentVenue}
                />
            )),
        [venues, currentVenue]
    )
    const mapRef = useRef<MapRef>(null)

    useEffect(() => {
        if (currentVenue) {
            mapRef.current?.flyTo({
                center: [currentVenue.longitude, currentVenue.latitude],
                duration: 2000,
                animate: true,
            })
        }
    }, [currentVenue])

    return (
        <Map
            ref={mapRef}
            initialViewState={{
                latitude: 52.4864,
                longitude: -1.9422,
                zoom: 12.5,
            }}
            style={{ width: "100%", height: "100vh" }}
            mapStyle={"https://tiles.openfreemap.org/styles/bright"}
        >
            <Source
                id="venues"
                type="geojson"
                data={venueFeatureCollection}
                cluster={true}
                clusterMaxZoom={1}
                clusterRadius={100}
            >
                {venuePins}
                {currentVenue && (
                    <CurrentVenueBox
                        user={user}
                        venue={currentVenue}
                        setCurrentVenue={setCurrentVenue}
                    />
                )}
            </Source>
        </Map>
    )
}
