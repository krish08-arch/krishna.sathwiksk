import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface StreetAnalysis {
  issueCategory: string;
  aiTags: string[];
  severity: 'low' | 'medium' | 'high';
  summary: string;
  hiddenInsights: string[]; // Expert urban design observations
  designCritique: {
    pros: string[];
    cons: string[];
  };
  scores: {
    walkability: number;
    safety: number;
    accessibility: number;
    comfort: number;
    edgeQuality: number;
    greenAccess: number;
    realmHealth: number;
    betweenness: number; // Logistical centrality/connectivity
    shadedSpaces: number; // Coverage of cooling shade
  };
  overallScore: number;
}

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    issueCategory: { type: Type.STRING, description: "Primary urban issue detected" },
    aiTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific problem tags" },
    severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
    summary: { type: Type.STRING, description: "One sentence summary" },
    hiddenInsights: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "Non-obvious urban design observations for professional planners" 
    },
    designCritique: {
      type: Type.OBJECT,
      properties: {
        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What's working in this urban space" },
        cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What's failing in this urban space" }
      },
      required: ["pros", "cons"]
    },
    scores: {
      type: Type.OBJECT,
      properties: {
        walkability: { type: Type.NUMBER },
        safety: { type: Type.NUMBER },
        accessibility: { type: Type.NUMBER },
        comfort: { type: Type.NUMBER },
        edgeQuality: { type: Type.NUMBER },
        greenAccess: { type: Type.NUMBER },
        realmHealth: { type: Type.NUMBER },
        betweenness: { type: Type.NUMBER },
        shadedSpaces: { type: Type.NUMBER }
      },
      required: ["walkability", "safety", "accessibility", "comfort", "edgeQuality", "greenAccess", "realmHealth", "betweenness", "shadedSpaces"]
    },
    overallScore: { type: Type.NUMBER }
  },
  required: ["issueCategory", "aiTags", "severity", "summary", "hiddenInsights", "designCritique", "scores", "overallScore"]
};

/**
 * Analyzes a street photo using Gemini 3 Flash.
 */
export async function analyzeStreetPhoto(base64Image: string, mimeType: string): Promise<StreetAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an expert Urban Reformer and Street Intelligence AI for Bangalore and Mysore.
    Analyze the street photo provided for professionals (planners, designers).
    
    Reveal "Hidden Insights" that a layman might miss:
    - Sightline issues for pedestrians.
    - Lack of "eyes on the street" (vibrancy vs dead compound walls).
    - Permeability and desire paths.
    - Subtle accessibility barriers (curb height, surface texture).
    - Thermal comfort (shade casting).
    - Betweenness (pedestrian connectivity potential).
    
    Provide a Design Critique of Pros and Cons.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: "Analyze this Indian street photo with the lens of an urban planner. Identify hidden intelligence including betweenness and shade quality." },
          { inlineData: { data: base64Image, mimeType } }
        ]
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA as any
    }
  });

  const result = JSON.parse(response.text || "{}");
  return result as StreetAnalysis;
}

/**
 * Uses Generative AI to reimagine a street photo based on urban design principles.
 * Note: Uses gemini-3.1-flash-image-preview for high-quality visualization.
 */
export async function reimagineStreet(base64Image: string, mimeType: string, userVision?: string): Promise<string> {
  const model = 'gemini-2.5-flash-image';
  
  const basePrompt = `
    MODIFICATION TASK: Edit and overlay world-class urban design elements onto this SPECIFIC street photo.
    
    STRICT GEOMETRY RULES:
    - DO NOT change the perspective, road alignment, or basic building volumes.
    - KEEP the original height of the buildings and the general location of objects.
    - Act like an "Urban Design Overlay" - modify existing surfaces rather than creating a new world.
    
    APPLY THESE SPECIFIC ENHANCEMENTS TO THE EXISTING SCENE:
    - TEXTURE SWAP: Replace rough road surfaces with high-quality, smooth asphalt and white markings.
    - PEDESTRIAN OVERLAY: Upgrade existing sidewalks/curbs into wide, high-quality cobblestone footpaths.
    - GREENING: Add a systematic tree canopy ALONG the existing road lines.
    - FACADE REFORM: Swap any high compound walls for vibrant, transparent glass storefronts and small cafes, keep the building scale same.
    - INFRASTRUCTURE: Add high-quality street furniture (benches, bins) and cycle tracks without moving the buildings.
    
    The final image should feel like a "Before and After" where the "After" is clearly the same location but upgraded.
  `;

  const finalPrompt = userVision 
    ? `${basePrompt}\n\nSPECIFIC USER VISION TO INCORPORATE: ${userVision}. Ensure the render strictly follows these priority requests while maintaining urban design best practices.`
    : basePrompt;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: finalPrompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate reimagined image");
}
