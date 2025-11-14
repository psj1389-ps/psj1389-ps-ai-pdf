import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { AppState, PdfFile, ChatMessage, getTranslator } from '../types';
import SummarySkeleton from './SummarySkeleton';
import UploadView from './UploadView';
import {
    DownloadIcon,
    RotateCwIcon,
    SendIcon,
    LogoIcon,
    SparklesIcon,
    ThumbsUpIcon,
    ThumbsDownIcon,
    CopyIcon,
    SummarizeIcon,
    PencilIcon
} from './icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatViewProps {
    appState: AppState;
    onFileUpload: (file: File) => void;
    pdfDocument: PDFDocumentProxy | null;
    pdfFile: PdfFile | null;
    chatHistory: ChatMessage[];
    isReplying: boolean;
    onSendMessage: (message: string) => void;
    language: string;
    onRenameFile: (newName: string) => void;
}

const commonProseClasses = `
    markdown-summary
    prose max-w-none 
    prose-h1:text-xl prose-h1:font-bold prose-h1:mb-4
    prose-h2:text-xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3
    prose-p:my-0 prose-p:mb-4
    prose-ul:my-3
    prose-ol:my-3
    prose-li:my-1
    prose-code:bg-gray-200 prose-code:rounded prose-code:px-1.5 prose-code:py-1 prose-code:font-mono prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']
    prose-a:text-[#3b82f6] prose-a:font-medium hover:prose-a:underline
`;

const ChatView: React.FC<ChatViewProps> = ({
    appState,
    onFileUpload,
    pdfDocument,
    pdfFile,
    chatHistory,
    isReplying,
    onSendMessage,
    language,
    onRenameFile,
}) => {
    const [numPages, setNumPages] = useState(pdfDocument?.numPages ?? 0);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [chatWidth, setChatWidth] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [zoomLabel, setZoomLabel] = useState('Auto');
    const [isRenaming, setIsRenaming] = useState(false);
    const [editingName, setEditingName] = useState(pdfFile?.name ?? '');
    
    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const resizerRef = useRef<HTMLDivElement>(null);
    const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const isResizingRef = useRef(false);
    const zoomDropdownRef = useRef<HTMLDivElement>(null);

    const t = getTranslator(language);

    useEffect(() => {
        if (pdfFile) {
            setEditingName(pdfFile.name);
        }
    }, [pdfFile?.name]);

    const calculateOptimalScale = useCallback(async (): Promise<number> => {
        if (!pdfDocument || !pdfContainerRef.current) return 1.0;
        try {
            const page = await pdfDocument.getPage(1);
            const containerWidth = pdfContainerRef.current.clientWidth - 40; // With padding
            const viewport = page.getViewport({ scale: 1, rotation });
            return containerWidth / viewport.width;
        } catch (error) {
            console.error('Error calculating optimal scale:', error);
            return 1.0;
        }
    }, [pdfDocument, rotation]);

    const renderAllPages = useCallback(async (newScale: number) => {
        if (!pdfDocument || !pdfContainerRef.current) return;
        
        const container = pdfContainerRef.current;
        container.innerHTML = ''; // Clear previous pages
        pageRefs.current = [];

        for (let i = 1; i <= pdfDocument.numPages; i++) {
            try {
                const page = await pdfDocument.getPage(i);
                const viewport = page.getViewport({ scale: newScale, rotation });

                const pageContainer = document.createElement('div');
                pageContainer.className = 'mb-4 shadow-lg';
                pageContainer.dataset.pageNumber = String(i);

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                pageContainer.appendChild(canvas);
                container.appendChild(pageContainer);
                pageRefs.current[i - 1] = pageContainer;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas,
                }).promise;
            } catch (pageError) {
                console.error(`Error rendering page ${i}:`, pageError);
            }
        }
    }, [pdfDocument, rotation]);

    useEffect(() => {
        if (pdfDocument) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const pageNum = parseInt(entry.target.getAttribute('data-page-number') || '1', 10);
                            setCurrentPage(pageNum);
                        }
                    });
                },
                { root: pdfContainerRef.current, rootMargin: '-50% 0px -50% 0px' }
            );

            const currentRefs = pageRefs.current;
            currentRefs.forEach((page) => {
                if (page) observer.observe(page);
            });

            return () => {
                currentRefs.forEach((page) => {
                    if (page) observer.unobserve(page);
                });
            };
        }
    }, [thumbnails, pdfDocument]); // Rerun when pages are rendered

    const handleFitToPage = useCallback(async () => {
        const optimalScale = await calculateOptimalScale();
        setScale(optimalScale);
        setZoomLabel('Auto');
    }, [calculateOptimalScale]);

    const handleScaleChange = (newScale: number) => {
        setScale(newScale);
        setZoomLabel(`${Math.round(newScale * 100)}%`);
    };

    useEffect(() => {
        if (pdfDocument) {
            setNumPages(pdfDocument.numPages);
            setRotation(0);

            const generateThumbnails = async () => {
                if (!pdfDocument) return;
                const thumbSrcs: string[] = [];
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                if (!tempCtx) return;

                for (let i = 1; i <= pdfDocument.numPages; i++) {
                    try {
                        const page = await pdfDocument.getPage(i);
                        const viewport = page.getViewport({ scale: 0.2 });
                        tempCanvas.width = viewport.width;
                        tempCanvas.height = viewport.height;
                        
                        await page.render({ 
                            canvasContext: tempCtx, 
                            viewport: viewport,
                            canvas: tempCanvas,
                        }).promise;
                        
                        thumbSrcs.push(tempCanvas.toDataURL('image/png'));
                    } catch (error) {
                        console.error(`Failed to generate thumbnail for page ${i}:`, error);
                    }
                }
                setThumbnails(thumbSrcs);
            };

            generateThumbnails().then(() => {
                handleFitToPage();
            });
        }
    }, [pdfDocument, handleFitToPage]);

    useEffect(() => {
        if (pdfDocument) {
            renderAllPages(scale);
        }
    }, [scale, rotation, renderAllPages, pdfDocument]);

    const handleThumbnailClick = (pageNumber: number) => {
        setCurrentPage(pageNumber); // Set active page immediately
        const pageElement = pageRefs.current[pageNumber - 1];
        if (pageElement) {
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRef.current = true;
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizingRef.current || !resizerRef.current) return;
        
        const parent = resizerRef.current.parentElement;
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();
        const newChatWidth = parentRect.right - e.clientX;
        const minWidth = 400; 
        const maxWidth = parentRect.width * 0.7;

        if (newChatWidth > minWidth && newChatWidth < maxWidth) {
            setChatWidth(newChatWidth);
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizingRef.current = false;
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        const handleClickOutside = (event: MouseEvent) => {
            if (zoomDropdownRef.current && !zoomDropdownRef.current.contains(event.target as Node)) {
                setIsZoomOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isReplying]);

    const handleSendMessage = (msg: string) => {
        if (msg.trim() === '' || isReplying) return;
        onSendMessage(msg.trim());
        setMessage('');
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRenameSubmit = () => {
        if (!pdfFile) return;
        const trimmedName = editingName.trim();
        if (trimmedName && trimmedName !== pdfFile.name) {
            const finalName = trimmedName.toLowerCase().endsWith('.pdf') ? trimmedName : `${trimmedName}.pdf`;
            onRenameFile(finalName);
        }
        setIsRenaming(false);
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            if (pdfFile) setEditingName(pdfFile.name);
            setIsRenaming(false);
        }
    };

    if (appState === AppState.IDLE || !pdfDocument || !pdfFile) {
        return <UploadView onFileUpload={onFileUpload} language={language} />;
    }

    const isSummaryStillLoading = chatHistory.length === 1 && chatHistory[0].role === 'model' && isReplying && chatHistory[0].text === '';
    
    const zoomLevels = [
        { label: 'Auto Fit', action: handleFitToPage },
        { label: '75%', action: () => handleScaleChange(0.75) },
        { label: '100%', action: () => handleScaleChange(1.0) },
        { label: '120%', action: () => handleScaleChange(1.2) },
        { label: '150%', action: () => handleScaleChange(1.5) },
        { label: '200%', action: () => handleScaleChange(2.0) },
        { label: '300%', action: () => handleScaleChange(3.0) },
    ];

    return (
        <div className="w-full h-full flex bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div 
                ref={thumbnailsContainerRef}
                className="w-28 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-2 overflow-y-auto"
            >
                {thumbnails.map((src, index) => (
                    <div
                        key={`thumb-${index}`}
                        className={`p-1 rounded-md cursor-pointer mb-2 transition-all ${currentPage === index + 1 ? 'border-2 border-violet-500 bg-violet-100' : 'border border-gray-300 hover:border-violet-400'}`}
                        onClick={() => handleThumbnailClick(index + 1)}
                    >
                        <img src={src} alt={`Page ${index + 1}`} className="w-full h-auto rounded-sm shadow-sm" />
                        <p className="text-center text-xs mt-1 text-gray-600">{index + 1}</p>
                    </div>
                ))}
            </div>
            
            <div className="flex-1 flex min-w-0">
                <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200 gap-4">
                        {isRenaming ? (
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={handleRenameSubmit}
                                    onKeyDown={handleRenameKeyDown}
                                    className="w-full text-sm font-medium text-gray-700 truncate px-2 py-1 bg-white border border-violet-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-700 truncate pl-2" title={pdfFile.name}>
                                    {pdfFile.name}
                                </span>
                                <button onClick={() => setIsRenaming(true)} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 flex-shrink-0" title="Rename file">
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                             <a href={pdfFile.url} download={pdfFile.name} className="p-2 rounded-md hover:bg-gray-100 text-gray-500" title="Download"><DownloadIcon className="w-5 h-5"/></a>
                             
                             <div ref={zoomDropdownRef} className="relative">
                                <button onClick={() => setIsZoomOpen(!isZoomOpen)} className="px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-gray-100 text-gray-700 border border-gray-300 flex items-center">
                                    <span>{zoomLabel}</span>
                                    <svg className="w-4 h-4 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {isZoomOpen && (
                                    <div className="absolute top-full right-0 mt-1 w-28 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                        <ul>
                                            {zoomLevels.map(level => (
                                                <li key={level.label}>
                                                    <button 
                                                        onClick={() => { level.action(); setIsZoomOpen(false); }}
                                                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        {level.label}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                             </div>

                             <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-2 rounded-md hover:bg-gray-100 text-gray-500" title="Rotate"><RotateCwIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <div 
                        ref={pdfContainerRef}
                        className="flex-1 overflow-auto p-4 flex flex-col items-center bg-gray-50"
                    >
                        {/* Pages will be rendered here */}
                    </div>
                </div>

                <div
                    ref={resizerRef}
                    className="w-1.5 cursor-col-resize bg-gray-300 hover:bg-gray-400 transition-colors flex-shrink-0"
                    onMouseDown={handleMouseDown}
                />
                <div 
                    className={`flex flex-col border-l border-gray-200 flex-shrink-0 bg-white ${chatWidth === null ? 'flex-1' : ''}`}
                    style={{ width: chatWidth !== null ? `${chatWidth}px` : undefined }}
                >
                    <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
                       {chatHistory.map((chat, index) => (
                        <div key={index} className={`flex items-start gap-2 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {chat.role === 'model' && <LogoIcon className="w-8 h-8 rounded-full flex-shrink-0" />}
                            <div className={`max-w-xl ${chat.role === 'user' ? 'bg-[#E2E3E5] text-gray-900 rounded-xl rounded-br-none' : ''}`}>
                                { (index === 0 && isSummaryStillLoading) ? (
                                    <div className="bg-gray-50 p-4 rounded-lg scanner-effect">
                                        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('preparingSummary')}</h2>
                                        <SummarySkeleton />
                                    </div>
                                ) : (
                                    <div className={`p-4 rounded-xl ${chat.role === 'user' ? '' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none animate-fade-in'}`}>
                                        <div className={commonProseClasses}>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    h1: ({node, children, ...props}) => {
                                                        const isSummaryTitle = index === 0 && chat.role === 'model' && node.position?.start.line === 1;
                                                        if (isSummaryTitle) {
                                                            return (
                                                                <h1 {...props}>
                                                                    <span className="flex items-center">
                                                                        <SummarizeIcon className="w-6 h-6 mr-2 flex-shrink-0" />
                                                                        {children}
                                                                    </span>
                                                                </h1>
                                                            );
                                                        }
                                                        return <h1 {...props}>{children}</h1>;
                                                    },
                                                }}
                                            >
                                                {chat.text}
                                            </ReactMarkdown>
                                        </div>
                                        {chat.role === 'model' && chat.text && (!isReplying || index < chatHistory.length - 1) && (
                                            <div className="flex items-center space-x-2 mt-3 text-gray-400">
                                                <button className="hover:text-gray-600 transition-colors"><ThumbsUpIcon className="w-4 h-4" /></button>
                                                <button className="hover:text-gray-600 transition-colors"><ThumbsDownIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleCopy(chat.text)} className="hover:text-gray-600 relative transition-colors">
                                                    <CopyIcon className="w-4 h-4" />
                                                    {copied && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-gray-700 text-white px-2 py-0.5 rounded">{t('copied')}</span>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                       ))}
                       {isReplying && !isSummaryStillLoading && (
                            <div className="flex justify-start items-start gap-2">
                                 <LogoIcon className="w-8 h-8 rounded-full flex-shrink-0" />
                                 <div className="bg-gray-100 p-4 rounded-lg rounded-tl-none flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-white">
                         {!isReplying && chatHistory.length > 0 && chatHistory[0]?.text && (
                            <div className="flex space-x-2 mb-2">
                                 <button onClick={() => handleSendMessage(t('refineSummary'))} className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                                    <SparklesIcon className="w-4 h-4 mr-2 text-orange-400" />
                                    {t('refineSummary')}
                                </button>
                            </div>
                         )}
                        <div className="relative">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(message);
                                    }
                                }}
                                placeholder={t('askAnything')}
                                className="w-full p-3 pr-14 border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white text-gray-900 placeholder-gray-500"
                                rows={1}
                                disabled={isReplying}
                            />
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                 <button onClick={() => handleSendMessage(message)} disabled={!message.trim() || isReplying} className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-fuchsia-500 text-white hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                    <SendIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatView;