import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateOfferLetter = async (candidateName: string, jobRole: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a professional, encouraging offer letter for a candidate named ${candidateName} for the position of ${jobRole} at "VocalWork Agency". 
      The tone should be professional but modern. 
      Include placeholders for start date and salary, but keep it brief (under 200 words). 
      Format it in Markdown.`,
    });
    return response.text || "Error generating offer letter.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate offer letter at this time. Please try again.";
  }
};

export const generateScript = async (topic: string): Promise<{ description: string, script: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a voice-over task based on this topic: "${topic}".
      Return a JSON object with two fields:
      1. "description": A brief instruction for the voice actor (tone, speed).
      2. "script": The actual text they need to read (approx 30-50 words).
      Ensure the output is valid JSON.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      description: "Read the following text clearly.",
      script: "This is a placeholder script because the AI generation failed."
    };
  }
};
