"use client";

import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

const markerIcon2xUrl = new URL(
  "leaflet/dist/images/marker-icon-2x.png",
  import.meta.url
).toString();
const markerIconUrl = new URL(
  "leaflet/dist/images/marker-icon.png",
  import.meta.url
).toString();
const markerShadowUrl = new URL(
  "leaflet/dist/images/marker-shadow.png",
  import.meta.url
).toString();

type LeafletModule = typeof import("leaflet");

type MapMarker = {
  id: string;
  title: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  href: string;
};

type PropertyMapProps = {
  markers: MapMarker[];
  height?: string;
};

const DEFAULT_ZOOM = 13;
const DEFAULT_CENTER: [number, number] = [31.6688, 34.5743];

export default function PropertyMap({ markers, height = "360px" }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const [mapReadyTick, setMapReadyTick] = useState(0);
  const center = useMemo(() => {
    if (markers.length === 0) {
      return DEFAULT_CENTER;
    }
    const avgLat = markers.reduce((sum, marker) => sum + marker.latitude, 0) / markers.length;
    const avgLng = markers.reduce((sum, marker) => sum + marker.longitude, 0) / markers.length;
    return [avgLat, avgLng] as [number, number];
  }, [markers]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      const L = leafletRef.current ?? (await import("leaflet"));
      if (!isMounted || !containerRef.current || mapRef.current) {
        return;
      }

      leafletRef.current = L;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2xUrl,
        iconUrl: markerIconUrl,
        shadowUrl: markerShadowUrl,
      });

      const map = L.map(containerRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      map.invalidateSize();
      setMapReadyTick((value) => value + 1);
    };

    void initMap();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    let layer = markersLayerRef.current;
    const L = leafletRef.current;
    if (!map || !L) {
      return;
    }

    if (!layer) {
      layer = L.layerGroup().addTo(map);
      markersLayerRef.current = layer;
    }

    map.setView(center, DEFAULT_ZOOM);
    layer.clearLayers();

    markers.forEach((marker) => {
      const markerIcon = L.divIcon({
        className: "",
        html: '<span style="font-size:18px;line-height:18px;">📍</span>',
        iconSize: [18, 18],
        iconAnchor: [9, 18],
      });
      const markerInstance = L.marker([marker.latitude, marker.longitude], {
        icon: markerIcon,
      }).addTo(layer);
      const tooltipText = marker.address?.trim() || marker.title;
      markerInstance.bindTooltip(tooltipText, { direction: "top", offset: [0, -10] });
      markerInstance.bindPopup(
        `<div style="font-size:12px;"><strong>${marker.title}</strong><br/><a href="${marker.href}">פתיחת הנכס</a></div>`
      );
      markerInstance.on("click", () => {
        if (globalThis?.location) {
          globalThis.location.href = marker.href;
        }
      });
    });

    if (markers.length > 0) {
      const bounds = L.latLngBounds(
        markers.map((marker) => [marker.latitude, marker.longitude])
      );
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: DEFAULT_ZOOM });
    }

    map.invalidateSize();
  }, [markers, center, mapReadyTick]);

  if (markers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        אין נכסים עם מיקום מדויק להצגה במפה.
      </div>
    );
  }

  return (
    <div className="relative z-0 overflow-hidden rounded-2xl border border-slate-200">
      <div
        ref={containerRef}
        className="relative z-0"
        style={{ height, width: "100%" }}
      />
    </div>
  );
}
