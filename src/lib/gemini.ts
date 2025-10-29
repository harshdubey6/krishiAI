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
    
    const prompt = `Analyze this plant image. Plant type: ${plantType}. Symptoms described: ${symptoms}.
    
    Respond with a JSON object containing:
    {
      "diagnosis": "Brief diagnosis of the problem",
      "causes": ["List of potential causes"],
      "treatment": ["List of treatment steps"],
      "prevention": ["List of preventive measures"]
    }
    
    IMPORTANT: Ensure the response is valid JSON. Do not include any text outside the JSON object.`;

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
      
      // Ensure the response has the expected structure
      const structured = {
        diagnosis: typeof parsed.diagnosis === 'string' ? parsed.diagnosis : 'No diagnosis provided',
        causes: Array.isArray(parsed.causes) ? parsed.causes : [parsed.causes].filter(Boolean),
        treatment: Array.isArray(parsed.treatment) ? parsed.treatment : [parsed.treatment].filter(Boolean),
        prevention: Array.isArray(parsed.prevention) ? parsed.prevention : [parsed.prevention].filter(Boolean)
      };

      return structured;
    } catch (err) {
      console.error('Failed to parse Gemini analyze response as JSON. Raw response:', text);
      // If we can't parse as JSON, create a structured response from the text
      return {
        diagnosis: text.split('\n')[0] || 'Failed to parse diagnosis',
        causes: [text.match(/causes?:?\s*(.*)/i)?.[1] || 'Unknown cause'],
        treatment: [text.match(/treatment:?\s*(.*)/i)?.[1] || 'See diagnosis for details'],
        prevention: [text.match(/prevent(?:ion)?:?\s*(.*)/i)?.[1] || 'No prevention steps provided']
      };
    }
  } catch (error) {
    console.error('Error analyzing plant image:', error);
    throw error;
  }
}

export async function chatWithGemini(history: any[], newMessage: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: msg.content,
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