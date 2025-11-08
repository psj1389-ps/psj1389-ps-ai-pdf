
import React from 'react';
import { RecentFileIcon } from './icons';
import { getTranslator } from '../types';

interface ProcessingViewProps {
    fileName: string;
    progress: number;
    onCancel: () => void;
    language: string;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ fileName, progress, onCancel, language }) => {
    const t = getTranslator(language);
    const statusText = progress < 30 
        ? t('loadingPDF', { progress })
        : t('extractingText', { progress });

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-12 border border-gray-200"
              style={{
                backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
                backgroundSize: `20px 20px`,
              }}
            >
                <div className="flex flex-col items-center justify-center p-6">
                    <RecentFileIcon className="w-12 h-12 text-red-500 mb-4" />
                    <p className="font-medium text-gray-800 mb-2 truncate max-w-full">{fileName}</p>
                    <p className="text-sm text-gray-500 mb-6">{statusText}</p>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                        <div 
                            className="bg-violet-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                        {t('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProcessingView;
