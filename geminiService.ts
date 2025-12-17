
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeDesign = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image.split(',')[1],
            },
          },
          {
            text: "Eres un experto en moda streetwear. Analiza esta imagen que se usará como diseño para una camiseta. Proporciona un nombre creativo para el diseño, una breve descripción de marketing de 2 frases y una sugerencia de estilo (ej. 'combina bien con jeans rotos'). Responde en formato JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        // Recommended way to configure responseSchema for structured JSON output
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: 'Nombre creativo para el diseño.',
            },
            description: {
              type: Type.STRING,
              description: 'Descripción de marketing de 2 frases.',
            },
            suggestion: {
              type: Type.STRING,
              description: 'Sugerencia de estilo.',
            },
          },
          required: ["name", "description", "suggestion"],
        },
      }
    });

    // Directly access the text property as per guidelines
    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      name: "Diseño Personalizado",
      description: "Una pieza única creada por ti.",
      suggestion: "Ideal para cualquier ocasión casual."
    };
  }
};
