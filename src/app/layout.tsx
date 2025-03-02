import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "~/styles/globals.css"
import { Sidebar } from "~/components/sidebar"
import { TRPCReactProvider } from "~/trpc/react"
import { headers } from "next/headers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Skills Matrix",
  description: "Track and manage employee skills",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  )
}

