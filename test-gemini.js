import { analyzePlantImage } from './src/lib/gemini';

// A tiny 1x1 green pixel in base64 (for quick testing)
const sampleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testGemini() {
  console.log('Testing Gemini API integration...');
  
  try {
    const result = await analyzePlantImage(
      sampleImage,
      'Test Plant',
      'Green leaves with spots'
    );
    
    console.log('\nGemini Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\nGemini Test Error:', error);
    // Log the full error details to help debug
    if (error instanceof Error) {
      console.error('\nError message:', error.message);
      console.error('\nError stack:', error.stack);
    }
  }
}

// Only run if called directly (node test-gemini.js)
if (require.main === module) {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY environment variable is not set');
    process.exit(1);
  }
  testGemini().catch(console.error);
}