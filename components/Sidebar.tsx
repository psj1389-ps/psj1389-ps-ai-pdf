import React, { useState, useRef, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { RecentFile, ActiveTool, getTranslator, LANGUAGES } from '../types';
import {
    HomeIcon,
    SummarizeIcon,
    TranslateIcon,
    HistoryIcon,
    ConvertIcon,
    LogoIcon,
    GlobeIcon,
    CheckIcon,
    ChevronDownIcon,
    LogoutIcon,
    UserIcon
} from './icons';

interface SidebarProps {
    onNewChat: () => void;
    targetLanguage: string;
    onLanguageChange: (language: string) => void;
    recentFiles: RecentFile[];
    onRecentFileClick: (fileName: string) => void;
    activeTool: ActiveTool;
    onToolSelect: (tool: ActiveTool) => void;
    session: Session | null;
}

const Sidebar: React.FC<SidebarProps> = ({
    onNewChat,
    targetLanguage,
    onLanguageChange,
    recentFiles,
    onRecentFileClick,
    activeTool,
    onToolSelect,
    session,
}) => {
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const languageDropdownRef = useRef<HTMLDivElement>(null);
    
    const t = getTranslator(targetLanguage);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const handleLanguageSelect = (langCode: string) => {
        onLanguageChange(langCode);
        setShowLanguageDropdown(false);
        setSearchTerm('');
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
                setShowLanguageDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const filteredLanguages = LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.native.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentLanguage = LANGUAGES.find(lang => lang.code === targetLanguage) || LANGUAGES[0];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen hidden md:flex">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                <LogoIcon className="w-8 h-8 flex-shrink-0" />
                <h1 className="text-xl font-bold text-gray-800 truncate">PDF AI Summarizer</h1>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
                <button
                    onClick={() => {
                        onNewChat();
                        onToolSelect('home');
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-fuchsia-500 hover:brightness-90 text-white px-4 py-2.5 rounded-lg transition-colors font-semibold text-sm flex items-center justify-center shadow-sm hover:shadow-md"
                >
                    + {t('newChat')}
                </button>
            </div>

            {/* Tools Menu & Recent Files */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                        {t('tools')}
                    </p>
                    <div className="space-y-1">
                        <button
                            onClick={() => onToolSelect('home')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                activeTool === 'home'
                                    ? 'bg-violet-100 text-violet-700'
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <HomeIcon className="w-5 h-5" />
                            <span>{t('home')}</span>
                        </button>
                        <button
                            onClick={() => onToolSelect('summarize')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                activeTool === 'summarize'
                                    ? 'bg-violet-100 text-violet-700'
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <SummarizeIcon className="w-5 h-5" />
                            <span>{t('summarize')}</span>
                        </button>
                        <button
                            onClick={() => onToolSelect('translate')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                activeTool === 'translate'
                                    ? 'bg-violet-100 text-violet-700'
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <TranslateIcon className="w-5 h-5" />
                            <span>{t('translate')}</span>
                        </button>
                        <button
                            onClick={() => onToolSelect('convert')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                activeTool === 'convert'
                                    ? 'bg-violet-100 text-violet-700'
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <ConvertIcon className="w-5 h-5" />
                            <span>{t('convert')}</span>
                        </button>
                    </div>
                </div>

                {recentFiles.length > 0 && (
                    <div className="px-4 py-2 mt-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                            {t('recent')}
                        </p>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                            {recentFiles.map((file, index) => (
                                <button
                                    key={`${file.name}-${index}`}
                                    onClick={() => onRecentFileClick(file.name)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 text-left text-sm text-gray-600 transition-colors group"
                                >
                                    <HistoryIcon className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
                                    <span className="truncate font-medium text-gray-700 group-hover:text-gray-900">{file.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 space-y-2">
                <div ref={languageDropdownRef} className="relative">
                    <button
                        onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <GlobeIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm truncate">{currentLanguage.native}</span>
                        </div>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform flex-shrink-0 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showLanguageDropdown && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 flex flex-col z-50">
                            <div className="p-2 border-b border-gray-200">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={`${t('search')}...`}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                                    autoFocus
                                />
                            </div>
                            
                            <div className="overflow-y-auto">
                                {filteredLanguages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageSelect(lang.code)}
                                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                                            targetLanguage === lang.code ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-700'
                                        }`}
                                    >
                                        <span className="truncate">{lang.flag} {lang.native}</span>
                                        {targetLanguage === lang.code && (
                                            <CheckIcon className="w-4 h-4 text-violet-600 flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                                {filteredLanguages.length === 0 && (
                                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                                        No languages found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {session ? (
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors text-sm"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span>{t('signOut')}</span>
                    </button>
                ) : (
                    <button
                        onClick={() => onToolSelect('auth')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors text-sm"
                    >
                        <UserIcon className="w-5 h-5" />
                        <span>{t('signIn')}</span>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;