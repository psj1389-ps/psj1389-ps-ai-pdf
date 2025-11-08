import React, { useState, useCallback } from 'react';
import { LogoIcon, UploadCloudIcon, LinkIcon, SparklesIcon, QuestionAnswerIcon, CompareIcon, GlobeIcon } from './icons';
import { getTranslator } from '../types';

interface UploadViewProps {
    onFileUpload: (file: File) => void;
    language: string;
}

const UploadView: React.FC<UploadViewProps> = ({ onFileUpload, language }) => {
    const [isDragging, setIsDragging] = useState(false);
    const t = getTranslator(language);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileUpload(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [onFileUpload]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileUpload(e.target.files[0]);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('file-upload-input')?.click();
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-start text-center p-4 pt-20">
            <div className="flex items-center space-x-3 mb-4">
                <LogoIcon className="w-10 h-10"/>
                <h1 className="text-5xl font-bold text-gray-800">{t('uploadTitle')}</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mb-10 leading-relaxed">
                {t('uploadDescription')}
            </p>

            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`w-full max-w-2xl rounded-2xl shadow-sm p-8 transition-all duration-300 ${
                    isDragging
                    ? 'bg-gray-700 border-2 border-dashed border-gray-500 scale-105'
                    : 'bg-gray-100 border border-gray-200'
                }`}
            >
                <div className="flex flex-col items-center justify-center p-6">
                    <input
                        type="file"
                        id="file-upload-input"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="application/pdf"
                    />
                    <button
                        onClick={triggerFileInput}
                        className="w-full max-w-md flex items-center justify-center bg-gray-700 text-white rounded-lg h-12 text-lg font-semibold hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 whitespace-nowrap"
                    >
                        <UploadCloudIcon className="w-6 h-6 mr-3" />
                        {t('uploadButton')}
                    </button>
                    <button className={`flex items-center mt-4 transition-colors ${isDragging ? 'text-gray-200 hover:text-white' : 'text-gray-500 hover:text-violet-600'}`}>
                        <LinkIcon className="w-5 h-5 mr-2" />
                        {t('uploadViaLink')}
                    </button>
                    <p className={`text-xs mt-2 transition-colors ${isDragging ? 'text-gray-300' : 'text-gray-400'}`}>{t('uploadHint')}</p>
                </div>
            </div>

            <div className="mt-16 w-full max-w-5xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold mb-2">{t('featureTitle')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feature 1: 문서 요약 */}
                    <div className="bg-violet-50 p-6 rounded-xl flex items-start space-x-4">
                        <div className="bg-violet-100 p-3 rounded-full flex-shrink-0">
                            <SparklesIcon className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1 text-gray-800">{t('summarizeTitle')}</h3>
                            <p className="text-gray-600 text-sm">{t('summarizeDescription')}</p>
                        </div>
                    </div>

                    {/* Feature 2: 스마트 Q&A */}
                    <div className="bg-sky-50 p-6 rounded-xl flex items-start space-x-4">
                        <div className="bg-sky-100 p-3 rounded-full flex-shrink-0">
                            <QuestionAnswerIcon className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1 text-gray-800">{t('qnaTitle')}</h3>
                            <p className="text-gray-600 text-sm">{t('qnaDescription')}</p>
                        </div>
                    </div>

                    {/* Feature 3: 컨텐츠 비교 */}
                    <div className="bg-emerald-50 p-6 rounded-xl flex items-start space-x-4">
                        <div className="bg-emerald-100 p-3 rounded-full flex-shrink-0">
                            <CompareIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1 text-gray-800">{t('compareTitle')}</h3>
                            <p className="text-gray-600 text-sm">{t('compareDescription')}</p>
                        </div>
                    </div>

                    {/* Feature 4: 문서 번역 */}
                    <div className="bg-blue-50 p-6 rounded-xl flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                            <GlobeIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1 text-gray-800">{t('translateTitle')}</h3>
                            <p className="text-gray-600 text-sm">{t('translateDescription')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadView;