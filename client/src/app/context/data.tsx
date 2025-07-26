"use client"
import { createContext, PropsWithChildren } from "react"

interface DataContextInterface {}

const defaultDataContext: DataContextInterface = {}

export const DataContext =
    createContext<DataContextInterface>(defaultDataContext)

export const DataProvider = ({ children }: PropsWithChildren) => {
    return (
        <DataContext.Provider value={defaultDataContext}>
            {children}
        </DataContext.Provider>
    )
}
