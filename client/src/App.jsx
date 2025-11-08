
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Custom marker icon fix for React-Leaflet (because default icon breaks in bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

// GlassCard component for glassmorphism effect
function GlassCard({ children, style }) {
  return (
    <div
      style={{
        background: "rgba(20, 20, 20, 0.7)",
        borderRadius: "1.5rem",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        padding: "2rem",
        color: "#fff",
        margin: "1rem 0",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function App() {
  const [cityName, setCityName] = useState('Vijayapura');
  const [searchInput, setSearchInput] = useState('');
  const [coords, setCoords] = useState({ lat: 16.8302, lon: 75.71 });
  const [airData, setAirData] = useState(null);
  const [trendData, setTrendData] = useState([
    { time: '00:00', pm25: 65, pm10: 95 },
    { time: '04:00', pm25: 72, pm10: 108 },
    { time: '08:00', pm25: 85, pm10: 120 },
    { time: '12:00', pm25: 78, pm10: 112 },
    { time: '16:00', pm25: 90, pm10: 135 },
    { time: '20:00', pm25: 82, pm10: 118 },
  ]);

  // Black glass background
  const mainBg = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    minHeight: '100vh',
    minWidth: '100vw',
    background: 'linear-gradient(135deg, #0f0f0f 0%, #232526 100%)',
    color: '#fff',
    padding: '2rem',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    overflow: 'auto',
    zIndex: 0
  };

  // Search and fetch logic (same as before)
  // Connect to backend endpoints
  const handleSearch = async () => {
    const query = searchInput.trim() || cityName;
    if (!query) return;
    try {
      // Fetch geocode from backend
     const geocodeRes = await fetch(`http://127.0.0.1:5000/api/geocode?city=${encodeURIComponent(query)}`);
      if (!geocodeRes.ok) throw new Error("Could not find city coordinates");
      const geoData = await geocodeRes.json();
      setCityName(geoData.name || query);
      setCoords({ lat: geoData.lat, lon: geoData.lon });

      // Fetch air quality from backend
      const airRes = await fetch(`http://127.0.0.1:5000/api/air-quality?lat=${geoData.lat}&lon=${geoData.lon}`);
      if (!airRes.ok) throw new Error("Could not fetch air quality data");
      const airJson = await airRes.json();
      setAirData(airJson);
      if (Array.isArray(airJson.hourly)) {
        setTrendData(
          airJson.hourly.map((h) => ({
            time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            pm25: h.pm25,
            pm10: h.pm10,
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setAirData(null);
    }
  };
  useEffect(() => { handleSearch(); /* initial fetch */ }, []);

  return (
    <div style={mainBg}>
      <h1 style={{ fontSize: "3.5rem", fontWeight: 700, letterSpacing: "-2px", marginBottom: "2rem", textShadow: "0 2px 24px #000", textAlign: "center", color: "#b3e0ff" }}>
        AirSense Dashboard
      </h1>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Enter city name..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            border: "none",
            background: "rgba(40,40,40,0.8)",
            color: "#fff",
            fontSize: "1.2rem",
            outline: "none",
            boxShadow: "0 2px 8px #0002",
            width: "320px",
            marginRight: "1rem"
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "0.75rem 2rem",
            borderRadius: "1rem",
            border: "none",
            background: "linear-gradient(90deg,#6366f1,#0ea5e9)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1.2rem",
            boxShadow: "0 2px 8px #0002",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
        >
          <span role="img" aria-label="search">🔍</span>
        </button>
      </div>
      <div style={{ textAlign: "center", fontSize: "1.2rem", marginBottom: "1.5rem" }}>
        Showing data for: <span style={{ color: "#60a5fa", fontWeight: 600 }}>{cityName}</span>
      </div>
      {/* Metrics cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontSize: "2.2rem", color: "#ef4444" }}>
              {airData?.aqi ?? 152}
            </span>
            <span style={{ fontSize: "1.1rem", color: "#f87171" }}>
              {airData?.aqi_category ?? "Unhealthy"}
            </span>
            <span style={{ fontWeight: 600, marginTop: "0.5rem" }}>AQI</span>
          </div>
        </GlassCard>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontSize: "2.2rem", color: "#38bdf8" }}>
              {airData?.humidity ? `${airData.humidity}%` : "68%"}
            </span>
            <span style={{ fontSize: "1.1rem", color: "#60a5fa" }}>
              {airData?.humidity_category ?? "Moderate"}
            </span>
            <span style={{ fontWeight: 600, marginTop: "0.5rem" }}>Humidity</span>
          </div>
        </GlassCard>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontSize: "2.2rem", color: "#fbbf24" }}>
              {airData?.visibility ? `${airData.visibility}km` : "4.2km"}
            </span>
            <span style={{ fontSize: "1.1rem", color: "#fbbf24" }}>
              {airData?.visibility_category ?? "Poor"}
            </span>
            <span style={{ fontWeight: 600, marginTop: "0.5rem" }}>Visibility</span>
          </div>
        </GlassCard>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontSize: "2.2rem", color: "#f59e42" }}>
              {airData?.health_index ?? "3.2"}
            </span>
            <span style={{ fontSize: "1.1rem", color: "#f59e42" }}>
              {airData?.health_category ?? "Caution"}
            </span>
            <span style={{ fontWeight: 600, marginTop: "0.5rem" }}>Health Index</span>
          </div>
        </GlassCard>
      </div>
      {/* Map and chart row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <GlassCard>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "1rem" }}>Location Map</h2>
          <div style={{ height: '300px', width: '100%', borderRadius: '1.5rem', overflow: 'hidden' }}>
            <MapContainer
              center={[coords.lat, coords.lon]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={[coords.lat, coords.lon]}>
                <Popup>
                  <strong>{cityName}</strong>
                  <br />
                  Lat: {coords.lat.toFixed(4)}° N, Long: {coords.lon.toFixed(4)}° E
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </GlassCard>
        <GlassCard>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "1rem" }}>24-Hour Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pm25" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pm10" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Area type="monotone" dataKey="pm25" stroke="#60a5fa" fillOpacity={1} fill="url(#pm25)" name="PM2.5" />
              <Area type="monotone" dataKey="pm10" stroke="#34d399" fillOpacity={1} fill="url(#pm10)" name="PM10" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}

export default App;
