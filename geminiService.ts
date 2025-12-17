import { GoogleGenAI, Type } from "@google/genai";

function getClient() {
  const apiKey = (process.env.API_KEY || "").trim();

  // ✅ Sin key: no inicialices Gemini (evita crash en Pages)
  if (!apiKey) return null;

  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Gemini init error:", e);
    return null;
  }
}

export const analyzeDesign = async (base64Image: string) => {
  const ai = getClient();

  // ✅ Si no hay key, responde con fallback (no rompe la app)
  if (!ai) {
    return {
      name: "Diseño Personalizado",
      description: "Una pieza única creada por ti.",
      suggestion: "Ideal para cualquier ocasión casual."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image.split(",")[1],
            },
          },
          {
            text: "Eres un experto en moda streetwear... Responde en formato JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "Nombre creativo para el diseño.",
    },
    description: {
      type: Type.STRING,
      description: "Descripción de marketing de 2 frases.",
    },
    suggestion: {
      type: Type.STRING,
      description: "Sugerencia de estilo.",
    },
  },
  required: ["name", "description", "suggestion"],
},

      },
    });

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
