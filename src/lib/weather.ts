import axios from 'axios';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

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
    if (!WEATHER_API_KEY) {
      throw new Error('Weather API key not configured');
    }

    const response = await axios.get(`${WEATHER_API_URL}/current.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: location,
        aqi: 'no'
      }
    });

    const { current, location: loc } = response.data;

    return {
      location: `${loc.name}, ${loc.region}`,
      temperature: current.temp_c,
      feelsLike: current.feelslike_c,
      humidity: current.humidity,
      condition: current.condition.text,
      windSpeed: current.wind_kph,
      rainfall: current.precip_mm,
      icon: current.condition.icon
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw new Error('Failed to fetch weather data');
  }
}

export async function getWeatherForecast(location: string, days: number = 7): Promise<ForecastDay[]> {
  try {
    if (!WEATHER_API_KEY) {
      throw new Error('Weather API key not configured');
    }

    const response = await axios.get(`${WEATHER_API_URL}/forecast.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: location,
        days: Math.min(days, 14), // API supports up to 14 days
        aqi: 'no',
        alerts: 'no'
      }
    });

    const { forecast } = response.data;

    return forecast.forecastday.map((day: any) => ({
      date: day.date,
      maxTemp: day.day.maxtemp_c,
      minTemp: day.day.mintemp_c,
      condition: day.day.condition.text,
      icon: day.day.condition.icon,
      chanceOfRain: day.day.daily_chance_of_rain,
      humidity: day.day.avghumidity
    }));
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw new Error('Failed to fetch weather forecast');
  }
}

export async function getWeatherAlerts(location: string): Promise<WeatherAlert[]> {
  try {
    if (!WEATHER_API_KEY) {
      throw new Error('Weather API key not configured');
    }

    const response = await axios.get(`${WEATHER_API_URL}/forecast.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: location,
        days: 1,
        aqi: 'no',
        alerts: 'yes'
      }
    });

    const { alerts } = response.data;

    if (!alerts || !alerts.alert || alerts.alert.length === 0) {
      return [];
    }

    return alerts.alert.map((alert: any) => ({
      type: alert.category || 'General',
      severity: alert.severity || 'Moderate',
      headline: alert.headline,
      description: alert.desc,
      event: alert.event
    }));
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    return [];
  }
}

export function getCropSpecificAdvice(weather: WeatherData, crop: string): string[] {
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
