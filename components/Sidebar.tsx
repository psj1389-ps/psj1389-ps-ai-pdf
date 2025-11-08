import React, { useState, useRef, useEffect } from 'react';
import { HomeIcon, PdfIcon, SearchIcon, RecentFileIcon, GlobeIcon, UserIcon, LogoutIcon } from './icons';
import { getTranslator, RecentFile, ActiveTool, languages } from '../types';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';


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
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
    const [pdfToolsMenuOpen, setPdfToolsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const languageMenuRef = useRef<HTMLDivElement>(null);
    const t = getTranslator(targetLanguage);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
                setLanguageMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredLanguages = languages.filter(lang => 
        lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.native.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <aside className="w-64 bg-white border-r border-gray-200 p-4 flex-col hidden md:flex">
            
            <nav className="mt-4">
                <ul>
                    <li>
                         <button 
                            onClick={onNewChat} 
                            className={`w-full flex items-center p-2 text-sm font-medium rounded-md transition-colors ${
                                activeTool === 'home' 
                                ? 'bg-[#E2E3E5] text-gray-900' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <HomeIcon className="w-5 h-5 mr-3" />
                            {t('home')}
                        </button>
                    </li>
                     <li>
                        <button onClick={() => setPdfToolsMenuOpen(!pdfToolsMenuOpen)} className="w-full flex items-center p-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 group text-left mt-1">
                            <PdfIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" />
                            <span className="flex-1">{t('pdfTools')}</span>
                             <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${pdfToolsMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        {pdfToolsMenuOpen && (
                            <ul className="pl-7 mt-1">
                                <li>
                                     <button 
                                        onClick={() => onToolSelect('summarize')} 
                                        className={`w-full text-left block p-1 text-sm rounded-md transition-colors ${
                                            activeTool === 'summarize' 
                                            ? 'bg-gray-100 text-gray-800 font-semibold' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {t('toolSummarize')}
                                    </button>
                                </li>
                                <li>
                                     <button 
                                        onClick={() => onToolSelect('translate')} 
                                        className={`w-full text-left block p-1 text-sm rounded-md transition-colors ${
                                            activeTool === 'translate' 
                                            ? 'bg-gray-100 text-gray-800 font-semibold' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {t('toolTranslate')}
                                    </button>
                                </li>
                                <li>
                                     <a 
                                        href="https://77-tools.xyz"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full text-left block p-1 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-100`}
                                    >
                                        {t('toolConvert')}
                                    </a>
                                </li>
                            </ul>
                        )}
                    </li>
                </ul>
            </nav>

            <div className="flex-1 overflow-y-auto mt-4">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('recent')}</h3>
                {recentFiles.length > 0 ? (
                    <ul>
                        {recentFiles.map((file, index) => (
                            <li key={`${file.name}-${index}`}>
                                <button 
                                    onClick={() => onRecentFileClick(file.name)}
                                    className="w-full flex items-start p-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 text-left group"
                                >
                                    <RecentFileIcon className="w-5 h-5 mr-3 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-medium text-gray-800 truncate group-hover:text-gray-900" title={file.name}>{file.name}</p>
                                        <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                                            <span>{formatFileSize(file.size)}</span>
                                            <span>{formatDate(file.lastModified)}</span>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-2 text-sm text-gray-500">
                        {t('noHistory')}
                    </div>
                )}
            </div>
            
            <div className="mt-auto">
                 <div className="border-t pt-2">
                    {session ? (
                         <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center p-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 group text-left">
                            <LogoutIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" />
                            <span>{t('logout')}</span>
                         </button>
                    ) : (
                         <button onClick={() => onToolSelect('auth')} className="w-full flex items-center p-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 group text-left">
                            <UserIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" />
                            <span>{t('login')}</span>
                         </button>
                    )}
                 </div>
                <div ref={languageMenuRef} className="relative">
                    <button onClick={() => setLanguageMenuOpen(!languageMenuOpen)} className="w-full flex items-center p-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 group text-left">
                        <GlobeIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" />
                        <span className="flex-1">{targetLanguage}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    {languageMenuOpen && (
                        <div className="absolute bottom-full mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10">
                            <div className="relative mb-2">
                                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('search') + '...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                                />
                            </div>
                            <ul className="max-h-60 overflow-y-auto">
                                {filteredLanguages.map((lang) => (
                                    <li key={lang.code}>
                                        <button 
                                            onClick={() => {
                                                onLanguageChange(lang.code);
                                                setLanguageMenuOpen(false);
                                                setSearchTerm('');
                                            }} 
                                            className={`w-full text-left block p-2 text-sm rounded-md transition-colors ${targetLanguage === lang.code ? 'bg-violet-100 text-violet-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>{lang.native}</span>
                                                <span className="text-xs text-gray-400">{lang.name}</span>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;