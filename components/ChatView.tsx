import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
import { PdfFile, ChatMessage } from '../types';
import { DownloadIcon, RotateCcwIcon, RotateCwIcon, ZoomInIcon, ZoomOutIcon, SendIcon, SparklesIcon, CopyIcon, ThumbsDownIcon, ThumbsUpIcon, ClipboardIcon, PhoneIcon, MicrophoneIcon, ExpandIcon, ArrowDownIcon } from './icons';
import Markdown from 'react-markdown';

// Define the type for pdfjsLib globally
declare const pdfjsLib: any;

interface ChatViewProps {
    pdfDocument: PDFDocumentProxy;
    pdfFile: PdfFile;
    chatHistory: ChatMessage[];
    isReplying: boolean;
    onSendMessage: (message: string) => void;
}

const PdfThumbnails: React.FC<{ pdfDoc: PDFDocumentProxy; onPageSelect: (page: number) => void; currentPage: number }> = ({ pdfDoc, onPageSelect, currentPage }) => {
    const [thumbnails, setThumbnails] = useState<string[]>([]);

    useEffect(() => {
        const generateThumbnails = async () => {
            const thumbs: string[] = [];
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 0.2 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if(context) {
                    // FIX: The TypeScript error indicates that the `RenderParameters` type requires a `canvas` property. This might be due to a project-specific type definition or a version mismatch.
                    await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
                    thumbs.push(canvas.toDataURL());
                }
            }
            setThumbnails(thumbs);
        };

        generateThumbnails();
    }, [pdfDoc]);

    return (
        <div className="w-48 bg-gray-50 p-2 overflow-y-auto border-r border-gray-200 hidden lg:block">
            {thumbnails.map((thumb, index) => (
                <div
                    key={index}
                    onClick={() => onPageSelect(index + 1)}
                    className={`cursor-pointer p-1 rounded-md mb-2 ${currentPage === index + 1 ? 'bg-gray-200 border-2 border-gray-400' : 'hover:bg-gray-200'}`}
                >
                    <img src={thumb} alt={`Page ${index + 1}`} className="w-full rounded shadow-sm" />
                    <p className="text-center text-xs mt-1 text-gray-600">{index + 1}</p>
                </div>
            ))}
        </div>
    );
};

const PdfViewer: React.FC<{ pdfDoc: PDFDocumentProxy, currentPage: number, scale: number, rotation: number }> = ({ pdfDoc, currentPage, scale, rotation }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const renderPage = async () => {
            if (!canvasRef.current) return;

            const page = await pdfDoc.getPage(currentPage);
            const viewport = page.getViewport({ scale, rotation });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            if (context) {
                // FIX: The TypeScript error indicates that the `RenderParameters` type requires a `canvas` property. This might be due to a project-specific type definition or a version mismatch.
                page.render({ canvasContext: context, viewport: viewport, canvas: canvas });
            }
        };
        renderPage();
    }, [pdfDoc, currentPage, scale, rotation]);

    return (
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 overflow-auto min-w-0">
            <canvas ref={canvasRef} className="shadow-lg" />
        </div>
    );
};


const ChatPanel: React.FC<{
    chatHistory: ChatMessage[];
    isReplying: boolean;
    onSendMessage: (message: string) => void;
}> = ({ chatHistory, isReplying, onSendMessage }) => {
    const [input, setInput] = useState('');
    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedMessageIndex(index);
            setTimeout(() => {
                setCopiedMessageIndex(null);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isReplying) {
            onSendMessage(input.trim());
            setInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleScroll = useCallback(() => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
        }
    }, []);

    const scrollToBottom = useCallback(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);
    
    useEffect(() => {
        const container = chatContainerRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (!showScrollButton) {
            scrollToBottom();
        }
    }, [chatHistory, showScrollButton, scrollToBottom]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            if (scrollHeight > 160) { // max-h-40
                 textareaRef.current.style.height = '160px';
            } else {
                 textareaRef.current.style.height = `${scrollHeight}px`;
            }
        }
    };


    return (
        <div className="w-full h-full bg-white p-4 flex flex-col border-l border-gray-200 relative">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 pr-2 space-y-4">
                {chatHistory.map((msg, index) => (
                   <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex flex-col items-start max-w-md">
                            <div className={`rounded-lg p-3 prose-xl max-w-none prose-headings:font-bold prose-p:leading-loose prose-li:leading-loose ${msg.role === 'user' ? 'bg-violet-500 text-white prose-invert' : 'bg-gray-50 text-gray-800'}`}>
                               <Markdown>{msg.text}</Markdown>
                            </div>
                            {msg.role === 'model' && msg.text && (
                                 <div className="mt-2 flex items-center space-x-3 text-gray-400">
                                     <button onClick={() => handleCopy(msg.text, index)} className="flex items-center space-x-1 hover:text-violet-600 focus:outline-none transition-colors">
                                        {copiedMessageIndex === index ? (
                                            <>
                                                <ClipboardIcon className="w-4 h-4 text-violet-500" />
                                                <span className="text-xs text-violet-500">Copied!</span>
                                            </>
                                        ) : (
                                            <CopyIcon className="w-4 h-4" />
                                        )}
                                     </button>
                                     <button className="hover:text-violet-600 focus:outline-none transition-colors">
                                         <ThumbsUpIcon className="w-4 h-4" />
                                     </button>
                                     <button className="hover:text-violet-600 focus:outline-none transition-colors">
                                         <ThumbsDownIcon className="w-4 h-4" />
                                     </button>
                                 </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {chatHistory.length === 1 && chatHistory[0].role === 'model' && !isReplying && (
                    <div className="flex justify-start pt-2">
                        <button
                            onClick={() => onSendMessage('요약의 내용을 조금 더 정리해줘')}
                            className="text-sm text-gray-700 font-medium bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
                        >
                            요약의 내용을 조금 더 정리해줘
                        </button>
                    </div>
                )}

                {(isReplying && chatHistory[chatHistory.length - 1]?.text === '') && (
                     <div className="flex justify-start">
                        <div className="bg-gray-50 text-gray-800 rounded-lg p-3">
                           <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {showScrollButton && (
                <button 
                    onClick={scrollToBottom} 
                    className="absolute bottom-24 right-6 w-9 h-9 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors z-10"
                    aria-label="Scroll to bottom"
                >
                    <ArrowDownIcon className="w-5 h-5 text-gray-600" />
                </button>
            )}

            <div className="border-t pt-4">
                <form onSubmit={handleFormSubmit}>
                    <div className="relative border border-gray-300 rounded-lg p-2 flex items-end bg-white focus-within:ring-2 focus-within:ring-violet-500">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInput}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleFormSubmit(e as any);
                                }
                            }}
                            placeholder="아무것이나 물어보세요..."
                            className="flex-1 resize-none border-none bg-transparent focus:ring-0 focus:outline-none p-0 leading-tight text-black"
                            rows={1}
                            style={{maxHeight: '10rem'}}
                            disabled={isReplying}
                        />
                        <button 
                            type="submit"
                            className="self-end ml-2 p-2 rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:bg-gray-300 transition-colors flex-shrink-0"
                            disabled={!input.trim() || isReplying}
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>
                <div className="flex justify-end items-center space-x-1 mt-2">
                    <div className="group relative">
                        <button type="button" className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={() => alert('통화 기능이 곧 제공될 예정입니다.')}>
                            <PhoneIcon className="w-5 h-5 text-gray-500" />
                        </button>
                         <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium rounded py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                            통화
                            <div className="absolute top-full left-1/2 -ml-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                    </div>
                    <div className="group relative">
                        <button type="button" className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={() => alert('음성 입력 기능이 곧 제공될 예정입니다.')}>
                            <MicrophoneIcon className="w-5 h-5 text-gray-500" />
                        </button>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium rounded py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                            음성 입력
                            <div className="absolute top-full left-1/2 -ml-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                    </div>
                    <div className="group relative">
                        <button type="button" className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={() => alert('확장 기능이 곧 제공될 예정입니다.')}>
                            <ExpandIcon className="w-5 h-5 text-gray-500" />
                        </button>
                         <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium rounded py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                            확장
                            <div className="absolute top-full left-1/2 -ml-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ChatView: React.FC<ChatViewProps> = (props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(0.75);
    const [rotation, setRotation] = useState(0);

    return (
        <div className="w-full h-full bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
            <header className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex-1">
                    <h2 className="text-sm font-medium truncate ml-2 text-gray-900">{props.pdfFile.name}</h2>
                </div>
                <div className="flex items-center space-x-2 text-gray-900">
                     <span className="text-sm">{currentPage} / {props.pdfDocument.numPages}</span>
                    <button onClick={() => setScale(s => Math.max(0.25, s - 0.1))} className="p-2 rounded hover:bg-gray-200"><ZoomOutIcon className="w-5 h-5" /></button>
                     <span className="text-sm">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-2 rounded hover:bg-gray-200"><ZoomInIcon className="w-5 h-5" /></button>
                    <div className="border-l h-5 mx-2 border-gray-300"></div>
                    <button onClick={() => setRotation(r => (r - 90) % 360)} className="p-2 rounded hover:bg-gray-200"><RotateCcwIcon className="w-5 h-5" /></button>
                    <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-2 rounded hover:bg-gray-200"><RotateCwIcon className="w-5 h-5" /></button>
                    <div className="border-l h-5 mx-2 border-gray-300"></div>
                    <button className="p-2 rounded hover:bg-gray-200"><DownloadIcon className="w-5 h-5" /></button>
                </div>
                <div className="flex-1"></div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <PdfThumbnails pdfDoc={props.pdfDocument} onPageSelect={setCurrentPage} currentPage={currentPage} />
                <PdfViewer pdfDoc={props.pdfDocument} currentPage={currentPage} scale={scale} rotation={rotation}/>
                <div className={"w-full md:w-2/5 xl:w-1/3"}>
                    <ChatPanel {...props} />
                </div>
            </div>
        </div>
    );
};

export default ChatView;