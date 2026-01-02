import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzePlantImage(imageBase64: string, plantType: string, symptoms: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Remove data:image/jpeg;base64, prefix if present
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const prompt = `You are an expert agricultural scientist analyzing crop health issues for farmers.
    
    Analyze this crop image. Crop type: ${plantType}. Symptoms described: ${symptoms}.
    
    Respond with a JSON object containing:
    {
      "diagnosis": "Clear diagnosis of the crop problem in simple farmer-friendly language",
      "severity": "mild/moderate/severe - assess the severity level",
      "confidence": 85.5 (your confidence score 0-100),
      "causes": ["List 2-4 potential causes"],
      "treatment": ["List 3-5 practical treatment steps with specific products/methods"],
      "prevention": ["List 2-4 preventive measures for future"],
      "estimatedCost": 500 (estimated treatment cost in INR, or null if unknown)
    }
    
    IMPORTANT: 
    - Use simple, farmer-friendly language
    - Be specific about products and dosages
    - Provide actionable advice
    - Ensure valid JSON format
    - Do not include any text outside the JSON object`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = await response.text();

    // Try to extract JSON from the response if it contains extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let jsonStr = jsonMatch ? jsonMatch[0] : text;

    // Clean up common formatting issues
    jsonStr = jsonStr.replace(/\\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

    try {
      const parsed = JSON.parse(jsonStr);
      
      // Ensure the response has the expected structure with new fields
      const structured = {
        diagnosis: typeof parsed.diagnosis === 'string' ? parsed.diagnosis : 'No diagnosis provided',
        severity: parsed.severity || 'moderate',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 75,
        causes: Array.isArray(parsed.causes) ? parsed.causes : [parsed.causes].filter(Boolean),
        treatment: Array.isArray(parsed.treatment) ? parsed.treatment : [parsed.treatment].filter(Boolean),
        prevention: Array.isArray(parsed.prevention) ? parsed.prevention : [parsed.prevention].filter(Boolean),
        estimatedCost: parsed.estimatedCost || null
      };

      return structured;
    } catch {
      console.error('Failed to parse Gemini analyze response as JSON. Raw response:', text);
      // If we can't parse as JSON, create a structured response from the text
      return {
        diagnosis: text.split('\n')[0] || 'Failed to parse diagnosis',
        severity: 'moderate',
        confidence: 60,
        causes: [text.match(/causes?:?\s*(.*)/i)?.[1] || 'Unknown cause'],
        treatment: [text.match(/treatment:?\s*(.*)/i)?.[1] || 'See diagnosis for details'],
        prevention: [text.match(/prevent(?:ion)?:?\s*(.*)/i)?.[1] || 'No prevention steps provided'],
        estimatedCost: null
      };
    }
  } catch (error) {
    console.error('Error analyzing plant image:', error);
    throw error;
  }
}

export async function chatWithGemini(history: Array<{role: string; content: string}>, newMessage: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

  const result = await chat.sendMessage(newMessage);
  const response = await result.response;
  const text = await response.text();
  return text;
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
}