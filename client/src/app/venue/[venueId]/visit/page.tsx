"use client"

import {
    useContext,
    useEffect,
    useState,
    KeyboardEvent,
    MouseEvent,
    FormEvent,
} from "react"
import { UserContext } from "@/app/context/user"
import { useRouter } from "next/navigation"
import { VenueContext } from "@/app/context/venue"
import { postVisit } from "@/app/api"
import { Rating } from "@smastrom/react-rating"

import "@smastrom/react-rating/style.css"
import {
    LoginButton,
    LoginTextAreaInput,
    LoginTextInput,
} from "@/app/components/login"
import { Loader } from "@/app/Loader"

interface RecordVisitFormProps {
    submitVisit: (
        notes: string,
        rating: number,
        drink: string
    ) => Promise<boolean>
}

export const RecordVisitForm = ({ submitVisit }: RecordVisitFormProps) => {
    const [notesText, setNotesText] = useState("")
    const [ratingValue, setRatingValue] = useState(0)
    const [drinkText, setDrinkText] = useState("")
    const performSubmitVisit = () => {
        submitVisit(notesText, ratingValue, drinkText)
    }
    const onKeyDownDrink = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Enter") {
            performSubmitVisit()
        }
    }
    const onClickSubmit = (e: MouseEvent<HTMLButtonElement>) => {
        performSubmitVisit()
    }
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <div>Notes</div>
                <LoginTextAreaInput value={notesText} setValue={setNotesText} />
            </div>
            <div>
                <div>Rating</div>
                <Rating
                    style={{ maxWidth: 250 }}
                    value={ratingValue}
                    onChange={setRatingValue}
                />
            </div>
            <div>
                <div>Drink</div>
                <LoginTextInput
                    value={drinkText}
                    setValue={setDrinkText}
                    type="text"
                    onKeyDown={onKeyDownDrink}
                />
            </div>
            <LoginButton label="Submit" onClick={onClickSubmit} />
        </form>
    )
}

export const Page = () => {
    const { token, user, isLoadingUser } = useContext(UserContext)
    const { venue, isLoadingVenue } = useContext(VenueContext)
    const router = useRouter()
    const [errorText, setErrorText] = useState("")
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (!isLoadingUser && !user) {
            router.push("/")
        }
    }, [isLoadingUser])

    useEffect(() => {
        if (!isLoadingVenue && !venue) {
            router.push("/")
        }
    }, [isLoadingVenue])

    const submitVisit = async (
        notes: string,
        rating: number,
        drink: string
    ) => {
        setLoading(true)
        if (!token) {
            setErrorText("Could not submit visit: invalid token")
            return false
        } else if (!venue) {
            setErrorText("Could not submit visit: invalid venue")
            return false
        } else {
            let visitResult = await postVisit(
                token,
                venue.venueId,
                new Date(Date.now()),
                notes,
                rating,
                drink
            )
            console.log(visitResult)
            if (visitResult.success) {
                router.push("/")
                return true
            }
            setErrorText("Could not submit visit")
            setLoading(false)
            return false
        }
    }

    return !user || !venue ? (
        ""
    ) : (
        <div className="flex flex-col md:w-1/2 mx-auto items-center p-4">
            {isLoading ? (
                <Loader />
            ) : (
                <div className="w-full flex flex-col gap-4">
                    <h1 className="text-2xl font-bold">Record a visit</h1>
                    {errorText && (
                        <div className="bg-red-300 rounded p-4">
                            {errorText}
                        </div>
                    )}
                    <div className="text-xl">{venue.name}</div>
                    <RecordVisitForm submitVisit={submitVisit} />
                </div>
            )}
        </div>
    )
}

export default Page
