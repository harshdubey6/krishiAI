import { GoogleGenerativeAI } from '@google/generative-ai';

function getGeminiApiKeys(): string[] {
  const primary = process.env.GEMINI_API_KEY?.trim();
  const multiple = (process.env.GEMINI_API_KEYS || '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);

  if (primary && !multiple.includes(primary)) {
    return [primary, ...multiple];
  }

  return multiple;
}

function isRetryableGeminiError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes('429') ||
    message.includes('quota') ||
    message.includes('too many requests') ||
    message.includes('rate limit')
  );
}

async function withGeminiModel<T>(
  work: (model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>) => Promise<T>
): Promise<T> {
  const keys = getGeminiApiKeys();

  if (keys.length === 0) {
    throw new Error('Set GEMINI_API_KEY or GEMINI_API_KEYS in environment variables');
  }

  let lastError: unknown;

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    try {
      return await work(model);
    } catch (error) {
      lastError = error;
      const shouldRetry = isRetryableGeminiError(error);
      const hasNextKey = index < keys.length - 1;

      if (shouldRetry && hasNextKey) {
        console.warn(`Gemini key ${index + 1} hit quota/rate limit. Trying next key.`);
        continue;
      }

      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini request failed');
}

export interface CropDetailsSuggestion {
  cropType: string;
  symptoms: string;
}

function resolveLanguageInstruction(language: string) {
  if (language === 'hi') {
    return {
      name: 'Hindi',
      scriptInstruction: 'Use natural Hindi in Devanagari script.',
    };
  }

  if (language === 'mr') {
    return {
      name: 'Marathi',
      scriptInstruction: 'Use natural Marathi in Devanagari script.',
    };
  }

  return {
    name: 'English',
    scriptInstruction: 'Use clear natural English.',
  };
}

export async function analyzePlantImage(imageBase64: string, plantType: string, symptoms: string, language = 'en') {
  try {
    
    // Remove data:image/jpeg;base64, prefix if present
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const { name, scriptInstruction } = resolveLanguageInstruction(language);
    
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
    - Respond strictly in ${name}
    - ${scriptInstruction}
    - Ensure valid JSON format
    - Do not include any text outside the JSON object`;

    const result = await withGeminiModel((model) =>
      model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
          }
        }
      ])
    );

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

export async function chatWithGemini(
  history: Array<{role: string; content: string}>,
  newMessage: string,
  language = 'en',
  diagnosisContext?: string
) {
  try {
    const { name, scriptInstruction } = resolveLanguageInstruction(language);
    
    const result = await withGeminiModel(async (model) => {
      const chat = model.startChat({
        history: history.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      });

      return chat.sendMessage(`You are a crop-diagnosis follow-up assistant.
Respond only in ${name}. ${scriptInstruction}

Always answer in the context of this diagnosis report:
${diagnosisContext || 'No diagnosis context provided.'}

Rules:
- Give concise, practical farmer guidance.
- If user asks summary, summarize the diagnosis context above.
- If user asks unclear question, ask one short clarifying question.

User message:
${newMessage}`
      );
    });

  const response = await result.response;
  const text = await response.text();
  return text;
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
}

export async function suggestCropDetailsFromImage(imageBase64: string, language = 'en'): Promise<CropDetailsSuggestion> {
  try {
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const { name, scriptInstruction } = resolveLanguageInstruction(language);

    const prompt = `You are an expert agricultural assistant.

Analyze this crop image and return ONLY valid JSON in this exact format:
{
  "cropType": "short crop name in 1-3 words",
  "symptoms": "clear farmer-friendly symptom description in 1-2 sentences"
}

Rules:
- Do not add markdown or any text outside JSON.
- If crop is uncertain, provide the most likely crop type.
- Symptoms should describe visible signs only.
- Write both cropType and symptoms in ${name}.
- ${scriptInstruction}`;

    const result = await withGeminiModel((model) =>
      model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
      ])
    );

    const response = await result.response;
    const text = await response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = (jsonMatch ? jsonMatch[0] : text).trim();

    try {
      const parsed = JSON.parse(jsonString);
      return {
        cropType: String(parsed.cropType || 'Unknown crop').trim(),
        symptoms: String(parsed.symptoms || 'Visible leaf damage detected.').trim(),
      };
    } catch {
      return {
        cropType: 'Unknown crop',
        symptoms: text.slice(0, 200).trim() || 'Visible crop stress symptoms detected.',
      };
    }
  } catch (error) {
    console.error('Error suggesting crop details:', error);
    throw error;
  }
}