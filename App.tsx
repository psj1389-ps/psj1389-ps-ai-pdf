import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UploadView from './components/UploadView';
import ProcessingView from './components/ProcessingView';
import ChatView from './components/ChatView';
import TranslationView from './components/TranslationView';
import YoutubeWebView from './components/YoutubeWebView';
import AuthView from './components/AuthView';
import { AppState, PdfFile, ChatMessage, getTranslator, RecentFile, ActiveTool } from './types';
import { getSummaryStream, getChatStream, getTranslationStream } from './services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

// Configure the PDF.js worker to resolve startup errors.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@5.4.394/build/pdf.worker.mjs';


// --- IndexedDB Helpers ---
const DB_NAME = 'PDF_FILES_DB';
const STORE_NAME = 'pdf_files_store';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'name' });
            }
        };
        request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
        request.onerror = (event) => reject('Error opening DB: ' + (event.target as IDBOpenDBRequest).error);
    });
};

const saveFileToDB = async (file: File) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ name: file.name, file });
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject('Error saving file: ' + (event.target as IDBRequest).error);
    });
};

const getFileFromDB = async (fileName: string): Promise<File | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(fileName);
        request.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            resolve(result?.file as File | null);
        };
        request.onerror = (event) => reject('Error getting file: ' + (event.target as IDBRequest).error);
    });
};

const deleteFileFromDB = async (fileName: string): Promise<void> => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(fileName);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject('Error deleting file: ' + (event.target as IDBRequest).error);
    });
};


const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
    const [documentText, setDocumentText] = useState<string>('');
    const [processingProgress, setProcessingProgress] = useState(0);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isReplying, setIsReplying] = useState(false);
    const [uiLanguage, setUiLanguage] = useState<string>('한국어');
    const [translationTargetLanguage, setTranslationTargetLanguage] = useState<string>('English');
    const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
    const [fontClass, setFontClass] = useState('font-custom-kr');
    const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
    const [activeTool, setActiveTool] = useState<ActiveTool>('home');
    const [translatedText, setTranslatedText] = useState<string>('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const [youtubeViewKey, setYoutubeViewKey] = useState(0);
    
    const t = getTranslator(uiLanguage);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
             if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
                setActiveTool('home');
                if (_event === 'SIGNED_OUT') {
                    resetState();
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (['한국어', '日本語', '中文'].includes(uiLanguage)) {
            setFontClass('font-custom-kr');
        } else {
            setFontClass('font-custom-en');
        }
    }, [uiLanguage]);

    useEffect(() => {
        try {
            const storedFiles = localStorage.getItem('recentPdfFiles');
            if (storedFiles) {
                setRecentFiles(JSON.parse(storedFiles));
            }
        } catch (error) {
            console.error('Failed to load recent files from localStorage:', error);
            setRecentFiles([]);
        }
    }, []);

    const updateRecentFiles = (newFile: RecentFile) => {
        setRecentFiles(prevFiles => {
            const otherFiles = prevFiles.filter(f => f.name !== newFile.name);
            const updatedFiles = [newFile, ...otherFiles].slice(0, 20); // Limit to 20
            try {
                localStorage.setItem('recentPdfFiles', JSON.stringify(updatedFiles));
            } catch (error) {
                console.error('Failed to save recent files to localStorage:', error);
            }
            return updatedFiles;
        });
    };

    const resetState = useCallback(() => {
        setAppState(AppState.IDLE);
        setPdfFile(null);
        setDocumentText('');
        setProcessingProgress(0);
        setChatHistory([]);
        setIsReplying(false);
        setPdfDocument(null);
        setTranslatedText('');
        setIsTranslating(false);
    }, []);

    const handleNewChat = useCallback(() => {
        resetState();
        setActiveTool('home');
    }, [resetState]);

    const handleCancelProcessing = useCallback(() => {
        resetState();
        setActiveTool('home');
    }, [resetState]);

    const handleTranslate = useCallback(async (textToTranslate: string, language: string) => {
        setIsTranslating(true);
        setTranslatedText('');
        let fullTranslation = '';
        try {
            const stream = await getTranslationStream(textToTranslate, language);
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            
            while(true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullTranslation += decoder.decode(value, { stream: true });
                setTranslatedText(fullTranslation);
            }

        } catch (error) {
            console.error('Error getting translation:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setTranslatedText(t('chatError', { error: errorMessage }));
        } finally {
            setIsTranslating(false);
        }
    }, [t]);

    const handleToolSelect = (tool: ActiveTool) => {
        if (tool === 'translate' && activeTool !== 'translate') {
            setTranslatedText(''); // Clear previous translation
        }
        if (tool === 'convert' && activeTool === 'convert') {
            // Reset the view by changing the key
            setYoutubeViewKey(prev => prev + 1);
        }
        setActiveTool(tool);
    };

    const startSummaryGeneration = useCallback(async (fullText: string, language: string, fileName: string) => {
        setIsReplying(true);
        let summary = '';
        try {
            const stream = await getSummaryStream(fullText, language, fileName);
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
                text: t('summaryError', { error: errorMessage })
            }]);
        } finally {
            setIsReplying(false);
        }
    }, [t]);

    const handleFileUpload = useCallback(async (file: File) => {
        if (file.type !== 'application/pdf') {
            alert(t('pdfOnly'));
            return;
        }
        
        let toolAfterUpload = activeTool;
        if (toolAfterUpload === 'home') {
            toolAfterUpload = 'summarize';
        }

        resetState();
        setActiveTool(toolAfterUpload);
        setAppState(AppState.PROCESSING);
        setPdfFile({ name: file.name, url: URL.createObjectURL(file) });
        setProcessingProgress(0);

        try {
            await saveFileToDB(file);
            const arrayBuffer = await file.arrayBuffer();
            setProcessingProgress(5);

            const loadPdfDocument = async (password?: string): Promise<PDFDocumentProxy> => {
                const loadingTask = pdfjsLib.getDocument({
                    data: arrayBuffer,
                    ...(password && { password }),
                });

                loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
                    setProcessingProgress(5 + Math.round((loaded / total) * 25));
                };
                
                return loadingTask.promise;
            };

            let pdf: PDFDocumentProxy;

            try {
                pdf = await loadPdfDocument();
            } catch (error: any) {
                if (error.name === 'PasswordException') {
                    const password = prompt(t('passwordRequired'));
                    if (password) {
                        try {
                            pdf = await loadPdfDocument(password);
                        } catch (innerError: any) {
                            if (innerError.name === 'PasswordException') {
                                alert(t('incorrectPassword'));
                            } else {
                                throw innerError;
                            }
                            resetState();
                            return;
                        }
                    } else {
                        alert(t('passwordCancelled'));
                        resetState();
                        return;
                    }
                } else {
                    throw error;
                }
            }

            setPdfDocument(pdf);
            setProcessingProgress(30);

            let fullText = '';
            const numPages = pdf.numPages;

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                if (textContent.items.length > 0) {
                     // Group text items by line (y-coordinate) to preserve paragraph structure
                    const lines: { [key: number]: { x: number; str: string }[] } = {};
                    textContent.items.forEach((item: any) => {
                        if (!('str' in item) || item.str.trim() === '') return;
                        // Round y-coordinate to group items on the same line with a small tolerance
                        const y = Math.round(item.transform[5]); 
                        if (!lines[y]) lines[y] = [];
                        lines[y].push({ x: item.transform[4], str: item.str });
                    });

                    // Sort lines by y-coordinate (top to bottom)
                    const sortedYKeys = Object.keys(lines).map(parseFloat).sort((a, b) => b - a);

                    // Sort items within each line by x-coordinate (left to right) and join
                    const pageText = sortedYKeys.map(y => {
                        const lineItems = lines[y];
                        lineItems.sort((a, b) => a.x - b.x);
                        return lineItems.map(item => item.str).join(' ');
                    }).join('\n');
                    
                    fullText += pageText + '\n\n';
                }
                
                setProcessingProgress(30 + Math.round((i / numPages) * 70));
            }

            setDocumentText(fullText);
            setAppState(AppState.CHAT);
            
            const newRecentFile: RecentFile = {
                name: file.name,
                size: file.size,
                lastModified: file.lastModified,
            };
            updateRecentFiles(newRecentFile);

            if (toolAfterUpload === 'translate') {
                // For translation, we wait for the user to initiate.
            } else { // 'home' becomes 'summarize', 'summarize'
                startSummaryGeneration(fullText, uiLanguage, file.name);
            }

        } catch (error) {
            console.error('Error processing PDF:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(t('pdfProcessError', { error: errorMessage }));
            resetState();
        }
    }, [resetState, startSummaryGeneration, t, activeTool, uiLanguage]);
    
    const handleRecentFileClick = async (fileName: string) => {
        try {
            const file = await getFileFromDB(fileName);
            if (file) {
                await handleFileUpload(file);
            } else {
                alert(`Could not find "${fileName}" in the local database. Please upload it again.`);
            }
        } catch (error) {
            console.error("Error loading recent file:", error);
            alert("An error occurred while trying to load the recent file.");
        }
    };


    const handleSendMessage = useCallback(async (message: string) => {
        if (!documentText) return;

        const userMessage: ChatMessage = { role: 'user', text: message };
        const newHistoryForState = [...chatHistory, userMessage];
        setChatHistory(newHistoryForState);
        setIsReplying(true);
        
        const historyForApi = newHistoryForState.filter((msg, index) => {
             return index > 0 || (index === 0 && msg.role === 'user');
        });
        
        const systemInstruction = `You are a helpful assistant. Answer questions based on the full PDF document content provided below. Your response should be in ${uiLanguage}.\n\n---\n\n${documentText}`;
        
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
            const errorMessage = t('chatError');
            setChatHistory(prev => {
                const latestHistory = [...prev];
                latestHistory[latestHistory.length - 1].text = errorMessage;
                return latestHistory;
            });
        } finally {
            setIsReplying(false);
        }
    }, [chatHistory, documentText, uiLanguage, t]);

    const handleRenameFile = async (newName: string) => {
        if (!pdfFile || newName.trim() === '' || newName === pdfFile.name) {
            return;
        }
    
        const oldName = pdfFile.name;
    
        try {
            const fileFromDB = await getFileFromDB(oldName);
            if (!fileFromDB) {
                console.error("Could not find file to rename in DB");
                alert(`Could not find "${oldName}" in the local database.`);
                return;
            }
    
            const newFileObject = new File([fileFromDB], newName, {
                type: fileFromDB.type,
                lastModified: fileFromDB.lastModified,
            });
    
            await saveFileToDB(newFileObject);
            await deleteFileFromDB(oldName);
    
            setPdfFile(prev => prev ? { ...prev, name: newName } : null);
    
            const newRecentEntry: RecentFile = {
                name: newName,
                size: newFileObject.size,
                lastModified: newFileObject.lastModified,
            };
    
            setRecentFiles(prev => {
                // Filter out both old and new names to prevent duplicates
                const otherFiles = prev.filter(f => f.name !== oldName && f.name !== newName);
                const updated = [newRecentEntry, ...otherFiles].slice(0, 20);
                try {
                    localStorage.setItem('recentPdfFiles', JSON.stringify(updated));
                } catch (error) {
                    console.error('Failed to save recent files to localStorage:', error);
                }
                return updated;
            });
    
        } catch (error) {
            console.error("Error renaming file:", error);
            alert("Failed to rename the file.");
        }
    };

    const renderContent = () => {
        if (appState === AppState.PROCESSING) {
            return (
                <ProcessingView
                    fileName={pdfFile?.name || ''}
                    progress={processingProgress}
                    onCancel={handleCancelProcessing}
                    language={uiLanguage}
                />
            );
        }
        if (activeTool === 'auth') {
            return <AuthView />;
        }
    
        switch (activeTool) {
            case 'translate': {
                const summaryText = chatHistory.length > 0 && chatHistory[0].role === 'model' ? chatHistory[0].text : '';
                return (
                    <TranslationView
                        appState={appState}
                        onFileUpload={handleFileUpload}
                        pdfFile={pdfFile}
                        fullText={documentText}
                        summaryText={summaryText}
                        translatedText={translatedText}
                        isTranslating={isTranslating}
                        onTranslate={handleTranslate}
                        uiLanguage={uiLanguage}
                        targetTranslationLanguage={translationTargetLanguage}
                        onTargetTranslationLanguageChange={setTranslationTargetLanguage}
                    />
                );
            }
            case 'summarize':
                return (
                    <ChatView
                        appState={appState}
                        onFileUpload={handleFileUpload}
                        pdfDocument={pdfDocument}
                        pdfFile={pdfFile}
                        chatHistory={chatHistory}
                        isReplying={isReplying}
                        onSendMessage={handleSendMessage}
                        language={uiLanguage}
                        onRenameFile={handleRenameFile}
                    />
                );
            case 'convert':
                return <YoutubeWebView key={youtubeViewKey} language={uiLanguage} />;
            case 'home':
            default:
                if (appState === AppState.CHAT && pdfFile && pdfDocument) {
                     return (
                        <ChatView
                            appState={appState}
                            onFileUpload={handleFileUpload}
                            pdfDocument={pdfDocument}
                            pdfFile={pdfFile}
                            chatHistory={chatHistory}
                            isReplying={isReplying}
                            onSendMessage={handleSendMessage}
                            language={uiLanguage}
                            onRenameFile={handleRenameFile}
                        />
                    );
                }
                return <UploadView onFileUpload={handleFileUpload} language={uiLanguage} />;
        }
    };

    return (
        <div className={`flex h-screen bg-gray-50 ${fontClass}`}>
            <Sidebar
                onNewChat={handleNewChat}
                targetLanguage={uiLanguage}
                onLanguageChange={setUiLanguage}
                recentFiles={recentFiles}
                onRecentFileClick={handleRecentFileClick}
                activeTool={activeTool}
                onToolSelect={handleToolSelect}
                session={session}
            />
            <main className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;