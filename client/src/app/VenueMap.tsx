"use client"
import {
    Layer,
    LayerProps,
    Map,
    Marker,
    MarkerEvent,
    MarkerInstance,
    Source,
} from "@vis.gl/react-maplibre"
import {
    GeoJSON,
    Geometry,
    GeoJsonProperties,
    FeatureCollection,
    Feature,
} from "geojson"
import { Venue } from "./interfaces"
import { MouseEvent, useContext, useMemo, useState } from "react"
import { UserContext } from "./context/user"
import Pin from "./Pin"

const getVenueFeatureCollection = (
    venues: Venue[]
): GeoJSON<Geometry, GeoJsonProperties> => {
    let features: Feature[] = venues.map((venue) => ({
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

interface VenueMapProps {
    venues: Venue[]
}

interface VenueMarkerProps {
    venue: Venue
    setCurrentVenue: (venue: Venue) => void
}

const VenueMarker = ({ venue, setCurrentVenue }: VenueMarkerProps) => {
    const { user } = useContext(UserContext)
    const onClickMarker = (e: MarkerEvent<any>) => {
        setCurrentVenue(venue)
    }
    console.log(user)
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
            <Pin colour={pinColour} />
        </Marker>
    )
}

export const VenueMap = ({ venues }: VenueMapProps) => {
    let venueFeatureCollection = getVenueFeatureCollection(venues)
    const [currentVenue, setCurrentVenue] = useState<Venue | undefined>(
        undefined
    )
    let venuePins = useMemo(
        () =>
            venues.map((venue) => (
                <VenueMarker
                    key={venue.venueId}
                    venue={venue}
                    setCurrentVenue={setCurrentVenue}
                />
            )),
        [venues]
    )

    return (
        <Map
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
            </Source>
        </Map>
    )
}
