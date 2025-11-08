import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Helper function to interpret AQI index
const getAqiInfo = (aqi) => {
  switch (aqi) {
    case 1: return { level: "Good", color: "green" };
    case 2: return { level: "Fair", color: "yellow" };
    case 3: return { level: "Moderate", color: "orange" };
    case 4: return { level: "Poor", color: "red" };
    case 5: return { level: "Very Poor", color: "purple" };
    default: return { level: "Unknown", color: "gray" };
  }
};

const AirQualityMap = ({ data, position }) => {
  // The API response is a list, we take the first item
  const aqiData = data.list[0];
  const { aqi } = aqiData.main;
  const { pm2_5, pm10, no2, o3, co } = aqiData.components;
  
  // Get the human-readable level and color
  const aqiInfo = getAqiInfo(aqi);

  return (
    // This component is styled by the .leaflet-container class
    // we added to our CSS file earlier.
    <MapContainer center={position} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          <h3>
            Air Quality: <span style={{ color: aqiInfo.color }}>{aqiInfo.level}</span> (AQI: {aqi})
          </h3>
          <hr />
          <strong>Pollutants (µg/m³):</strong>
          <ul>
            <li>PM2.5: {pm2_5}</li>
            <li>PM10: {pm10}</li>
            <li>NO₂: {no2}</li>
            <li>O₃: {o3}</li>
            <li>CO: {co}</li>
          </ul>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default AirQualityMap;