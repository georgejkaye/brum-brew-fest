import axios from "axios"
import { Venue, User, Visit, UserSummary } from "./interfaces"

const responseToUser = (response: any) => ({
    userId: response["id"],
    displayName: response["display_name"],
    email: response["email"],
    isVerified: response["is_verified"],
})

export const login = async (email: string, password: string) => {
    let endpoint = "/auth/jwt/login"
    try {
        let body = {
            grant_type: "password",
            username: email,
            password: password,
        }
        let headers = {
            accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        let response = await axios.post(endpoint, body, { headers })
        let data = response.data
        return data["access_token"]
    } catch (e) {
        console.error(e)
        return undefined
    }
}

export const registerUser = async (
    email: string,
    password: string,
    displayName: string
) => {
    let endpoint = "/api/auth/register"
    try {
        let body = {
            email: email,
            password: password,
            display_name: displayName,
        }
        let response = await axios.post(endpoint, body)
        let data = response.data
        let user = responseToUser(data)
        return user
    } catch (e) {
        console.error(e)
        return undefined
    }
}

export const requestVerifyToken = async (email: string) => {
    let endpoint = "/api/auth/request-verify-token"
    try {
        let body = { email }
        await axios.post(endpoint, body)
    } catch (e) {
        console.error(e)
        return undefined
    }
}

export const verifyUser = async (token: string) => {
    let endpoint = "/api/auth/verify"
    try {
        let body = { token }
        let response = await axios.post(endpoint, body)
        let data = response.data
        let user = responseToUser(data)
        return user
    } catch (e) {
        console.error(e)
        return undefined
    }
}

export const requestPasswordReset = async (email: string) => {
    let endpoint = "/api/auth/forgot-password"
    try {
        let body = { email }
        await axios.post(endpoint, body)
    } catch (e) {
        console.error(e)
    }
}

export const resetPassword = async (token: string) => {
    let endpoint = "/api/auth/verify"
    try {
        let body = { token }
        let response = await axios.post(endpoint, body)
        let data = response.data
        return data as string
    } catch (e) {
        console.error(e)
        return undefined
    }
}

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
