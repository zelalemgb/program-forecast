import React from "react";
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON } from "react-leaflet";
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
  regionMetrics?: Record<string, number>;
  geojsonUrl?: string;
  metricLabel?: string;
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
  regionMetrics,
  geojsonUrl,
  metricLabel,
}) => {
  const [regionsGeo, setRegionsGeo] = React.useState<any | null>(null);

  React.useEffect(() => {
    let active = true;
    if (regionMetrics) {
      fetch(geojsonUrl ?? "/data/ethiopia-regions.geojson")
        .then((r) => r.json())
        .then((gj) => {
          if (active) setRegionsGeo(gj);
        })
        .catch(() => setRegionsGeo(null));
    } else {
      setRegionsGeo(null);
    }
    return () => {
      active = false;
    };
  }, [regionMetrics, geojsonUrl]);

  const [minVal, maxVal] = React.useMemo(() => {
    if (!regionMetrics) return [0, 0];
    const vals = Object.values(regionMetrics);
    if (!vals.length) return [0, 0];
    return [Math.min(...vals), Math.max(...vals)];
  }, [regionMetrics]);

  const getOpacity = (v?: number) => {
    if (!regionMetrics || v === undefined || maxVal === minVal) return 0.2;
    const t = (v - minVal) / (maxVal - minVal || 1);
    return 0.2 + Math.max(0, Math.min(1, t)) * 0.6;
  };

  const styleFn = (feature: any) => {
    const props = feature?.properties || {};
    const name =
      props.shapeName || props.NAME_1 || props.region || props.Region || props.REGION;
    const value = name ? regionMetrics?.[name as string] : undefined;
    return {
      color: "hsl(var(--border))",
      weight: 1,
      fillColor: "hsl(var(--primary))",
      fillOpacity: getOpacity(value),
    } as L.PathOptions;
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature?.properties || {};
    const name =
      props.shapeName || props.NAME_1 || props.region || props.Region || props.REGION || "Unknown";
    const value = regionMetrics?.[name as string];
    const label = metricLabel ?? "Value";
    const html = `<div style="font-size:12px"><strong>${name}</strong><br/>${label}: ${
      value?.toLocaleString?.() ?? "N/A"
    }</div>`;
    // @ts-ignore
    (layer as any).bindTooltip(html, { sticky: true });
  };

  return (
    <div className="absolute inset-0">
      <MapContainer {...({ center, zoom } as any)} className="h-full w-full">
        <TileLayer 
          url="https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        {regionsGeo && (
          // @ts-ignore
          <GeoJSON data={regionsGeo as any} style={styleFn as any} onEachFeature={onEachFeature as any} />
        )}
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
