"use client"

import React from "react"

export default function InteractiveMapExternal() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <a href="/" className="text-sm text-black hover:text-primary">← Back</a>
        </div>
        <div className="rounded-xl overflow-hidden border shadow bg-background" style={{ height: "80vh" }}>
          <iframe
            title="External Interactive Map"
            src="https://iittnif-map.vercel.app/"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </div>
    </div>
  )
}
