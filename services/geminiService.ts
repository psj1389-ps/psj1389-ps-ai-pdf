import { GoogleGenAI, Content } from "@google/genai";
import { ChatMessage } from '../types';

// 중요: 이 방식은 API_KEY가 클라이언트 측 환경에 설정되어 있어야 합니다.
// 사용자의 요청에 따라 개발 편의를 위해 클라이언트 호출로 변경되었으며,
// 프로덕션 배포 시에는 백엔드 호출 방식으로 전환하는 것이 보안상 권장됩니다.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Gemini 스트림을 Uint8Array의 ReadableStream으로 변환하는 헬퍼 함수
const convertToUint8ArrayStream = (geminiStream: AsyncIterable<{ text: string }>): ReadableStream<Uint8Array> => {
    const readableStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of geminiStream) {
              if (chunk.text) {
                controller.enqueue(encoder.encode(chunk.text));
              }
            }
            controller.close();
          } catch(error) {
            console.error("스트림 변환 중 오류 발생:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            controller.error(new Error(`스트림 실패: ${errorMessage}`));
          }
        },
    });
    return readableStream;
};

export const getSummaryStream = async (documentText: string, language: string): Promise<ReadableStream<Uint8Array>> => {
    const CHUNK_SIZE = 15000;
    const isLargeDoc = documentText.length > CHUNK_SIZE;
    const textToSummarize = isLargeDoc ? documentText.substring(0, CHUNK_SIZE) : documentText;

    // 더 나은 구조의 요약을 위해 상세한 프롬프트 사용
    const formattingInstructions = `Your summary must be well-organized and easy to read in ${language}. Follow these formatting guidelines strictly:
1.  Start with a main title using a level 1 heading: "# 📝 PDF 요약: [Document Title]".
2.  Follow with a level 2 heading: "## 주요 주제 및 핵심 내용".
3.  Use a numbered list for the main sections (e.g., "1. 행사 개요", "2. 요청 사항").
4.  Use bullet points (-) for details within each section.
5.  For list items, use **bold text** for the label followed by a colon (e.g., "- **행사명:** 제11회...").
6.  The entire output must be in well-formed markdown.`;

    const prompt = isLargeDoc 
        ? `The following is the beginning of a large document. Please provide a detailed and structured initial summary of this first part. Let the user know that this is a summary of the initial part and they can ask questions about the entire document.\n\n${formattingInstructions}\n\n---\n\n${textToSummarize}`
        : `Please provide a detailed and structured summary of the following document.\n\n${formattingInstructions}\n\n---\n\n${textToSummarize}`;

    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
        });
        return convertToUint8ArrayStream(stream);
    } catch (error) {
        console.error("Gemini 요약 스트림 생성 오류:", error);
        // App.tsx의 catch 블록에서 처리할 수 있도록 오류를 다시 던집니다.
        throw error;
    }
};

export const getChatStream = async (history: ChatMessage[], systemInstruction: string): Promise<ReadableStream<Uint8Array>> => {
    const contents: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));

    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
            }
        });
        return convertToUint8ArrayStream(stream);
    } catch (error) {
        console.error("Gemini 채팅 스트림 생성 오류:", error);
        // App.tsx의 catch 블록에서 처리할 수 있도록 오류를 다시 던집니다.
        throw error;
    }
};