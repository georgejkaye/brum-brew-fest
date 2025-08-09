"use client"
import {
    ChangeEvent,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react"
import { Area, Venue } from "../../interfaces"
import { VenuesContext } from "@/app/context/venues"
import { Rating } from "@smastrom/react-rating"
import Link from "next/link"
import { getAverageRating, getDistanceToVenue } from "@/app/utils"

interface VenueCardProps {
    venue: Venue
    location: GeolocationPosition | undefined
}

const VenueCard = ({ venue, location }: VenueCardProps) => {
    const visitCount = venue.visits.length
    const venueAverageRating =
        visitCount === 0
            ? 0
            : venue.visits.reduce((a, b) => a + b.rating, 0) / visitCount
    return (
        <Link href={`/venues/${venue.venueId}`}>
            <div className="p-4 flex md:flex-row items-end gap-4 bg-green-100 rounded-lg shadow hover:bg-green-200">
                <div className="flex flex-col flex-1 gap-2">
                    <div className="text-xl font-bold">
                        {venue.name}
                        {venue.pinLocation ? " 🔰" : ""}
                    </div>
                    <div>{venue.address}</div>
                    {location && (
                        <div>
                            {getDistanceToVenue(venue, location).toFixed(2)}km
                            away
                        </div>
                    )}
                    <div>{visitCount} visits</div>
                    <Rating
                        style={{ maxWidth: 100 }}
                        value={venueAverageRating}
                        readOnly
                    />
                </div>
            </div>
        </Link>
    )
}

interface AreaGroupProps {
    area: Area
    location: GeolocationPosition | undefined
}

const AreaGroup = ({ area, location }: AreaGroupProps) => {
    return (
        <div>
            <h3 className="font-bold text-2xl mb-4 mt-4">{area.areaName}</h3>
            <div className="flex flex-col gap-4">
                {area.venues.map((venue) => (
                    <VenueCard
                        key={`venue-${venue.venueId}`}
                        venue={venue}
                        location={location}
                    />
                ))}
            </div>
        </div>
    )
}

const partitionByArea = (venues: Venue[]) => {
    const partitionedVenues = venues.reduce(
        (
            partitionedVenues: { [venueAreaName: string]: Area },
            currentVenue
        ) => {
            if (!partitionedVenues[currentVenue.venueAreaName]) {
                partitionedVenues[currentVenue.venueAreaName] = {
                    areaId: currentVenue.venueAreaId,
                    areaName: currentVenue.venueAreaName,
                    venues: [],
                }
            }
            partitionedVenues[currentVenue.venueAreaName].venues = [
                ...partitionedVenues[currentVenue.venueAreaName].venues,
                currentVenue,
            ]
            return partitionedVenues
        },
        {}
    )
    return Object.keys(partitionedVenues)
        .map((key) => partitionedVenues[key])
        .sort((area1, area2) => area1.areaName.localeCompare(area2.areaName))
}

const Page = () => {
    const { venues } = useContext(VenuesContext)
    const [location, setLocation] = useState<GeolocationPosition | undefined>(
        undefined
    )
    const [groupByArea, setGroupByArea] = useState(true)
    const [filteredVenues, setFilteredVenues] = useState([...venues])
    const [filteredAreas, setFilteredAreas] = useState<Area[]>([])
    const [searchValue, setSearchValue] = useState("")
    const [sortByValue, setSortByValue] = useState("name-asc")

    const nameAscendingSort = (a: Venue, b: Venue) =>
        a.name.localeCompare(b.name)
    const nameDescendingSort = (a: Venue, b: Venue) =>
        b.name.localeCompare(a.name)
    const visitsAscendingSort = (a: Venue, b: Venue) =>
        a.visits.length - b.visits.length
    const visitsDescendingSort = (a: Venue, b: Venue) =>
        b.visits.length - a.visits.length
    const ratingAscendingSort = (a: Venue, b: Venue) =>
        getAverageRating(a) - getAverageRating(b)
    const ratingDescendingSort = (a: Venue, b: Venue) =>
        getAverageRating(b) - getAverageRating(a)
    const distanceAscendingSort = useCallback(
        (a: Venue, b: Venue) => {
            if (!location) {
                return 0
            } else {
                return (
                    getDistanceToVenue(a, location) -
                    getDistanceToVenue(b, location)
                )
            }
        },
        [location]
    )
    const distanceDescendingSort = useCallback(
        (a: Venue, b: Venue) => {
            if (!location) {
                return 0
            } else {
                return (
                    getDistanceToVenue(a, location) -
                    getDistanceToVenue(b, location)
                )
            }
        },
        [location]
    )

    useEffect(() => {
        const getLocation = async () => {
            navigator.geolocation.getCurrentPosition(
                (position) => setLocation(position),
                (err) => console.error(err)
            )
        }
        getLocation()
    }, [])
    useEffect(() => {
        const getSortByFunction = () =>
            sortByValue === "name-asc"
                ? nameAscendingSort
                : sortByValue === "name-desc"
                ? nameDescendingSort
                : sortByValue === "visits-asc"
                ? visitsAscendingSort
                : sortByValue === "visits-desc"
                ? visitsDescendingSort
                : sortByValue === "rating-asc"
                ? ratingAscendingSort
                : sortByValue === "rating-desc"
                ? ratingDescendingSort
                : sortByValue === "distance-asc"
                ? distanceAscendingSort
                : distanceDescendingSort
        const filterAndSortVenues = (venueArray: Venue[]) =>
            venueArray
                .filter(
                    (venue) =>
                        venue.name
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()) ||
                        venue.address
                            .toLowerCase()
                            .includes(searchValue.toLowerCase())
                )
                .sort(getSortByFunction())
        setFilteredVenues(filterAndSortVenues(venues))
        const areas = partitionByArea(venues)
        setFilteredAreas(
            areas.map((area) => ({
                areaId: area.areaId,
                areaName: area.areaName,
                venues: filterAndSortVenues(area.venues),
            }))
        )
    }, [
        searchValue,
        venues,
        sortByValue,
        distanceAscendingSort,
        distanceDescendingSort,
    ])
    const onChangeGroupByArea = (e: ChangeEvent<HTMLInputElement>) => {
        setGroupByArea(e.target.checked)
    }
    const onChangeSortBy = (e: ChangeEvent<HTMLSelectElement>) => {
        setSortByValue(e.target.value)
    }
    return (
        <div className="flex flex-col gap-4 w-full md:w-2/3 lg:w-1/2 mx-auto p-4">
            <h2 className="font-bold text-3xl">Venues</h2>
            <input
                type="text"
                placeholder="Type to filter..."
                className="p-4 rounded-xl border-gray-400 border-1"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
            />
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                <div className="flex flex-row gap-2 items-center">
                    <label htmlFor="group-by-area">Group by area</label>
                    <input
                        id="group-by-area"
                        type="checkbox"
                        checked={groupByArea}
                        onChange={onChangeGroupByArea}
                    />
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <label htmlFor="sort-by">Sort by</label>
                    <select
                        className="border-1 rounded p-2"
                        name="sort-by"
                        value={sortByValue}
                        onChange={onChangeSortBy}
                    >
                        <option value="name-asc">A-Z</option>
                        <option value="name-desc">Z-A</option>
                        <option value="visits-desc">Visits (high-low)</option>
                        <option value="visits-asc">Visits (low-high)</option>
                        <option value="rating-desc">Rating (high-low)</option>
                        <option value="rating-asc">Rating (low-high)</option>
                        {location && (
                            <>
                                <option value="distance-desc">
                                    Distance (high-low)
                                </option>
                                <option value="distance-asc">
                                    Distance (low-high)
                                </option>
                            </>
                        )}
                    </select>
                </div>
            </div>
            {groupByArea
                ? filteredAreas.map((area) => (
                      <AreaGroup
                          key={`area-${area.areaId}`}
                          area={area}
                          location={location}
                      />
                  ))
                : filteredVenues.map((venue) => (
                      <VenueCard
                          key={`venue-${venue.venueId}`}
                          venue={venue}
                          location={location}
                      />
                  ))}
        </div>
    )
}

export default Page
