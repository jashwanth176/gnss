"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SiteLogo } from "@/components/SiteLogo"

export default function InteractiveMapExternal() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-black">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <SiteLogo size="sm" className="rounded-lg shadow" />
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-semibold text-black">Interactive Map</span>
                <span className="text-xs text-muted-foreground">Embedded CYGNSS explorer</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="rounded-xl overflow-hidden border shadow bg-background" style={{ height: "80vh" }}>
          <iframe
            title="External Interactive Map"
            src="https://jashwanth176.github.io/map-india/"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </main>
    </div>
  )
}
