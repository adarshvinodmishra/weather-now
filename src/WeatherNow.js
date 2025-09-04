import React, { useState } from "react";

export default function WeatherNow() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      // 1) City -> lat/lon
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }
      const { latitude, longitude, name, country } = geoData.results[0];

      // 2) Current weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
      );
      const weatherData = await weatherRes.json();

      setWeather({
        city: name,
        country,
        temperature: weatherData.current_weather.temperature,
        windspeed: weatherData.current_weather.windspeed,
        weathercode: weatherData.current_weather.weathercode,
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <h1>🌤️ Weather Now</h1>

      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button onClick={fetchWeather} style={{ padding: "8px 12px" }}>
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {weather && (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16, maxWidth: 320 }}>
          <h2>
            {weather.city}, {weather.country}
          </h2>
          <p style={{ fontSize: 32, margin: "8px 0" }}>{weather.temperature}°C</p>
          <p>💨 {weather.windspeed} km/h wind</p>
          <p>Code: {weather.weathercode}</p>
        </div>
      )}
    </div>
  );
}
