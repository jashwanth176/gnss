"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// This is to fix the icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function SatelliteMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Create map instance with initial view on India
      mapInstance.current = L.map(mapRef.current, {
        center: [20.5937, 78.9629], // Center on India
        zoom: 5,
        // Disable interactions by default
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
      });

      // Add satellite imagery tile layer (Esri World Imagery)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(mapInstance.current);

      // Enable interactions on click/tap
      mapInstance.current.once('click', () => {
        if (mapInstance.current) {
          mapInstance.current.dragging.enable();
          mapInstance.current.touchZoom.enable();
          mapInstance.current.scrollWheelZoom.enable();
          mapInstance.current.doubleClickZoom.enable();
          mapInstance.current.boxZoom.enable();
        }
      });
    }

    // Cleanup function to destroy the map instance
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
}