
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import UploadView from './components/UploadView';
import ProcessingView from './components/ProcessingView';
import ChatView from './components/ChatView';
import { AppState, PdfFile, ChatMessage } from './types';
import { getSummaryStream, getChatStream } from './services/geminiService';
import type { PDFDocumentProxy } from 'pdfjs-dist';

// pdfjs-dist worker
declare const pdfjsLib: any;

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
    const [documentText, setDocumentText] = useState<string>('');
    const [processingProgress, setProcessingProgress] = useState(0);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isReplying, setIsReplying] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState<string>('한국어');
    const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);

    const resetState = useCallback(() => {
        setAppState(AppState.IDLE);
        setPdfFile(null);
        setDocumentText('');
        setProcessingProgress(0);
        setChatHistory([]);
        setIsReplying(false);
        setPdfDocument(null);
    }, []);

    const handleNewChat = useCallback(() => {
        resetState();
    }, [resetState]);

    const handleLanguageChange = useCallback((language: string) => {
        setTargetLanguage(language);
    }, []);

    const handleCancelProcessing = useCallback(() => {
        resetState();
    }, [resetState]);

    const startSummaryGeneration = useCallback(async (fullText: string, language: string) => {
        setIsReplying(true);
        let summary = '';
        try {
            const stream = await getSummaryStream(fullText, language);
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            setChatHistory([{ role: 'model', text: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                summary += decoder.decode(value, { stream: true });
                setChatHistory([{ role: 'model', text: summary }]);
            }

        } catch (error) {
            console.error('Error getting summary:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setChatHistory([{
                role: 'model',
                text: `죄송합니다, 요약을 생성하는 중에 오류가 발생했습니다.\n\n**오류:** ${errorMessage}`
            }]);
        } finally {
            setIsReplying(false);
        }
    }, []);

    const handleFileUpload = useCallback(async (file: File) => {
        if (file.type !== 'application/pdf') {
            alert('PDF 파일만 업로드할 수 있습니다.');
            return;
        }
        
        resetState();
        setAppState(AppState.PROCESSING);
        setPdfFile({ name: file.name, url: URL.createObjectURL(file) });
        setProcessingProgress(0);

        try {
            const arrayBuffer = await file.arrayBuffer();
            
            setProcessingProgress(5);
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);

            loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
                setProcessingProgress(5 + Math.round((loaded / total) * 25));
            };

            const pdf = await loadingTask.promise;
            setPdfDocument(pdf);
            setProcessingProgress(30);

            let fullText = '';
            const numPages = pdf.numPages;

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                if (textContent.items.length > 0) {
                     const pageText = textContent.items.map((item: any) => item.str).join(' ');
                     fullText += pageText + '\n\n';
                }
                
                setProcessingProgress(30 + Math.round((i / numPages) * 70));
            }

            setDocumentText(fullText);
            setAppState(AppState.CHAT);
            
            startSummaryGeneration(fullText, targetLanguage);

        } catch (error) {
            console.error('Error processing PDF:', error);
            alert(`PDF 파일을 처리하는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
            resetState();
        }
    }, [targetLanguage, resetState, startSummaryGeneration]);

    const handleSendMessage = useCallback(async (message: string) => {
        if (!documentText) return;

        const userMessage: ChatMessage = { role: 'user', text: message };
        const newHistoryForState = [...chatHistory, userMessage];
        setChatHistory(newHistoryForState);
        setIsReplying(true);
        
        const historyForApi = newHistoryForState.filter((msg, index) => {
             return index > 0 || (index === 0 && msg.role === 'user');
        });
        
        const systemInstruction = `You are a helpful assistant. Answer questions based on the full PDF document content provided below. Your response should be in ${targetLanguage}.\n\n---\n\n${documentText}`;
        
        let modelResponse = '';
        try {
            setChatHistory(prev => [...prev, { role: 'model', text: '' }]);
            const stream = await getChatStream(historyForApi, systemInstruction);
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                modelResponse += decoder.decode(value, { stream: true });
                setChatHistory(prev => {
                    const latestHistory = [...prev];
                    latestHistory[latestHistory.length - 1].text = modelResponse;
                    return latestHistory;
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = `죄송합니다, 답변을 생성하는 중에 오류가 발생했습니다. API 키 또는 네트워크 연결을 확인해주세요.`;
            setChatHistory(prev => {
                const latestHistory = [...prev];
                latestHistory[latestHistory.length - 1].text = errorMessage;
                return latestHistory;
            });
        } finally {
            setIsReplying(false);
        }
    }, [chatHistory, documentText, targetLanguage]);
    
    const renderContent = () => {
        switch (appState) {
            case AppState.PROCESSING:
                return (
                    <ProcessingView
                        fileName={pdfFile?.name || ''}
                        progress={processingProgress}
                        onCancel={handleCancelProcessing}
                    />
                );
            case AppState.CHAT:
                 if (!pdfFile || !pdfDocument) return null;
                return (
                    <ChatView
                        pdfDocument={pdfDocument}
                        pdfFile={pdfFile}
                        chatHistory={chatHistory}
                        isReplying={isReplying}
                        onSendMessage={handleSendMessage}
                    />
                );
            case AppState.IDLE:
            default:
                return <UploadView onFileUpload={handleFileUpload} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar
                onNewChat={handleNewChat}
                targetLanguage={targetLanguage}
                onLanguageChange={handleLanguageChange}
            />
            <main className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-hidden">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;