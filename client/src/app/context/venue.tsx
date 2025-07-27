"use client"

import { createContext, useState, PropsWithChildren, useEffect } from "react"
import { User, Venue } from "../interfaces"
import { getVenue } from "../api"
import { useRouter } from "next/navigation"

export const VenueContext = createContext({
    venue: undefined as Venue | undefined,
    isLoadingVenue: false,
})

export const VenueProvider = ({
    venueId,
    children,
}: PropsWithChildren<{ venueId: number }>) => {
    const router = useRouter()
    const [venue, setVenue] = useState<Venue | undefined>(undefined)
    const [isLoadingVenue, setLoadingVenue] = useState(true)
    useEffect(() => {
        setLoadingVenue(true)
        console.log("hello")
        const fetchVenue = async () => {
            if (isNaN(venueId)) {
                router.push("/")
            }
            let venueResult = await getVenue(venueId)
            if (venueResult) {
                setVenue(venueResult)
                setLoadingVenue(false)
            } else {
                router.push("/")
            }
        }
        fetchVenue()
    }, [])
    return (
        <VenueContext.Provider value={{ venue, isLoadingVenue }}>
            {children}
        </VenueContext.Provider>
    )
}
