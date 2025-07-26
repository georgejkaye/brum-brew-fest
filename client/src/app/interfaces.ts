export enum CurrentView {
    Map,
    List,
}

export interface VenueVisit {
    visitId: number
    userId: number
    userDisplayName: number
    visitDate: Date
    notes: string
    rating: number
}

export interface Venue {
    venueId: number
    name: string
    address: string
    latitude: number
    longitude: number
    visits: VenueVisit[]
}

export interface SingleUserVisit {
    visitId: number
    venueId: number
    venueName: string
    visitDate: Date
    notes: string
    rating: number
}

export interface User {
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
