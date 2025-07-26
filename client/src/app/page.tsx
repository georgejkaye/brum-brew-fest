"use client"
import { useEffect, useState } from "react"
import { VenueMap } from "./VenueMap"
import { getVenues, getVisits } from "./api"
import { Venue, Visit } from "./interfaces"
import { VenueList } from "./VenueList"

export default function Home() {
    const [venues, setVenues] = useState<Venue[]>([])
    const [visits, setVisits] = useState<Visit[]>([])

    useEffect(() => {
        const fetchData = async () => {
            let venueData = await getVenues()
            let visitData = await getVisits()
            setVenues(venueData)
            setVisits(visitData)
        }
        fetchData()
    }, [])

    return (
        <div>
            <VenueList venues={venues} />
        </div>
    )
}
