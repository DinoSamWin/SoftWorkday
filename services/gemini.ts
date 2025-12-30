
import { GoogleGenAI } from "@google/genai";
import { Mood, TimeOfDay } from "../types";

const SYSTEM_INSTRUCTION = `
You are an emotionally intelligent, supportive companion for office workers in Western professional environments.
Your goal is to provide a short, grounding message based on the user's current time of day and mood.

Strict Constraints:
- Length: 1 to 3 short, impactful sentences.
- Tone: Natural, supportive, realistic, and human. 
- Avoid: Clichés ("You got this"), hustle culture ("Crush it", "Grind"), famous quotes, and overly poetic language.
- Context Sensitivity:
  - Morning: Focus on building a steady baseline and a realistic pace.
  - Midday: Focus on re-centering, handling noise, and avoiding the mid-afternoon slump without being preachy.
  - End of Day: Focus on leaving work at the desk, transitioning to personal time, and shedding the day's stress.
- Uniqueness: Use varied sentence structures. Do not start with generic openings. 
- Goal: Help the user feel seen and supported without the "toxic positivity" of standard corporate motivation.
`;

export const generateContextualMessage = async (
  mood: Mood, 
  timeOfDay: TimeOfDay, 
  context?: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Current State: ${mood}
      Time of Day: ${timeOfDay}
      User's specific thought: "${context || 'Starting/continuing the workday'}"
      
      Generate a grounding message for this specific moment. 
      Remember: 1-3 sentences. No clichés. Natural tone.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9, // Higher for more uniqueness in repeats
        topP: 0.95,
      },
    });

    return response.text?.trim() || "The day is just one part of your life. Take it as it comes.";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return "Focus on the next small thing. You don't have to carry the whole day at once.";
  }
};
