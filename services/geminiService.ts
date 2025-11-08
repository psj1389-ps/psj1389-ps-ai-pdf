import { GoogleGenAI, Content } from "@google/genai";
import { ChatMessage, getTranslator } from '../types';

// IMPORTANT: This uses a client-side API key. For production, it's recommended
// to move this logic to a backend to protect the key.
const apiKey = typeof process === 'undefined' ? '' : (process.env.API_KEY || '');
if (!apiKey) {
    console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}
const ai = new GoogleGenAI({ apiKey });

// Helper function to convert Gemini stream to a ReadableStream of Uint8Array
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
            console.error("Error during stream conversion:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            controller.error(new Error(`Stream failed: ${errorMessage}`));
          }
        },
    });
    return readableStream;
};

export const getSummaryStream = async (documentText: string, language: string, fileName: string): Promise<ReadableStream<Uint8Array>> => {
    const t = getTranslator(language);
    
    const textToSummarize = documentText; 

    const systemInstruction = `${t('summaryPrompt_system', { language })}

# ${t('summaryPrompt_rulesTitle')}
${t('summaryPrompt_ruleLang', { language })}
${t('summaryPrompt_ruleFormat')}
${t('summaryPrompt_ruleNoConvo')}
${t('summaryPrompt_ruleFailure', { summaryCantGenerate: t('summaryPrompt_cantGenerate') })}

# ${t('summaryPrompt_guidelinesTitle')}
${t('summaryPrompt_guideline1')}
${t('summaryPrompt_guideline2')}
${t('summaryPrompt_guideline3')}
${t('summaryPrompt_guideline4')}

# ${t('summaryPrompt_templateTitle')}

${t('summaryPrompt_templateHeader', { fileName })}

---

${t('summaryPrompt_templateSection1Title')}
${t('summaryPrompt_templateSection1Content')}

---

${t('summaryPrompt_templateSection2Title')}

${t('summaryPrompt_templateSection2Content1')}

${t('summaryPrompt_templateSection2Content2')}

---

${t('summaryPrompt_templateSection3Title')}
${t('summaryPrompt_templateSection3Content')}
`;

    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: textToSummarize }] }],
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return convertToUint8ArrayStream(stream);
    } catch (error) {
        console.error("Gemini summary stream creation error:", error);
        throw error;
    }
};

export const getTranslationStream = async (documentText: string, targetLanguage: string): Promise<ReadableStream<Uint8Array>> => {
    const systemInstruction = `You are an expert translator. Translate the following text into ${targetLanguage}.
- Preserve the original paragraph breaks and general formatting.
- Do not add any extra commentary, greetings, or explanations.
- Provide only the translated text as your response.`;

    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: documentText }] }],
            config: {
                systemInstruction,
            }
        });
        return convertToUint8ArrayStream(stream);
    } catch (error) {
        console.error("Gemini translation stream creation error:", error);
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
        console.error("Gemini chat stream creation error:", error);
        throw error;
    }
};