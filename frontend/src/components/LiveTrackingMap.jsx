import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const restaurantIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const volunteerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const ngoIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function LiveTrackingMap({ restaurantCoords, volunteerCoords, ngoCoords, historyPoints = [] }) {
  const center = volunteerCoords || restaurantCoords || { lat: 19.076, lng: 72.8777 };

  const polylineCoords = historyPoints.map((p) => [p.lat, p.lng]);

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative z-0">
      <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Restaurant Marker */}
        {restaurantCoords && (
          <Marker position={[restaurantCoords.lat, restaurantCoords.lng]} icon={restaurantIcon}>
            <Popup>
              <strong>🏬 Restaurant Pickup Location</strong>
            </Popup>
          </Marker>
        )}

        {/* Volunteer GPS Marker */}
        {volunteerCoords && (
          <Marker position={[volunteerCoords.lat, volunteerCoords.lng]} icon={volunteerIcon}>
            <Popup>
              <strong>🛵 Live Volunteer Position</strong>
            </Popup>
          </Marker>
        )}

        {/* NGO Dropoff Marker */}
        {ngoCoords && (
          <Marker position={[ngoCoords.lat, ngoCoords.lng]} icon={ngoIcon}>
            <Popup>
              <strong>🏢 NGO Distribution Point</strong>
            </Popup>
          </Marker>
        )}

        {/* GPS Movement Track */}
        {polylineCoords.length > 1 && <Polyline positions={polylineCoords} color="#22c55e" weight={4} dashArray="5, 10" />}
      </MapContainer>
    </div>
  );
}
