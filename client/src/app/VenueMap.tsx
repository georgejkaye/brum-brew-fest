"use client"
import { Layer, LayerProps, Map, Source } from "@vis.gl/react-maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import {
    GeoJSON,
    Geometry,
    GeoJsonProperties,
    FeatureCollection,
    Feature,
} from "geojson"

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

const clusterLayer: LayerProps = {
    id: "clusters",
    type: "circle",
    source: "venues",
    filter: ["has", "point_count"],
    paint: {
        "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            100,
            "#f1f075",
            750,
            "#f28cb1",
        ],
        "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    },
}

const clusterCountLayer: LayerProps = {
    id: "cluster-count",
    type: "symbol",
    source: "venues",
    filter: ["has", "point_count"],
    layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
    },
}

const unclusteredPointLayer: LayerProps = {
    id: "unclustered-point",
    type: "circle",
    source: "venues",
    filter: ["!", ["has", "point_count"]],
    paint: {
        "circle-color": "#11b4da",
        "circle-radius": 10,
    },
}

export const VenueMap = ({ venues }: VenueMapProps) => {
    let venueFeatureCollection = getVenueFeatureCollection(venues)
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
                <Layer {...clusterLayer} />
                <Layer {...clusterCountLayer} />
                <Layer {...unclusteredPointLayer} />
            </Source>
        </Map>
    )
}
