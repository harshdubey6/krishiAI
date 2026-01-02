import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-utils';
import { getMarketPrices, getPriceTrends, calculateProfitEstimate, getCropRecommendations, POPULAR_CROPS } from '@/lib/market-prices';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Validate session
  const session = await validateSession();
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'list';
    const cropName = searchParams.get('crop');
    const state = searchParams.get('state');

    switch (action) {
      case 'list':
        const prices = await getMarketPrices(cropName || undefined, state || undefined);
        return NextResponse.json({
          status: 'success',
          data: prices
        });

      case 'trends':
        if (!cropName || !state) {
          return NextResponse.json({
            status: 'error',
            message: 'Crop name and state are required for trends'
          }, { status: 400 });
        }
        const trends = await getPriceTrends(cropName, state, 30);
        return NextResponse.json({
          status: 'success',
          data: trends
        });

      case 'calculate':
        const quantity = parseFloat(searchParams.get('quantity') || '0');
        const cost = parseFloat(searchParams.get('cost') || '0');
        
        if (!cropName || !quantity || !cost) {
          return NextResponse.json({
            status: 'error',
            message: 'Crop name, quantity, and cost are required for calculation'
          }, { status: 400 });
        }

        const profitEstimate = await calculateProfitEstimate(cropName, quantity, cost);
        return NextResponse.json({
          status: 'success',
          data: profitEstimate
        });

      case 'recommendations':
        if (!state) {
          return NextResponse.json({
            status: 'error',
            message: 'State is required for recommendations'
          }, { status: 400 });
        }
        const recommendations = await getCropRecommendations(state);
        return NextResponse.json({
          status: 'success',
          data: recommendations
        });

      case 'popular':
        return NextResponse.json({
          status: 'success',
          data: POPULAR_CROPS
        });

      default:
        return NextResponse.json({
          status: 'error',
          message: 'Invalid action parameter'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Market prices API error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to fetch market data'
    }, { status: 500 });
  }
}
