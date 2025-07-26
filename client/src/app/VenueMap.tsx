"use client"
import { Map } from "@vis.gl/react-maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { useContext, useEffect } from "react"
import { DataContext } from "./context/data"

interface VenueMapProps {
    venues: Venue[]
}

export const VenueMap = ({ venues }: VenueMapProps) => {
    useEffect(() => {
        console.log(venues)
    }, [venues])
    return (
        <Map
            initialViewState={{
                latitude: 52.4864,
                longitude: -1.9422,
                zoom: 12.5,
            }}
            style={{ width: "100%", height: "100vh" }}
            mapStyle={"https://tiles.openfreemap.org/styles/bright"}
        />
    )
}
