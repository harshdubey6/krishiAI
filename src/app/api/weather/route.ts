import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-utils';
import { getCurrentWeather, getWeatherForecast, getWeatherAlerts, getCropSpecificAdvice, getIrrigationRecommendation, getSprayingRecommendation } from '@/lib/weather';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  // Validate session
  const session = await validateSession();
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location');
    const crop = searchParams.get('crop');

    if (!location) {
      return NextResponse.json({
        status: 'error',
        message: 'Location parameter is required'
      }, { status: 400 });
    }

    // Fetch current weather and forecast
    const [currentWeather, forecast, alerts] = await Promise.all([
      getCurrentWeather(location),
      getWeatherForecast(location, 7),
      getWeatherAlerts(location)
    ]);

    // Get crop-specific advice if crop parameter provided
    const cropAdvice = crop ? getCropSpecificAdvice(currentWeather, crop) : [];
    const irrigationAdvice = getIrrigationRecommendation(currentWeather, forecast);
    const sprayingAdvice = getSprayingRecommendation(currentWeather, forecast);

    return NextResponse.json({
      status: 'success',
      data: {
        current: currentWeather,
        forecast,
        alerts,
        advice: {
          cropSpecific: cropAdvice,
          irrigation: irrigationAdvice,
          spraying: sprayingAdvice
        }
      }
    });
  } catch (error: any) {
    console.error('Weather API error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to fetch weather data'
    }, { status: 500 });
  }
}
