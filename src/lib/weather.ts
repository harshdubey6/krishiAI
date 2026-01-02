import axios from 'axios';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHER_GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  rainfall: number;
  icon: string;
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: string;
  chanceOfRain: number;
  humidity: number;
}

export interface WeatherAlert {
  type: string;
  severity: string;
  headline: string;
  description: string;
  event: string;
}

export async function getCurrentWeather(location: string): Promise<WeatherData> {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    // Get coordinates from location name
    const geoResponse = await axios.get(`${OPENWEATHER_GEO_URL}/direct`, {
      params: {
        q: location,
        limit: 1,
        appid: OPENWEATHER_API_KEY
      }
    });

    if (!geoResponse.data || geoResponse.data.length === 0) {
      throw new Error('Location not found');
    }

    const { lat, lon, name, state, country } = geoResponse.data[0];

    // Get current weather using coordinates
    const weatherResponse = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const { main, weather, wind, rain } = weatherResponse.data;

    const locationName = state 
      ? `${name}, ${state}, ${country}`
      : `${name}, ${country}`;

    return {
      location: locationName,
      temperature: Math.round(main.temp),
      feelsLike: Math.round(main.feels_like),
      humidity: main.humidity,
      condition: weather[0].description,
      windSpeed: Math.round(wind.speed * 3.6), // Convert m/s to km/h
      rainfall: rain?.['1h'] || 0,
      icon: `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw new Error('Failed to fetch weather data');
  }
}

export async function getWeatherForecast(location: string, days: number = 7): Promise<ForecastDay[]> {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    // Get coordinates from location name
    const geoResponse = await axios.get(`${OPENWEATHER_GEO_URL}/direct`, {
      params: {
        q: location,
        limit: 1,
        appid: OPENWEATHER_API_KEY
      }
    });

    if (!geoResponse.data || geoResponse.data.length === 0) {
      throw new Error('Location not found');
    }

    const { lat, lon } = geoResponse.data[0];

    // Get 5-day forecast (OpenWeather free tier limitation)
    const forecastResponse = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',
        cnt: 40 // 5 days * 8 (3-hour intervals)
      }
    });

    // Group forecasts by day
    const dailyForecasts = new Map<string, {temps: number[]; conditions: string[]; icons: string[]; humidity: number[]; rain: number}>();
    
    forecastResponse.data.list.forEach((item: {dt_txt: string; main: {temp_max: number; temp_min: number; humidity: number}; weather: Array<{description: string; icon: string}>; pop: number; rain?: {'3h': number}}) => {
      const date = item.dt_txt.split(' ')[0];
      
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, { temps: [], conditions: [], icons: [], humidity: [], rain: 0 });
      }
      
      const dayData = dailyForecasts.get(date)!;
      dayData.temps.push(item.main.temp_max, item.main.temp_min);
      dayData.conditions.push(item.weather[0].description);
      dayData.icons.push(item.weather[0].icon);
      dayData.humidity.push(item.main.humidity);
      dayData.rain = Math.max(dayData.rain, item.pop * 100); // Probability of precipitation
    });

    // Convert to ForecastDay array
    const forecast: ForecastDay[] = [];
    dailyForecasts.forEach((data, date) => {
      forecast.push({
        date,
        maxTemp: Math.round(Math.max(...data.temps)),
        minTemp: Math.round(Math.min(...data.temps)),
        condition: data.conditions[Math.floor(data.conditions.length / 2)], // Take middle condition
        icon: `https://openweathermap.org/img/wn/${data.icons[Math.floor(data.icons.length / 2)]}@2x.png`,
        chanceOfRain: Math.round(data.rain),
        humidity: Math.round(data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length)
      });
    });

    return forecast.slice(0, Math.min(days, 5)); // OpenWeather free tier supports 5 days
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw new Error('Failed to fetch weather forecast');
  }
}

export async function getWeatherAlerts(location: string): Promise<WeatherAlert[]> {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    // Get coordinates from location name
    const geoResponse = await axios.get(`${OPENWEATHER_GEO_URL}/direct`, {
      params: {
        q: location,
        limit: 1,
        appid: OPENWEATHER_API_KEY
      }
    });

    if (!geoResponse.data || geoResponse.data.length === 0) {
      return [];
    }

    const { lat, lon } = geoResponse.data[0];

    // Note: Weather alerts require One Call API 3.0 (paid plan)
    // For free tier, we'll check for extreme conditions from current weather
    const weatherResponse = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const alerts: WeatherAlert[] = [];
    const { main, weather, wind } = weatherResponse.data;

    // Create alerts based on extreme conditions
    if (main.temp > 40) {
      alerts.push({
        type: 'Heat',
        severity: 'High',
        headline: 'Extreme Heat Alert',
        description: `Temperature is ${Math.round(main.temp)}°C. Take precautions against heat stress for crops and workers.`,
        event: 'Extreme Temperature'
      });
    }

    if (main.temp < 5) {
      alerts.push({
        type: 'Cold',
        severity: 'High',
        headline: 'Cold Weather Alert',
        description: `Temperature is ${Math.round(main.temp)}°C. Protect sensitive crops from frost damage.`,
        event: 'Cold Temperature'
      });
    }

    if (wind.speed > 10) { // 10 m/s = 36 km/h
      alerts.push({
        type: 'Wind',
        severity: 'Moderate',
        headline: 'Strong Wind Alert',
        description: `Wind speed is ${Math.round(wind.speed * 3.6)} km/h. Avoid spraying operations and provide support to tall crops.`,
        event: 'Strong Winds'
      });
    }

    if (weather[0].main === 'Thunderstorm') {
      alerts.push({
        type: 'Storm',
        severity: 'High',
        headline: 'Thunderstorm Alert',
        description: 'Thunderstorm conditions detected. Avoid field operations and ensure safety.',
        event: 'Thunderstorm'
      });
    }

    return alerts;
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    return [];
  }
}

export function getCropSpecificAdvice(weather: WeatherData): string[] {
  const advice: string[] = [];

  // Temperature-based advice
  if (weather.temperature > 35) {
    advice.push('🌡️ High temperature alert: Increase irrigation frequency');
    advice.push('Avoid spraying pesticides during hot hours (10 AM - 4 PM)');
  } else if (weather.temperature < 10) {
    advice.push('❄️ Cold weather: Protect sensitive crops from frost');
  }

  // Humidity-based advice
  if (weather.humidity > 80) {
    advice.push('💧 High humidity: Watch for fungal diseases');
    advice.push('Ensure proper ventilation for crops');
  } else if (weather.humidity < 40) {
    advice.push('🏜️ Low humidity: Increase watering and use mulching');
  }

  // Rain-based advice
  if (weather.rainfall > 10) {
    advice.push('🌧️ Heavy rainfall: Check for waterlogging');
    advice.push('Avoid fertilizer application during rain');
  } else if (weather.rainfall > 0) {
    advice.push('🌦️ Light rain expected: Good time for sowing operations');
  }

  // Wind-based advice
  if (weather.windSpeed > 20) {
    advice.push('💨 Strong winds: Provide support to tall crops');
    advice.push('Avoid spraying operations due to wind');
  }

  return advice;
}

export function getIrrigationRecommendation(weather: WeatherData, forecast: ForecastDay[]): string {
  const upcomingRain = forecast.slice(0, 3).some(day => day.chanceOfRain > 50);
  
  if (upcomingRain) {
    return 'Rain expected in next 3 days. You can skip irrigation today.';
  }
  
  if (weather.temperature > 30 && weather.humidity < 50) {
    return 'Hot and dry weather. Irrigate crops today.';
  }
  
  if (weather.temperature > 35) {
    return 'Very hot weather. Increase irrigation frequency.';
  }
  
  return 'Normal irrigation schedule recommended.';
}

export function getSprayingRecommendation(weather: WeatherData, forecast: ForecastDay[]): string {
  const todayRain = weather.rainfall > 5;
  const upcomingRain = forecast[0]?.chanceOfRain > 60;
  
  if (todayRain || upcomingRain) {
    return '❌ Not recommended: Rain expected. Wait for dry weather.';
  }
  
  if (weather.windSpeed > 15) {
    return '❌ Not recommended: Wind speed too high for effective spraying.';
  }
  
  if (weather.temperature > 30) {
    return '⏰ Spray early morning (6-8 AM) or evening (5-7 PM) to avoid heat.';
  }
  
  return '✅ Good conditions for spraying operations.';
}
