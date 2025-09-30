"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SiteLogo } from "@/components/SiteLogo"

export default function CityDataExternal() {
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
                <span className="text-lg font-semibold text-black">City Environmental Portal</span>
                <span className="text-xs text-muted-foreground">Multi-parameter weather and environmental data</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black mb-2">Key Cities Environmental Data Portal</h1>
          <p className="text-muted-foreground mb-4">
            Comprehensive environmental monitoring for key cities across India. Access real-time data across multiple parameters:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl mb-2">🌤️</div>
              <h3 className="font-semibold text-blue-900">Basic Weather</h3>
              <p className="text-sm text-blue-700">4 parameters</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl mb-2">🌱</div>
              <h3 className="font-semibold text-green-900">Soil Moisture</h3>
              <p className="text-sm text-green-700">2 parameters</p>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="text-2xl mb-2">🌿</div>
              <h3 className="font-semibold text-emerald-900">Vegetation & Land</h3>
              <p className="text-sm text-emerald-700">7 parameters</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-2xl mb-2">🛰️</div>
              <h3 className="font-semibold text-purple-900">ECMWF Analysis</h3>
              <p className="text-sm text-purple-700">7 parameters</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl overflow-hidden border shadow bg-background" style={{ height: "75vh" }}>
          <iframe
            title="City Environmental Data Portal"
            src="https://iittnif-fixed.vercel.app/"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </main>
    </div>
  )
}