"use client";

import PropertyMap from "@/components/PropertyMap";

type HotMarker = {
  id: string;
  title: string;
  address?: string | null;
  latitude: number;
  longitude: number;
};

type HotPropertiesMapProps = {
  markers: HotMarker[];
};

export default function HotPropertiesMap({ markers }: HotPropertiesMapProps) {
  const mapMarkers = markers.map((item) => ({
    id: item.id,
    title: item.title,
    address: item.address ?? null,
    latitude: item.latitude,
    longitude: item.longitude,
    href: `/properties/${item.id}`,
  }));

  return <PropertyMap markers={mapMarkers} height="360px" />;
}
