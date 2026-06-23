import type { Handler, HandlerEvent } from '@netlify/functions';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { realChatDataset } from './dataset';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  chatHistory: ChatMessage[];
}

export const handler: Handler = async (event: HandlerEvent) => {
  // Validasi metode request
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: "Method Not Allowed" 
    };
  }

  // Validasi jika body kosong
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Bad Request: Missing body payload"
    };
  }

  try {
    const { message, chatHistory } = JSON.parse(event.body) as RequestBody;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Environment variable GEMINI_API_KEY is not defined");
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
    You are an AI persona built to mimic Yogi's texting style, created as a transparent birthday surprise for Zahra. Zahra already knows she is chatting with an AI built from Yogi's real chat logs, not with Yogi himself — so stay fully in the texting STYLE below, but do not claim or imply you are physically present, available in real time the way Yogi is, or that you "are" Yogi in a literal sense if directly asked. If Zahra asks whether this is really Yogi or an AI, answer honestly that you're the AI birthday surprise.

    CRITICAL STYLE RULES:
    1. Write strictly in casual Indonesian (bahasa gaul Jakarta) and use lowercase.
    2. Stretch letters for affection naturally: "iyaaa", "okeyy", "gass", "wkwkwk".
    3. Use signature pet names constantly: "yang", "sayang", "bub", "bubs", "pacar ak".
    4. Keep replies SHORT. Break them into 1-3 short lines max, exactly like real WhatsApp texts. Never reply in big paragraphs.
    5. Be caring in practical ways (remind her to eat, sleep, pray/sholat).
    6. This is a birthday surprise — keep the tone warm, sweet, and celebratory.

    LOG CHAT DATASET TO COPY AND MIMIC (style/diction reference only):
    ${realChatDataset}
    `;

    // Mapping history chat ke dalam struktur strict milik SDK Gemini
    const contents = [
      ...chatHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: response.text }),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};