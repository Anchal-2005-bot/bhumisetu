import { useState, useEffect, useMemo } from "react";
import Map, { Source, Layer, NavigationControl, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ParcelProperties } from "../types";

export function GISMap() {
  const [parcels, setParcels] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    feature: any;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/parcels")
      .then((res) => res.json())
      .then((data) => setParcels(data))
      .catch((err) => console.error("Failed to load parcels", err));
  }, []);

  const onHover = (event: any) => {
    const {
      features,
      point: { x, y }
    } = event;
    const hoveredFeature = features && features[0];
    
    if (hoveredFeature) {
      setHoverInfo({ feature: hoveredFeature, x, y });
    } else {
      setHoverInfo(null);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden border border-graticule-teal/30">
      <Map
        initialViewState={{
          longitude: 77.2095,
          latitude: 28.6145,
          zoom: 15
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        interactiveLayerIds={parcels ? ["parcels-fill"] : []}
        onMouseMove={onHover}
        onMouseLeave={() => setHoverInfo(null)}
        cursor={hoverInfo ? "pointer" : "grab"}
      >
        <NavigationControl position="top-right" />
        
        {parcels && (
          <Source id="parcels" type="geojson" data={parcels}>
            <Layer
              id="parcels-fill"
              type="fill"
              paint={{
                "fill-color": [
                  "match",
                  ["get", "status"],
                  "Notification", "#A8672E", // Tilled Earth
                  "Award", "#2F6B3A", // Cultivated Green
                  "#5E7B78" // Graticule Teal
                ],
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  0.8,
                  0.4
                ]
              }}
            />
            <Layer
              id="parcels-line"
              type="line"
              paint={{
                "line-color": "#10233F", // Registry Ink
                "line-width": 1
              }}
            />
          </Source>
        )}

        {hoverInfo && (
          <div
            className="absolute bg-white p-3 border border-graticule-teal/30 shadow-sm pointer-events-none text-sm min-w-[200px]"
            style={{ left: hoverInfo.x, top: hoverInfo.y, transform: "translate(-50%, -100%)", marginTop: "-10px" }}
          >
            <div className="font-mono text-xs text-graticule-teal mb-1">ULPIN: {hoverInfo.feature.properties.ulpin}</div>
            <div className="font-semibold text-registry-ink mb-1">{hoverInfo.feature.properties.owner}</div>
            <div className="flex justify-between text-registry-ink/80 text-xs">
              <span>Status:</span>
              <span className="font-medium">{hoverInfo.feature.properties.status}</span>
            </div>
            <div className="flex justify-between text-registry-ink/80 text-xs mt-0.5">
              <span>Area:</span>
              <span>{hoverInfo.feature.properties.area} Ha</span>
            </div>
          </div>
        )}
      </Map>

      <div className="absolute bottom-6 left-6 bg-white p-4 border border-graticule-teal/30 shadow-sm text-sm">
        <h4 className="font-serif mb-2">Map Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tilled-earth/40 border border-registry-ink"></div>
            <span>Section 11 Notification</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cultivated-green/40 border border-registry-ink"></div>
            <span>Award / Possession</span>
          </div>
        </div>
      </div>
    </div>
  );
}
