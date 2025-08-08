export enum CurrentView {
    Map,
    List,
}

export interface SingleUserVisit {
    visitId: number
    venueId: number
    venueName: string
    visitDate: Date
    notes: string
    rating: number
    drink: string
}

export interface User {
    userId: number
    displayName: string
    email: string
    isVerified: boolean
    visits: SingleUserVisit[]
}

export interface VenueVisit {
    visitId: number
    userId: number
    userDisplayName: number
    visitDate: Date
    notes: string
    rating: number
    drink: string
}

export interface Venue {
    venueId: number
    name: string
    address: string
    website: string | undefined
    latitude: number
    longitude: number
    visits: VenueVisit[]
    pinLocation: boolean
    venueAreaId: number
    venueAreaName: string
}

export interface UserSummary {
    userId: number
    email: string
    displayName: string
    visits: SingleUserVisit[]
}

export interface Visit {
    visitId: number
    userId: number
    userDisplayName: string
    venueId: number
    venueName: string
    visitDate: Date
    notes: string
    rating: number
}

export interface Area {
    areaId: number
    areaName: string
    venues: Venue[]
}
