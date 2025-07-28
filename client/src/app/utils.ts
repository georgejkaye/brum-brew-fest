import { User, Venue } from "./interfaces"

export const getFirstVisitToVenue = (user: User, venue: Venue) =>
    user.visits
        .filter((visitVenue) => visitVenue.venueId === venue.venueId)
        .sort(
            (a, b) =>
                a.visitDate.getMilliseconds() - b.visitDate.getMilliseconds()
        )[0]
