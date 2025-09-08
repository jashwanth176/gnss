"use client";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function LeafletMapComponent() {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup function to remove any existing map instances
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ width: "100%", height: "100%" }}
        ref={mapRef}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  );
}