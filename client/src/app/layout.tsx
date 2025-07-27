import type { Metadata } from "next"
import "./globals.css"
import TopBar from "./TopBar"

export const metadata: Metadata = {
    title: "Brum Brew Fest Tracker",
    description: "Track visits to Brum Brew Fest visits",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body>
                <TopBar />
                {children}
            </body>
        </html>
    )
}
