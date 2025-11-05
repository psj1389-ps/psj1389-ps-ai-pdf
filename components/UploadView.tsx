import React, { useState, useCallback } from 'react';
import { LogoIcon, UploadCloudIcon, LinkIcon, SparklesIcon, QuestionAnswerIcon, CompareIcon, GlobeIcon } from './icons';

interface UploadViewProps {
    onFileUpload: (file: File) => void;
}

const UploadView: React.FC<UploadViewProps> = ({ onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

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
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <div className="flex items-center space-x-3 mb-4">
                <LogoIcon className="w-10 h-10"/>
                <h1 className="text-5xl font-bold text-gray-800">77-tools PDF</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mb-10 leading-relaxed">
                77-tools의 온라인 PDF 도구를 사용하여 파일 내용을 더 잘 이해하고 관련 지식을 얻을 수 있습니다. 독해는 어려울 수 있지만, PDF 채팅을 통해 대화로 정보를 이해하는 것이 간단해집니다! 문서의 요지를 파악하거나 내용을 번역해야 할 때 언제든지 77-tools가 도와줍니다. 독해 과정을 즐겁게 만들어 드립니다.
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
                        여기를 클릭하거나 드래그하여 업로드
                    </button>
                    <button className={`flex items-center mt-4 transition-colors ${isDragging ? 'text-gray-200 hover:text-white' : 'text-gray-500 hover:text-violet-600'}`}>
                        <LinkIcon className="w-5 h-5 mr-2" />
                        링크를 통해 업로드
                    </button>
                    <p className={`text-xs mt-2 transition-colors ${isDragging ? 'text-gray-300' : 'text-gray-400'}`}>지원되는 파일 유형: PDF | 최대 파일 크기: 50MB</p>
                </div>
            </div>

            <div className="mt-16 w-full max-w-5xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold mb-2">77-tools PDF로 모든 것 해결하기</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feature 1: 문서 요약 */}
                    <div className="bg-violet-50 p-6 rounded-xl flex items-start space-x-4">
                        <div className="bg-violet-100 p-3 rounded-full flex-shrink-0">
                            <SparklesIcon className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1 text-gray-800">문서 요약</h3>
                            <p className="text-gray-600 text-sm">핵심 정보를 지능적으로 식별하여 빠르게 간결한 요약을 작성하여 문서의 핵심을 파악하는 데 도움을 줍니다.</p>
                        </div>
                    </div>

                    {/* Feature 2: 스마트 Q&A */}
                    <div className="bg-sky-50 p-6 rounded-xl flex items-start space-x-4">
                        <div className="bg-sky-100 p-3 rounded-full flex-shrink-0">
                            <QuestionAnswerIcon className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1 text-gray-800">스마트 Q&A</h3>
                            <p className="text-gray-600 text-sm">문서 내용을 기반으로 질문에 답변하며 전문적인 답변 내용을 작성하여 문서의 이해를 높이는 데 도움을 줍니다.</p>
                        </div>
                    </div>

                    {/* Feature 3: 컨텐츠 비교 */}
                    <div className="bg-emerald-50 p-6 rounded-xl flex items-start space-x-4">
                        <div className="bg-emerald-100 p-3 rounded-full flex-shrink-0">
                            <CompareIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1 text-gray-800">컨텐츠 비교</h3>
                            <p className="text-gray-600 text-sm">원본 텍스트로 쉽게 이동할 수 있는 참조된 컨텐츠를 지원하여 정확한 비교를 용이하게 하고 독해 효율을 높입니다.</p>
                        </div>
                    </div>

                    {/* Feature 4: 문서 번역 */}
                    <div className="bg-blue-50 p-6 rounded-xl flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                            <GlobeIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1 text-gray-800">문서 번역</h3>
                            <p className="text-gray-600 text-sm">PDF 파일을 번역하고, 왼쪽에 원본 파일, 오른쪽에 번역된 파일과 나란히 비교합니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadView;