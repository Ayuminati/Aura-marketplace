import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export const geminiService = {
  async generateProductDescription(productName: string, category: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Write a compelling product description for ${productName} in ${category}`
      });
      return response.text ?? "AI failed.";
    } catch (err) {
      console.error(err);
      return "AI error";
    }
  },

  async getShoppingAssistantResponse(query: string, products: string[]) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `User asks: "${query}". Products: ${products.join(", ")}`
      });
      return response.text ?? "No response";
    } catch (err) {
      console.error(err);
      return "Assistant offline";
    }
  }
};
