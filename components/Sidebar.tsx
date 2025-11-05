import React, { useState } from 'react';
import { HomeIcon, PdfIcon, SearchIcon, RecentFileIcon, GlobeIcon } from './icons';

interface SidebarProps {
    onNewChat: () => void;
    targetLanguage: string;
    onLanguageChange: (language: string) => void;
}

const languages = [
    { code: '한국어', name: '한국어' },
    { code: 'English', name: 'English' },
    { code: '日本語', name: '日本語' },
    { code: '中文', name: '中文' },
];

const Sidebar: React.FC<SidebarProps> = ({ 
    onNewChat, 
    targetLanguage, 
    onLanguageChange,
}) => {
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

    return (
        <aside className="w-64 bg-white border-r border-gray-200 p-4 flex-col hidden md:flex">
            <div className="p-2 mb-6">
                <button 
                  onClick={onNewChat}
                  className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg h-10 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    + New Chat
                </button>
            </div>
            
            <nav>
                <ul>
                    <li>
                        <a href="#" className="flex items-center p-2 text-sm text-gray-600 rounded-md hover:bg-gray-100">
                            <SearchIcon className="w-5 h-5 mr-3 text-gray-500" />
                            <span>검색</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" className="flex items-center p-2 text-sm text-gray-800 rounded-md bg-gray-100 font-semibold">
                            <HomeIcon className="w-5 h-5 mr-3 text-gray-800" />
                            <span>홈</span>
                        </a>
                    </li>
                     <li>
                        <a href="#" className="flex items-center p-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 group">
                            <PdfIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" />
                            <span className="flex-1">PDF 도구</span>
                             <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </a>
                    </li>
                </ul>
            </nav>

            <div className="flex-1 overflow-y-auto mt-4">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">최근</h3>
                <div className="p-2 text-sm text-gray-500">
                    대화 기록이 없습니다.
                </div>
            </div>
            
            <div className="mt-auto">
                 <div className="border-t pt-2">
                 </div>
                 <ul>
                    <li>
                        <button onClick={() => setLanguageMenuOpen(!languageMenuOpen)} className="w-full flex items-center p-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 group text-left">
                            <GlobeIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" />
                            <span className="flex-1">{targetLanguage}</span>
                             <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${languageMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        {languageMenuOpen && (
                            <ul className="pl-7 mt-1">
                                {languages.map((lang) => (
                                     <li key={lang.code}>
                                        <button 
                                            onClick={() => {
                                                onLanguageChange(lang.code);
                                                setLanguageMenuOpen(false);
                                            }} 
                                            className={`w-full text-left block p-1 text-sm rounded-md ${targetLanguage === lang.code ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {lang.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                 </ul>
            </div>
        </aside>
    );
};

export default Sidebar;