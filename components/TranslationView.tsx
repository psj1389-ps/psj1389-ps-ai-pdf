import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PdfFile, getTranslator } from '../types';

interface TranslationViewProps {
    pdfFile: PdfFile;
    originalText: string;
    translatedText: string;
    isTranslating: boolean;
    onTranslate: (language: string) => void;
    targetLanguage: string;
    onLanguageChange: (language: string) => void;
}

const languages = [
    { code: '한국어', name: '한국어' },
    { code: 'English', name: 'English' },
    { code: '日本語', name: '日本語' },
    { code: '中文', name: '中文' },
];

const TranslationView: React.FC<TranslationViewProps> = ({
    pdfFile,
    originalText,
    translatedText,
    isTranslating,
    onTranslate,
    targetLanguage,
    onLanguageChange,
}) => {
    const t = getTranslator(targetLanguage);

    return (
        <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700 truncate" title={pdfFile.name}>
                    {pdfFile.name}
                </span>
                <div className="flex items-center space-x-4">
                    <select
                        value={targetLanguage}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => onTranslate(targetLanguage)}
                        disabled={isTranslating}
                        className="px-4 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-violet-300 disabled:cursor-wait"
                    >
                        {isTranslating ? t('translating') : t('translateButton')}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 grid grid-cols-2 gap-4 p-4 min-h-0">
                {/* Original Text */}
                <div className="flex flex-col overflow-hidden bg-[#E2E3E5] rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-300 flex-shrink-0">{t('original')}</h2>
                    <div className="prose max-w-none p-4 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-sans text-sm bg-transparent p-0 text-black">{originalText}</pre>
                    </div>
                </div>

                {/* Translated Text */}
                <div className="flex flex-col overflow-hidden bg-[#E2E3E5] rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-300 flex-shrink-0">{t('translation')}</h2>
                    <div className="prose max-w-none p-4 overflow-y-auto">
                        {isTranslating && !translatedText ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex items-center space-x-2 text-gray-500">
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                    <span>{t('translating')}</span>
                                </div>
                            </div>
                        ) : (
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedText}</ReactMarkdown>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranslationView;