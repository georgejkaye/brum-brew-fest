"use client"

import { createContext, useState, PropsWithChildren, useEffect } from "react"
import { Venue } from "../interfaces"
import { getVenues } from "../api"

export const VenuesContext = createContext({
    venues: [] as Venue[],
    isLoadingVenues: false,
})

export const VenuesProvider = ({ children }: PropsWithChildren) => {
    const [venues, setVenues] = useState<Venue[]>([])
    const [isLoadingVenues, setLoadingVenues] = useState(true)
    useEffect(() => {
        setLoadingVenues(true)
        const fetchVenues = async () => {
            const venuesResult = await getVenues()
            if (venuesResult) {
                setVenues(venuesResult)
                setLoadingVenues(false)
            }
        }
        fetchVenues()
    }, [])
    return (
        <VenuesContext.Provider value={{ venues, isLoadingVenues }}>
            {children}
        </VenuesContext.Provider>
    )
}
