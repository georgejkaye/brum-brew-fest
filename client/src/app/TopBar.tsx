import { useContext } from "react"
import { DataContext } from "./context/data"

const TopBar = () => {
    return (
        <div className="flex flex-row p-4 bg-[#38db98]">
            <div className="text-2xl text-black font-bold">
                Brum Brew Fest Tracker
            </div>
        </div>
    )
}

export default TopBar
