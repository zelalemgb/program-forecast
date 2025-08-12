import React from "react";
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON, LayersControl, CircleMarker } from "react-leaflet";
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
  geojsonUrl?: string; // Regions (ADM1)
  zonesGeojsonUrl?: string; // Zones (ADM2)
  woredasGeojsonUrl?: string; // Woredas (ADM3)
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

const majorCities = [
  { name: "Addis Ababa", lat: 8.9806, lng: 38.7578 },
  { name: "Dire Dawa", lat: 9.6008, lng: 41.85 },
  { name: "Mekelle", lat: 13.4967, lng: 39.4753 },
  { name: "Gondar", lat: 12.6, lng: 37.4667 },
  { name: "Bahir Dar", lat: 11.6, lng: 37.3833 },
  { name: "Hawassa", lat: 7.0621, lng: 38.4763 },
  { name: "Adama (Nazret)", lat: 8.5406, lng: 39.2695 },
  { name: "Jimma", lat: 7.6667, lng: 36.8333 },
  { name: "Dessie", lat: 11.1333, lng: 39.6333 },
  { name: "Jijiga", lat: 9.35, lng: 42.8 },
  { name: "Harar", lat: 9.3131, lng: 42.118 },
];

const OSMFacilitiesMap: React.FC<OSMFacilitiesMapProps> = ({
  facilities = sampleFacilities,
  center = [9.145, 40.489673], // Ethiopia approx
  zoom = 6,
  regionMetrics,
  geojsonUrl,
  zonesGeojsonUrl,
  woredasGeojsonUrl,
  metricLabel,
}) => {
  const [regionsGeo, setRegionsGeo] = React.useState<any | null>(null);
  const [zonesGeo, setZonesGeo] = React.useState<any | null>(null);
  const [woredasGeo, setWoredasGeo] = React.useState<any | null>(null);

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

  // Load optional Zones (ADM2) and Woredas (ADM3) boundaries if available
  React.useEffect(() => {
    let active = true;
    const load = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("failed");
      return res.json();
    };

    const zonesUrl = zonesGeojsonUrl ?? "/data/ethiopia-zones.geojson";
    const woredasUrl = woredasGeojsonUrl ?? "/data/ethiopia-woredas.geojson";

    load(zonesUrl)
      .then((gj) => active && setZonesGeo(gj))
      .catch(() => setZonesGeo(null));

    load(woredasUrl)
      .then((gj) => active && setWoredasGeo(gj))
      .catch(() => setWoredasGeo(null));

    return () => {
      active = false;
    };
  }, [zonesGeojsonUrl, woredasGeojsonUrl]);

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

  const zonesStyle: L.PathOptions = {
    color: "hsl(var(--primary))",
    weight: 1,
    fillOpacity: 0,
    dashArray: "4 2",
  };

  const woredasStyle: L.PathOptions = {
    color: "hsl(var(--muted-foreground))",
    weight: 0.5,
    fillOpacity: 0,
    dashArray: "2 2",
  };

  const onEachZone = (feature: any, layer: L.Layer) => {
    const p = feature?.properties || {};
    const name = p.NAME_2 || p.Zone || p.ZONE || p.zone || "Zone";
    // @ts-ignore
    (layer as any).bindTooltip(`<div style="font-size:12px">${name}</div>`, { sticky: true });
  };

  const onEachWoreda = (feature: any, layer: L.Layer) => {
    const p = feature?.properties || {};
    const name = p.NAME_3 || p.Woreda || p.WOREDA || p.woreda || "Woreda";
    // @ts-ignore
    (layer as any).bindTooltip(`<div style=\"font-size:12px\">${name}</div>`, { sticky: true });
  };

  return (
    <div className="absolute inset-0">
      <MapContainer {...({ center, zoom } as any)} className="h-full w-full">
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Minimal">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Light (labels)">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay name="Labels">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" opacity={0.9} />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Regions - Choropleth">
            {regionsGeo && (
              // @ts-ignore
              <GeoJSON data={regionsGeo as any} style={styleFn as any} onEachFeature={onEachFeature as any} />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Zones Boundaries">
            {zonesGeo && (
              // @ts-ignore
              <GeoJSON data={zonesGeo as any} style={zonesStyle as any} onEachFeature={onEachZone as any} />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Woredas Boundaries">
            {woredasGeo && (
              // @ts-ignore
              <GeoJSON data={woredasGeo as any} style={woredasStyle as any} onEachFeature={onEachWoreda as any} />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Major Cities">
            {majorCities.map((c) => (
              <CircleMarker
                key={c.name}
                center={[c.lat, c.lng] as LatLngExpression}
                radius={5}
                pathOptions={{
                  color: "hsl(var(--primary))",
                  fillColor: "hsl(var(--primary))",
                  fillOpacity: 0.9,
                  weight: 1,
                }}
              >
                <Tooltip>
                  <div className="text-xs">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-muted-foreground">City</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Facilities">
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
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default OSMFacilitiesMap;
