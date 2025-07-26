"use client"
import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useState,
} from "react"
import { CurrentView } from "../interfaces"

interface DataContextInterface {
    currentView: CurrentView
    setCurrentView: Dispatch<SetStateAction<CurrentView>>
}

const defaultDataContext: DataContextInterface = {
    currentView: CurrentView.Map,
    setCurrentView: () => undefined,
}

export const DataContext =
    createContext<DataContextInterface>(defaultDataContext)

export const DataProvider = ({ children }: PropsWithChildren) => {
    const [currentView, setCurrentView] = useState(CurrentView.Map)
    return (
        <DataContext.Provider value={{ currentView, setCurrentView }}>
            {children}
        </DataContext.Provider>
    )
}
