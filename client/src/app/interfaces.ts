interface VenueVisit {
    visitId: number
    userId: number
    userDisplayName: number
    visitDate: Date
    notes: string
    rating: number
}

interface Venue {
    venueId: number
    name: string
    address: string
    latitude: number
    longitude: number
    visits: VenueVisit[]
}

interface SingleUserVisit {
    visitId: number
    venueId: number
    venueName: string
    visitDate: Date
    notes: string
    rating: number
}

interface User {
    userId: number
    email: string
    displayName: string
    visits: SingleUserVisit[]
}

interface Visit {
    visitId: number
    userId: number
    userDisplayName: string
    venueId: number
    venueName: string
    visitDate: Date
    notes: string
    rating: number
}
