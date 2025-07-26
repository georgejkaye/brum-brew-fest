import axios from "axios"
import { Venue, User, Visit } from "./interfaces"

const responseToVenueVisit = (response: any) => ({
    visitId: response["visit_id"],
    userId: response["user_id"],
    userDisplayName: response["user_display_name"],
    visitDate: Date.parse(response["visit_date"]),
    notes: response["notes"],
    rating: response["rating"],
})

const responseToVenue = (response: any) => ({
    venueId: response["venue_id"],
    name: response["venue_name"],
    address: response["venue_address"],
    latitude: response["latitude"],
    longitude: response["longitude"],
    visits: response["visits"].map(responseToVenueVisit),
})

export const getVenues = async (): Promise<Venue[]> => {
    let endpoint = "/api/venues"
    try {
        let response = await axios.get(endpoint)
        let data = response.data
        let venues = data.map(responseToVenue)
        return venues
    } catch (e) {
        console.error(e)
        return []
    }
}

export const getVenue = async (venueId: number): Promise<Venue | undefined> => {
    let endpoint = `/api/venues/${venueId}`
    try {
        let response = await axios.get(endpoint)
        let data = response.data
        let venue = responseToVenue(data)
        return venue
    } catch (e) {
        console.error(e)
        return undefined
    }
}
const responseToUserVisit = (response: any) => ({
    visitId: response["visit_id"],
    venueId: response["venue_id"],
    venueName: response["venue_name"],
    visitDate: Date.parse(response["visit_date"]),
    notes: response["notes"],
    rating: response["rating"],
})

const responseToUserSummary = (response: any) => ({
    userId: response["user_id"],
    email: response["email"],
    displayName: response["display_name"],
    visits: response["visits"].map(responseToUserVisit),
})

export const getUser = async (
    userId: number
): Promise<UserSummary | undefined> => {
    let endpoint = `/api/user/${userId}`
    try {
        let response = await axios.get(endpoint)
        let data = response.data
        let user = responseToUserSummary(data)
        return user
    } catch (e) {
        console.error(e)
        return undefined
    }
}

const responseToVisit = (response: any) => ({
    visitId: response["visit_id"],
    userId: response["user_id"],
    userDisplayName: response["user_display_name"],
    venueId: response["venue_id"],
    venueName: response["venue_name"],
    visitDate: Date.parse(response["visit_date"]),
    notes: response["notes"],
    rating: response["rating"],
})

export const getVisits = async (): Promise<Visit[]> => {
    let endpoint = `/api/visits`
    try {
        let response = await axios.get(endpoint)
        let data = response.data
        let visits = data.map(responseToVisit)
        return visits
    } catch (e) {
        console.error(e)
        return []
    }
}
