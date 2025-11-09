import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PdfFile, getTranslator, LANGUAGES } from '../types';
import { CheckIcon, SearchIcon, ChevronDownIcon } from './icons';

interface TranslationViewProps {
    pdfFile: PdfFile;
    originalText: string;
    translatedText: string;
    isTranslating: boolean;
    onTranslate: (language: string) => void;
    uiLanguage: string;
    targetTranslationLanguage: string;
    onTargetTranslationLanguageChange: (language: string) => void;
}

const LanguageDropdown: React.FC<{
    selectedLang: string;
    onSelect: (lang: string) => void;
    label: string;
    uiLanguage: string;
    includeAuto?: boolean;
}> = ({ selectedLang, onSelect, label, uiLanguage, includeAuto = false }) => {
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
            <span className="text-sm text-gray-500 mb-1 block">{label}</span>
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
    pdfFile,
    originalText,
    translatedText,
    isTranslating,
    onTranslate,
    uiLanguage,
    targetTranslationLanguage,
    onTargetTranslationLanguageChange,
}) => {
    const [sourceLanguage, setSourceLanguage] = useState('Auto');
    const t = getTranslator(uiLanguage);

    return (
        <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative p-6">
            <div className="absolute top-6 right-6 z-10">
                 <button
                    onClick={() => onTranslate(targetTranslationLanguage)}
                    disabled={isTranslating}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-fuchsia-500 text-white rounded-lg text-sm font-semibold hover:brightness-90 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-wait"
                >
                    {isTranslating ? t('translating') : t('translateButton')}
                </button>
            </div>
            {/* Header Controls */}
            <div className="flex-shrink-0 flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <LanguageDropdown
                        selectedLang={sourceLanguage}
                        onSelect={setSourceLanguage}
                        label={t('source')}
                        uiLanguage={uiLanguage}
                        includeAuto={true}
                    />
                     <svg className="w-6 h-6 text-gray-400 mt-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    <LanguageDropdown
                        selectedLang={targetTranslationLanguage}
                        onSelect={onTargetTranslationLanguageChange}
                        label={t('target')}
                        uiLanguage={uiLanguage}
                    />
                </div>
            </div>

            {/* Display Options */}
            <div className="flex-shrink-0 flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                    <span className="text-sm text-gray-500 mr-4">{t('displayMode')}</span>
                     <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button type="button" className="px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-l-lg hover:bg-violet-100 focus:z-10 focus:ring-2 focus:ring-violet-500">
                           {t('bilingualView')}
                        </button>
                        <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-violet-500">
                            {t('translationOnlyView')}
                        </button>
                    </div>
                </div>
                 <div>
                     <span className="text-sm text-gray-500 mr-4">{t('fontSize')}</span>
                    <select className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-violet-500">
                        <option>{t('autoAdjustFontSize')}</option>
                        <option>{t('keepOriginalFontSize')}</option>
                    </select>
                </div>
            </div>


            {/* Content */}
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                {/* Original Text */}
                <div className="flex flex-col overflow-hidden bg-gray-50 rounded-lg border border-gray-200">
                    <div className="prose max-w-none p-4 overflow-y-auto h-full">
                        <pre className="whitespace-pre-wrap font-sans text-sm bg-transparent p-0 text-gray-800">{originalText}</pre>
                    </div>
                </div>

                {/* Translated Text */}
                <div className="flex flex-col overflow-hidden bg-gray-50 rounded-lg border border-gray-200">
                    <div className="prose max-w-none p-4 overflow-y-auto h-full">
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
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedText}</ReactMarkdown>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranslationView;