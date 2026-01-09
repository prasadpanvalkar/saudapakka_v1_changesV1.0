"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for missing marker icons in Leaflet + Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ onSelect, initialPos }: { onSelect: (lat: number, lng: number) => void, initialPos: L.LatLng | null }) {
  const [position, setPosition] = useState<L.LatLng | null>(initialPos);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  // Default center: Pune/Aurangabad region
  const defaultCenter = { lat: 19.8762, lng: 75.3433 };

  // Use initial coords for center if available
  const center = (initialLat && initialLng) ? { lat: initialLat, lng: initialLng } : defaultCenter;
  const initialPos = (initialLat && initialLng) ? new L.LatLng(initialLat, initialLng) : null;

  return (
    <div className="h-[300px] w-full rounded-md overflow-hidden border" style={{ isolation: 'isolate', position: 'relative', zIndex: 0 }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onSelect={onLocationSelect} initialPos={initialPos} />
      </MapContainer>
    </div>
  );
}