import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv('OPENWEATHER_API_KEY')

# We now need 3 different API endpoints
GEO_BASE_URL = "http://api.openweathermap.org/geo/1.0/direct"
WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
AQI_BASE_URL = "https://api.openweathermap.org/data/2.5/air_pollution"
AQI_FORECAST_URL = "https://api.openweathermap.org/data/2.5/air_pollution/forecast"

# --- Helper functions to categorize the data ---
def get_aqi_category(aqi_val):
    if aqi_val == 1: return "Good"
    if aqi_val == 2: return "Fair"
    if aqi_val == 3: return "Moderate"
    if aqi_val == 4: return "Poor"
    if aqi_val == 5: return "Very Poor"
    return "Unknown"

def get_health_category(aqi_val):
    if aqi_val == 1: return "Excellent"
    if aqi_val == 2: return "Fine"
    if aqi_val == 3: return "Caution"
    if aqi_val == 4: return "High Risk"
    if aqi_val == 5: return "Hazardous"
    return "Unknown"

def get_humidity_category(humidity):
    if humidity < 30: return "Low"
    if humidity <= 60: return "Moderate"
    return "High"

def get_visibility_category(visibility_meters):
    if visibility_meters < 1000: return "Very Poor"
    if visibility_meters <= 5000: return "Poor"
    if visibility_meters <= 10000: return "Moderate"
    return "Good"
# -----------------------------------------------

# This endpoint is unchanged and works as before
@app.route("/api/geocode")
def get_geocode():
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City name is required"}), 400
    if not API_KEY:
        return jsonify({"error": "API key is missing"}), 500
        
    try:
        url = f"{GEO_BASE_URL}?q={city}&limit=1&appid={API_KEY}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if not data:
            return jsonify({"error": "City not found"}), 404
        
        location = data[0]
        return jsonify({
            "lat": location['lat'],
            "lon": location['lon'],
            "name": location['name']
        })
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

# This is the NEW endpoint to match your frontend
@app.route("/api/air-quality")
def get_air_quality():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({"error": "Latitude and longitude are required"}), 400
    if not API_KEY:
        return jsonify({"error": "API key is missing"}), 500

    try:
        # 1. Get Current Weather (for Humidity and Visibility)
        weather_url = f"{WEATHER_BASE_URL}?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        weather_res = requests.get(weather_url)
        weather_res.raise_for_status()
        weather_data = weather_res.json()

        # 2. Get Current Air Pollution (for AQI)
        aqi_url = f"{AQI_BASE_URL}?lat={lat}&lon={lon}&appid={API_KEY}"
        aqi_res = requests.get(aqi_url)
        aqi_res.raise_for_status()
        aqi_data = aqi_res.json()

        # 3. Get Air Pollution Forecast (for the hourly trend chart)
        forecast_url = f"{AQI_FORECAST_URL}?lat={lat}&lon={lon}&appid={API_KEY}"
        forecast_res = requests.get(forecast_url)
        forecast_res.raise_for_status()
        forecast_data = forecast_res.json()

        # --- Process and combine all the data ---
        
        # Get core data points
        current_aqi_val = aqi_data['list'][0]['main']['aqi']
        current_humidity = weather_data['main']['humidity']
        current_visibility_meters = weather_data['visibility']
        visibility_km = round(current_visibility_meters / 1000, 1) # Convert to km

        # Format the hourly data for the chart
        hourly_trends = []
        for item in forecast_data['list']:
            hourly_trends.append({
                "timestamp": item['dt'],
                "time": f"{item['dt']}", # Frontend can format this
                "pm25": item['components']['pm2_5'],
                "pm10": item['components']['pm10']
            })

        # Build the final JSON response
        combined_data = {
            "aqi": current_aqi_val,
            "aqi_category": get_aqi_category(current_aqi_val),
            
            "humidity": current_humidity,
            "humidity_category": get_humidity_category(current_humidity),
            
            "visibility": visibility_km,
            "visibility_category": get_visibility_category(current_visibility_meters),
            
            # Create a simple 1-5 health index (5 is best)
            "health_index": 6 - current_aqi_val, 
            "health_category": get_health_category(current_aqi_val),
            
            # Pass the raw components for the chart
            "components": aqi_data['list'][0]['components'],
            
            # Pass the hourly forecast
            "hourly": hourly_trends
        }

        return jsonify(combined_data)

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return jsonify({"error": f"Failed to fetch data from OpenWeather: {e}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)