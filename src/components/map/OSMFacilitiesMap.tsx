import React from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon paths for Leaflet in Vite
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export type FacilityPoint = {
  id: string;
  name: string;
  type?: string;
  code?: string;
  woreda?: string;
  region?: string;
  lat: number;
  lng: number;
};

interface OSMFacilitiesMapProps {
  facilities?: FacilityPoint[];
  center?: LatLngExpression;
  zoom?: number;
}

const sampleFacilities: FacilityPoint[] = [
  {
    id: "1",
    name: "Addis Ababa Health Center",
    type: "Health Center",
    code: "AA-001",
    region: "Addis Ababa",
    lat: 8.9806,
    lng: 38.7578,
  },
  {
    id: "2",
    name: "Adama General Hospital",
    type: "Hospital",
    code: "OR-045",
    region: "Oromia",
    lat: 8.5406,
    lng: 39.2695,
  },
  {
    id: "3",
    name: "Hawassa University Hospital",
    type: "Hospital",
    code: "SNNP-120",
    region: "Sidama",
    lat: 7.0621,
    lng: 38.4763,
  },
];

const OSMFacilitiesMap: React.FC<OSMFacilitiesMapProps> = ({
  facilities = sampleFacilities,
  center = [9.145, 40.489673], // Ethiopia approx
  zoom = 6,
}) => {
  return (
    <div className="absolute inset-0">
      <MapContainer {...({ center, zoom } as any)} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {facilities.map((f) => (
          <Marker key={f.id} position={[f.lat, f.lng] as LatLngExpression}>
            <Tooltip>
              <div className="text-xs">
                <div className="font-medium">{f.name}</div>
                {f.type && <div className="text-muted-foreground">{f.type}</div>}
                {f.code && <div>Code: {f.code}</div>}
                {f.region && <div>Region: {f.region}</div>}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default OSMFacilitiesMap;
