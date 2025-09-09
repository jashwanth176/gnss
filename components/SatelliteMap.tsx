"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Sample GNSS-R observation points
const gnssrPoints = [
  { lat: 28.6139, lng: 77.2090, name: "Delhi", snr: 45.2, type: "Urban" },
  { lat: 19.0760, lng: 72.8777, name: "Mumbai", snr: 38.7, type: "Coastal" },
  { lat: 13.0827, lng: 80.2707, name: "Chennai", snr: 42.1, type: "Coastal" },
  { lat: 22.5726, lng: 88.3639, name: "Kolkata", snr: 41.3, type: "Urban" },
  { lat: 12.9716, lng: 77.5946, name: "Bangalore", snr: 44.8, type: "Urban" },
  { lat: 17.3850, lng: 78.4867, name: "Hyderabad", snr: 43.2, type: "Urban" },
  { lat: 23.0225, lng: 72.5714, name: "Ahmedabad", snr: 39.6, type: "Arid" },
  { lat: 26.9124, lng: 75.7873, name: "Jaipur", snr: 40.1, type: "Arid" },
  { lat: 11.0168, lng: 76.9558, name: "Coimbatore", snr: 41.7, type: "Agricultural" },
  { lat: 15.2993, lng: 74.1240, name: "Goa", snr: 37.9, type: "Coastal" },
];

// Fix Leaflet icon issue
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

export default function SatelliteMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Ensure we're on the client side
    
    if (mapRef.current && !mapInstance.current) {
      try {
        // Create map instance with initial view on India
        mapInstance.current = L.map(mapRef.current, {
          center: [20.5937, 78.9629],
          zoom: 5,
          dragging: true,
          touchZoom: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
        });

        // Add satellite imagery tile layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 18
        }).addTo(mapInstance.current);

        // Add GNSS-R observation points
        gnssrPoints.forEach(point => {
          if (mapInstance.current) {
            const color = point.type === 'Coastal' ? '#00FFFF' : 
                         point.type === 'Urban' ? '#8B45FF' : 
                         point.type === 'Agricultural' ? '#00FF00' : '#FFD700';
            
            const marker = L.circleMarker([point.lat, point.lng], {
              radius: 8,
              fillColor: color,
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(mapInstance.current);

            marker.bindPopup(`
              <div style="font-family: sans-serif;">
                <h3 style="margin: 0 0 8px 0; color: #333;">${point.name}</h3>
                <p style="margin: 4px 0;"><strong>Type:</strong> ${point.type}</p>
                <p style="margin: 4px 0;"><strong>SNR:</strong> ${point.snr} dB</p>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">Click marker for DDM analysis</p>
              </div>
            `);
          }
        });

        // Add a legend
        const LegendControl = L.Control.extend({
          onAdd: function() {
            const div = L.DomUtil.create('div', 'legend');
            div.innerHTML = `
              <div style="background: rgba(255,255,255,0.9); padding: 10px; border-radius: 8px; font-size: 12px;">
                <h4 style="margin: 0 0 8px 0;">GNSS-R Observations</h4>
                <div><span style="color: #00FFFF;">●</span> Coastal</div>
                <div><span style="color: #8B45FF;">●</span> Urban</div>
                <div><span style="color: #00FF00;">●</span> Agricultural</div>
                <div><span style="color: #FFD700;">●</span> Arid</div>
              </div>
            `;
            return div;
          }
        });
        
        new LegendControl({ position: 'bottomright' }).addTo(mapInstance.current);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '400px',
        borderRadius: '12px',
        overflow: 'hidden'
      }} 
      className="border border-border/20"
    />
  );
}