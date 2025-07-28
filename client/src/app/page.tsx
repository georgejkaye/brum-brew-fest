"use client"
import { useContext, useEffect, useState } from "react"
import { VenueMap } from "./VenueMap"
import { getVenues, getVisits } from "./api"
import { Venue, Visit } from "./interfaces"
import { UserContext } from "./context/user"

interface CurrentVenuePanelProps {
    venue: Venue
}

const CurrentVenuePanel = ({ venue }: CurrentVenuePanelProps) => {
    return <div className="">{venue.name}</div>
}

export default function Home() {
    const { user } = useContext(UserContext)
    const [venues, setVenues] = useState<Venue[]>([])
    const [visits, setVisits] = useState<Visit[]>([])
    const [currentVenue, setCurrentVenue] = useState<Venue | undefined>(
        undefined
    )

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
            <VenueMap
                user={user}
                venues={venues}
                currentVenue={currentVenue}
                setCurrentVenue={setCurrentVenue}
            />
        </div>
    )
}
