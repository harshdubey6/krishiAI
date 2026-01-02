// Market price utilities for agricultural commodities
// Integrated with AGMARKNET API (data.gov.in)

export interface CropPrice {
  cropName: string;
  state: string;
  district: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  date: string;
}

export interface PriceTrend {
  date: string;
  price: number;
}

// AGMARKNET API Configuration
// API Documentation: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
const AGMARKNET_API_KEY = process.env.AGMARKNET_API_KEY || 'YOUR_API_KEY_HERE';
const AGMARKNET_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

// Data.gov.in API for Agricultural Commodity Prices
async function fetchAGMARKNETData(params: {
  commodity?: string;
  state?: string;
  district?: string;
  market?: string;
}): Promise<CropPrice[]> {
  try {
    const queryParams = new URLSearchParams({
      'api-key': AGMARKNET_API_KEY,
      format: 'json',
      limit: '100',
      ...(params.commodity && { 'filters[commodity]': params.commodity }),
      ...(params.state && { 'filters[state]': params.state }),
      ...(params.district && { 'filters[district]': params.district }),
      ...(params.market && { 'filters[market]': params.market })
    });

    const response = await fetch(`${AGMARKNET_BASE_URL}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Ensure fresh data
    });

    if (!response.ok) {
      console.error('AGMARKNET API Error:', response.statusText);
      return getFallbackMockData();
    }

    const data = await response.json();
    
    // Transform API response to CropPrice format
    return data.records?.map((record: any) => ({
      cropName: record.commodity || record.Commodity || 'Unknown',
      state: record.state || record.State || 'Unknown',
      district: record.district || record.District || 'Unknown',
      market: record.market || record.Market || 'Unknown',
      minPrice: parseFloat(record.min_price || record.Min_Price || 0),
      maxPrice: parseFloat(record.max_price || record.Max_Price || 0),
      modalPrice: parseFloat(record.modal_price || record.Modal_Price || 0),
      unit: record.unit || 'Quintal',
      date: record.arrival_date || record.Arrival_Date || new Date().toISOString().split('T')[0]
    })) || getFallbackMockData();

  } catch (error) {
    console.error('Error fetching AGMARKNET data:', error);
    return getFallbackMockData();
  }
}

// Fallback Mock data when API is unavailable or for development
function getFallbackMockData(): CropPrice[] {
  return [
    {
      cropName: 'Wheat',
      state: 'Punjab',
      district: 'Ludhiana',
      market: 'Ludhiana Mandi',
      minPrice: 2000,
      maxPrice: 2150,
      modalPrice: 2080,
      unit: 'Quintal',
      date: new Date().toISOString().split('T')[0]
    },
    {
      cropName: 'Rice',
      state: 'Punjab',
      district: 'Amritsar',
      market: 'Amritsar Mandi',
      minPrice: 2800,
      maxPrice: 3100,
      modalPrice: 2950,
      unit: 'Quintal',
      date: new Date().toISOString().split('T')[0]
    },
    {
      cropName: 'Cotton',
      state: 'Gujarat',
      district: 'Ahmedabad',
      market: 'Ahmedabad APMC',
      minPrice: 6500,
      maxPrice: 7200,
      modalPrice: 6850,
      unit: 'Quintal',
      date: new Date().toISOString().split('T')[0]
    },
    {
      cropName: 'Sugarcane',
      state: 'Uttar Pradesh',
      district: 'Muzaffarnagar',
      market: 'Muzaffarnagar Mandi',
      minPrice: 280,
      maxPrice: 320,
      modalPrice: 300,
      unit: 'Quintal',
      date: new Date().toISOString().split('T')[0]
    },
    {
      cropName: 'Tomato',
      state: 'Maharashtra',
      district: 'Pune',
      market: 'Pune Market',
      minPrice: 800,
      maxPrice: 1200,
      modalPrice: 1000,
      unit: 'Quintal',
      date: new Date().toISOString().split('T')[0]
    },
    {
      cropName: 'Potato',
      state: 'Uttar Pradesh',
      district: 'Agra',
      market: 'Agra Mandi',
      minPrice: 600,
      maxPrice: 850,
      modalPrice: 720,
      unit: 'Quintal',
      date: new Date().toISOString().split('T')[0]
    },
    {
      cropName: 'Onion',
      state: 'Maharashtra',
      district: 'Nashik',
      market: 'Nashik APMC',
      minPrice: 1200,
      maxPrice: 1600,
      modalPrice: 1400,
      unit: 'Quintal',
      date: new Date().toISOString().split('T')[0]
    },
    {
      cropName: 'Maize',
      state: 'Karnataka',
      district: 'Bangalore',
      market: 'Bangalore Market',
      minPrice: 1600,
      maxPrice: 1850,
      modalPrice: 1720,
      unit: 'Quintal',
      date: new Date().toISOString().split('T')[0]
    }
  ];
}

export async function getMarketPrices(cropName?: string, state?: string): Promise<CropPrice[]> {
  // Try to fetch from AGMARKNET API
  const apiData = await fetchAGMARKNETData({
    commodity: cropName,
    state: state
  });
  
  // Filter results if needed
  let prices = apiData;
  
  if (cropName && prices.length > 0) {
    prices = prices.filter(p => 
      p.cropName.toLowerCase().includes(cropName.toLowerCase())
    );
  }
  
  if (state && prices.length > 0) {
    prices = prices.filter(p => 
      p.state.toLowerCase().includes(state.toLowerCase())
    );
  }
  
  // If no results, return fallback data
  return prices.length > 0 ? prices : getFallbackMockData();
}

export async function getPriceTrends(cropName: string, state: string, days: number = 30): Promise<PriceTrend[]> {
  // In production, fetch historical data from AGMARKNET API
  // For now, generate simulated trends based on current prices
  
  const currentPrices = await getMarketPrices(cropName, state);
  if (currentPrices.length === 0) return [];
  
  const basePrice = currentPrices[0].modalPrice;
  const trends: PriceTrend[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate price variation (±10%)
    const variation = (Math.random() - 0.5) * 0.2;
    const price = Math.round(basePrice * (1 + variation));
    
    trends.push({
      date: date.toISOString().split('T')[0],
      price: price
    });
  }
  
  return trends;
}

export async function calculateProfitEstimate(
  cropName: string,
  quantity: number, // in quintals
  cultivationCost: number
): Promise<{
  estimatedRevenue: number;
  profit: number;
  profitMargin: number;
}> {
  const prices = await getMarketPrices(cropName);
  const pricePerQuintal = prices.length > 0 ? prices[0].modalPrice : 2000;
  
  const estimatedRevenue = quantity * pricePerQuintal;
  const profit = estimatedRevenue - cultivationCost;
  const profitMargin = (profit / cultivationCost) * 100;
  
  return {
    estimatedRevenue,
    profit,
    profitMargin: Math.round(profitMargin * 100) / 100
  };
}

export async function getCropRecommendations(state: string): Promise<{
  crop: string;
  reason: string;
  expectedPrice: number;
}[]> {
  // Recommend crops based on current market prices
  const statePrices = await getMarketPrices(undefined, state);
  
  return statePrices
    .sort((a, b) => b.modalPrice - a.modalPrice)
    .slice(0, 3)
    .map(price => ({
      crop: price.cropName,
      reason: `High demand with good prices at ₹${price.modalPrice}/${price.unit}`,
      expectedPrice: price.modalPrice
    }));
}

export const POPULAR_CROPS = [
  'Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane',
  'Soybean', 'Groundnut', 'Tomato', 'Potato', 'Onion',
  'Chilli', 'Turmeric', 'Coriander', 'Banana', 'Mango'
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function getPriceChange(current: number, previous: number): {
  change: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
} {
  const change = current - previous;
  const percentage = (change / previous) * 100;
  
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(percentage) > 1) {
    direction = change > 0 ? 'up' : 'down';
  }
  
  return {
    change: Math.round(change),
    percentage: Math.round(percentage * 100) / 100,
    direction
  };
}
