import { GoogleGenAI, Content } from "@google/genai";

// Vercel 환경 변수에서 API 키를 안전하게 가져옵니다.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Vercel의 Edge 런타임에서 실행되도록 설정합니다.
export const config = {
  runtime: 'edge',
  // Edge 런타임의 최대 실행 시간을 늘려 대용량 문서 처리 시간을 확보합니다.
  // Vercel Pro 플랜 이상에서 유효할 수 있습니다.
  maxDuration: 60, 
};

// Helper to create a streaming response
const createStreamingResponse = async (stream: AsyncIterable<any>) => {
    const readableStream = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const chunkText = chunk.text;
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
          controller.close();
        },
    });

    return new Response(readableStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};

// 프론트엔드의 요청을 처리하는 메인 함수입니다.
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { type, text, history, systemInstruction, language } = await req.json();

    if (type === 'summarize') {
        const fullText = text;
        const CHUNK_SIZE = 15000;
        const isLargeDoc = fullText.length > CHUNK_SIZE;
        const textToSummarize = isLargeDoc ? fullText.substring(0, CHUNK_SIZE) : fullText;

        const formattingInstructions = `Your summary must be well-organized and easy to read in ${language}. Follow these formatting guidelines strictly:
1.  Start with a main title for the summary, like "📝 PDF Summary".
2.  Use numbered headings for main sections (e.g., "1. Main Topic", "2. Key Points", "3. Conclusion").
3.  Use nested lists (bullet points or numbered sub-points) to break down information within each section.
4.  Use **bold text** to highlight key terms, names, and important concepts.
5.  The entire output must be in well-formed markdown.`;

        const prompt = isLargeDoc 
            ? `The following is the beginning of a large document. Please provide a detailed and structured initial summary of this first part. Let the user know that this is a summary of the initial part and they can ask questions about the entire document.\n\n${formattingInstructions}\n\n---\n\n${textToSummarize}`
            : `Please provide a detailed and structured summary of the following document.\n\n${formattingInstructions}\n\n---\n\n${textToSummarize}`;


        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
        });
        
        return createStreamingResponse(stream);

    } else if (type === 'chat') {
        // 프론트에서 받은 history를 Gemini API 형식으로 변환합니다.
        const contents: Content[] = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }],
        }));

        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
            }
        });
        
        return createStreamingResponse(stream);

    } else {
        return new Response(JSON.stringify({ error: 'Invalid request type' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: `Internal Server Error: ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}