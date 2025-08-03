"use client"
import { ChangeEvent, useContext, useEffect, useState } from "react"
import { Area, Venue } from "../../interfaces"
import { VenuesContext } from "@/app/context/venues"
import { Rating } from "@smastrom/react-rating"
import Link from "next/link"

interface VenueCardProps {
    venue: Venue
}

const VenueCard = ({ venue }: VenueCardProps) => {
    const visitCount = venue.visits.length
    const venueAverageRating =
        visitCount === 0
            ? 0
            : venue.visits.reduce((a, b) => a + b.rating, 0) / visitCount
    return (
        <Link href={`/venues/${venue.venueId}`}>
            <div className="p-4 flex md:flex-row items-end gap-4 bg-green-100 rounded-lg shadow hover:bg-green-200">
                <div className="flex flex-col flex-1 gap-2">
                    <div className="text-2xl font-bold">{venue.name}</div>
                    <div>{venue.address}</div>
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
}

const AreaGroup = ({ area }: AreaGroupProps) => {
    return (
        <div>
            <h3 className="font-bold text-xl mb-4">{area.areaName}</h3>
            <div className="flex flex-col gap-4">
                {area.venues.map((venue) => (
                    <VenueCard key={`venue-${venue.venueId}`} venue={venue} />
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
    console.log(partitionedVenues)
    return Object.keys(partitionedVenues)
        .map((key) => partitionedVenues[key])
        .sort((area1, area2) => area1.areaName.localeCompare(area2.areaName))
}

const Page = () => {
    const { venues } = useContext(VenuesContext)
    const [groupByArea, setGroupByArea] = useState(true)
    const [filteredVenues, setFilteredVenues] = useState([...venues])
    const [filteredAreas, setFilteredAreas] = useState<Area[]>([])
    const [searchValue, setSearchValue] = useState("")
    useEffect(() => {
        const filterVenues = (venueArray: Venue[]) =>
            venueArray.filter(
                (venue) =>
                    venue.name
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                    venue.address
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
            )
        setFilteredVenues(filterVenues(venues))
        const areas = partitionByArea(venues)
        setFilteredAreas(
            areas.map((area) => ({
                areaId: area.areaId,
                areaName: area.areaName,
                venues: filterVenues(area.venues),
            }))
        )
    }, [searchValue, venues])
    const onChangeGroupByArea = (e: ChangeEvent<HTMLInputElement>) => {
        setGroupByArea(e.target.checked)
    }
    return (
        <div className="flex flex-col gap-4 w-full md:w-2/3 lg:w-1/2 mx-auto p-4">
            <input
                type="text"
                placeholder="Type to filter..."
                className="p-4 rounded-xl border-gray-400 border-1"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
            />
            <div className="flex flex-row">
                <div className="flex flex-row gap-2">
                    <input
                        id="group-by-area"
                        type="checkbox"
                        checked={groupByArea}
                        onChange={onChangeGroupByArea}
                    />
                    <label htmlFor="group-by-area">Group by area</label>
                </div>
            </div>
            {groupByArea
                ? filteredAreas.map((area) => (
                      <AreaGroup key={`area-${area.areaId}`} area={area} />
                  ))
                : filteredVenues.map((venue) => (
                      <VenueCard key={`venue-${venue.venueId}`} venue={venue} />
                  ))}
        </div>
    )
}

export default Page
