import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppState, PdfFile, getTranslator, LANGUAGES } from '../types';
import { CheckIcon, SearchIcon, ChevronDownIcon } from './icons';
import UploadView from './UploadView';

interface TranslationViewProps {
    appState: AppState;
    onFileUpload: (file: File) => void;
    pdfFile: PdfFile | null;
    fullText: string;
    summaryText: string;
    translatedText: string;
    isTranslating: boolean;
    onTranslate: (text: string, language: string) => void;
    uiLanguage: string;
    targetTranslationLanguage: string;
    onTargetTranslationLanguageChange: (language: string) => void;
}

const convertToMarkdown = (text: string): string => {
    if (!text) return '';
    
    // 이미 마크다운 형식인 경우 그대로 반환
    if (text.match(/^#+\s|^\d+\.\s|^[-*]\s/m)) {
        return text;
    }
    
    let markdown = text;
    
    // 1단계: 제목 변환 (번호가 있는 항목)
    markdown = markdown.replace(/^(\d+)\.\s+([^\n]+)$/gm, '## $2');
    
    // 2단계: 소제목 변환 (들여쓰기된 항목)
    markdown = markdown.replace(/^\s{2,}([^:\n]+):\s*$/gm, '### $1');
    
    // 3단계: 강조 텍스트 (한글 괄호)
    markdown = markdown.replace(/「([^」]+)」/g, '**$1**');
    markdown = markdown.replace(/『([^』]+)』/g, '**$1**');
    
    // 4단계: 영문 따옴표
    markdown = markdown.replace(/"([^"]+)"/g, '**$1**');
    markdown = markdown.replace(/'([^']+)'/g, '**$1**');
    
    // 5단계: 연락처 강조
    markdown = markdown.replace(/(\d{3})-(\d{3,4})-(\d{4})/g, '**$1-$2-$3**');
    markdown = markdown.replace(/\((\d{3})-(\d{4})-(\d{4})\)/g, '(**$1-$2-$3**)');
    
    // 6단계: 불릿 포인트 정규화
    markdown = markdown.replace(/^[\s•\-\*]+(.+?)$/gm, '- $1');
    
    // 7단계: 링크 처리
    markdown = markdown.replace(/(www\.[^\s]+)/g, '[$1](https://$1)');
    markdown = markdown.replace(/(https?:\/\/[^\s]+)/g, '[$1]($1)');
    
    // 8단계: 주소 정보 강조
    markdown = markdown.replace(/(\d{5}\s+\S+\s+\S+\s+\S+)/g, '**$1**');
    
    // 9단계: 날짜 강조
    markdown = markdown.replace(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/g, '**$1.$2.$3**');
    
    // 10단계: 단락 정리
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    
    return markdown;
};

const LanguageDropdown: React.FC<{
    selectedLang: string;
    onSelect: (lang: string) => void;
    uiLanguage: string;
    includeAuto?: boolean;
}> = ({ selectedLang, onSelect, uiLanguage, includeAuto = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const t = getTranslator(uiLanguage);

    const languagesList = includeAuto 
        ? [{ code: 'Auto', name: t('autoDetect'), native: t('autoDetect') }, ...LANGUAGES]
        : LANGUAGES;
    
    const filteredLanguages = languagesList.filter(lang =>
        lang.native.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (code: string) => {
        onSelect(code);
        setIsOpen(false);
        setSearchTerm('');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDisplayName = (code: string) => {
        if (includeAuto && code === 'Auto') return t('autoDetect');
        const lang = LANGUAGES.find(l => l.code === code);
        return lang ? lang.native : code;
    }

    return (
        <div ref={dropdownRef} className="relative w-48">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-gray-100 p-2.5 rounded-lg border border-gray-200"
            >
                <span className="font-medium text-gray-800">{getDisplayName(selectedLang)}</span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-20 p-2">
                    <div className="relative mb-2">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('search') + '...'}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredLanguages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full text-left p-3 rounded-md hover:bg-gray-100 flex justify-between items-center ${selectedLang === lang.code ? 'bg-violet-50' : ''}`}
                            >
                                <div>
                                    <p className="font-semibold text-gray-800">{lang.native}</p>
                                    {lang.code !== 'Auto' && <p className="text-sm text-gray-500">{lang.name}</p>}
                                </div>
                                {selectedLang === lang.code && <CheckIcon className="w-5 h-5 text-violet-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const TranslationView: React.FC<TranslationViewProps> = ({
    appState,
    onFileUpload,
    pdfFile,
    fullText,
    summaryText,
    translatedText,
    isTranslating,
    onTranslate,
    uiLanguage,
    targetTranslationLanguage,
    onTargetTranslationLanguageChange,
}) => {
    const [sourceLanguage, setSourceLanguage] = useState('Auto');
    const [sourceType, setSourceType] = useState<'summary' | 'full'>('summary');
    const t = getTranslator(uiLanguage);
    
    // Set source type to summary by default, but fallback to full if no summary exists
    useEffect(() => {
        if (!summaryText) {
            setSourceType('full');
        }
    }, [summaryText]);

    const textToDisplay = sourceType === 'summary' ? summaryText : fullText;

    if (appState === AppState.IDLE || !pdfFile) {
        return <UploadView onFileUpload={onFileUpload} language={uiLanguage} />;
    }

    return (
        <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden p-6">
            {/* Header Controls */}
            <div className="flex-shrink-0 flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                    <LanguageDropdown
                        selectedLang={sourceLanguage}
                        onSelect={setSourceLanguage}
                        uiLanguage={uiLanguage}
                        includeAuto={true}
                    />
                     <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    <LanguageDropdown
                        selectedLang={targetTranslationLanguage}
                        onSelect={onTargetTranslationLanguageChange}
                        uiLanguage={uiLanguage}
                    />
                    <div className="flex items-center space-x-2 pl-4">
                        <button
                            onClick={() => setSourceType('full')}
                            disabled={!fullText}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md border transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                                sourceType === 'full' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            {t('fullText')}
                        </button>
                        <button
                            onClick={() => setSourceType('summary')}
                            disabled={!summaryText}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md border transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                                sourceType === 'summary' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            {t('summaryText')}
                        </button>
                    </div>
                </div>
                 <div>
                    <button
                        onClick={() => onTranslate(textToDisplay, targetTranslationLanguage)}
                        disabled={isTranslating || !textToDisplay}
                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-fuchsia-500 text-white rounded-lg text-sm font-semibold hover:brightness-90 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isTranslating ? t('translating') : t('translateButton')}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                {/* Original Text */}
                <div className="flex flex-col overflow-hidden bg-gray-50 rounded-lg border border-gray-200">
                    <div className="markdown-summary p-4 overflow-y-auto h-full text-left">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {convertToMarkdown(textToDisplay)}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Translated Text */}
                <div className="flex flex-col overflow-hidden bg-gray-50 rounded-lg border border-gray-200">
                    <div className="markdown-summary p-4 overflow-y-auto h-full text-left">
                        {isTranslating && !translatedText ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex items-center space-x-2 text-gray-500">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                    <span>{t('translating')}</span>
                                </div>
                            </div>
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {convertToMarkdown(translatedText)}
                            </ReactMarkdown>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranslationView;