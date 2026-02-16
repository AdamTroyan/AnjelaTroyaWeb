"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      טוען מפה...
    </div>
  ),
});

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
