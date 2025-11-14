import React, { useState } from 'react';
import { getTranslator } from '../types';
import { LinkIcon, SendIcon, StarIcon } from './icons';

interface SummaryViewProps {
    data: any; // Using any for mock data flexibility
}

const YoutubeSummaryView: React.FC<SummaryViewProps> = ({ data }) => {
    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-8 animate-fade-in p-2 sm:p-4 lg:p-8 overflow-y-auto">
            {/* Left Panel: Video Info */}
            <div className="w-full lg:w-1/3 flex-shrink-0">
                <div className="w-full aspect-video bg-gray-200 rounded-2xl shadow-lg mb-4 flex items-center justify-center">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" style={{ backgroundImage: `url('https://yt3.ggpht.com/ytc/AIdro_k5hV5-13O-b8V2TAlORvE02fr0_i4_GTeJ485m=s88-c-k-c0x00ffffff-no-rj')`, backgroundSize: 'cover' }}></div>
                    <div>
                        <p className="font-bold text-gray-800">{data.channel.name}</p>
                        <p className="text-sm text-gray-500">{data.channel.subscribers}</p>
                    </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                    <span>{data.views}</span>
                    <span className="mx-1">•</span>
                    <span>{data.date}</span>
                </div>
                <button className="mt-4 w-full text-center py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors">스크립트</button>
            </div>

            {/* Right Panel: Summary */}
            <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight mb-4">{data.title}</h1>
                <div className="flex flex-wrap gap-2 mb-6">
                    {data.tags.map((tag: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">{tag}</span>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-8">
                    {['타임라인 노트', '핵심 노트', '스크립트', '템플릿'].map(label => (
                         <button key={label} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            {label}
                            <StarIcon className="w-4 h-4 text-gray-400" />
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    {data.summary.map((item: any, index: number) => (
                        <div key={index}>
                            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-start gap-2">
                                <span className="text-orange-400 mt-1">💡</span>
                                <span>{item.question}</span>
                            </h2>
                            {item.answer && <p className="text-gray-600 leading-relaxed pl-6">{item.answer}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Fix: Define YoutubeWebViewProps interface
interface YoutubeWebViewProps {
    language: string;
}

const YoutubeWebView: React.FC<YoutubeWebViewProps> = ({ language }) => {
    const [url, setUrl] = useState('https://www.youtube.com/');
    const [isLoading, setIsLoading] = useState(false);
    const [summaryData, setSummaryData] = useState<any>(null);
    const t = getTranslator(language);

    const handleSubmit = () => {
        if (!url.trim()) return;
        setIsLoading(true);
        setSummaryData(null);

        // Simulate API call for scraping and summarizing
        setTimeout(() => {
            const mockData = {
                thumbnailUrl: 'https://i.ytimg.com/vi/szpL0YbgH_I/hq720.jpg',
                title: '[이강에는 달이 흐른다 | 1-2회 숏주행] 떨어지는 꽃잎을 잡았지만 이루지 못한 나의 첫사랑💔 이변엔... 지켜낼 수 있을까?🤔 #강태오 #김세정 MBC251108방송',
                tags: ['#이강에는달이흐른다', '#강태오', '#김세정', '#미스터리로맨스', '#사극', '#첫사랑', '#운명'],
                channel: {
                    name: '드확행 - MBC드라마 파밍',
                    subscribers: '구독자 14만명',
                },
                views: '조회수 5.2천회',
                date: '2025. 11. 12.',
                summary: [
                    {
                        question: '이강에 달이 흐른다 숏주행에서 첫사랑을 지켜낼 수 있을까?',
                        answer: '++ 이강에 달이 흐른다 숏주행은 첫사랑을 이루지 못했던 과거의 아픔을 가진 주인공이 이번에는 사랑을 지켜낼 수 있을지에 대한 이야기를 다룹니다. ++'
                    },
                    {
                        question: '주인공이 과거에 첫사랑을 이루지 못한 이유는 무엇인가?',
                        answer: '++ 과거 빈궁이 시약을 받고 물에 몸을 던져 죽었으며, 이는 주인공(저하)이 사랑하는 사람을 지키지 못했다는 트라우마로 남았기 때문입니다. ++'
                    },
                     {
                        question: '"떨어지는 꽃잎을 잡으면 첫사랑이 이루어진다"는 전설 뒤에 숨겨진 비극적 진실과 욕망의 무게를 파헤치는 드라마',
                        answer: ''
                    }
                ]
            };
            setSummaryData(mockData);
            setIsLoading(false);
        }, 3000);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (url.trim()) {
                handleSubmit();
            }
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    <span className="text-lg font-medium">{t('youtubeSummarizing')}</span>
                </div>
                <p className="mt-4 text-gray-500 max-w-full truncate">{url}</p>
            </div>
        );
    }

    if (summaryData) {
        return <YoutubeSummaryView data={summaryData} />;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl animate-fade-in">
                <div className="flex items-start sm:items-center gap-3 mb-4 text-left w-full flex-col sm:flex-row">
                    <LinkIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{t('youtubeViewTitle')}</h1>
                        <p className="text-md text-gray-500 mt-1">
                            {t('youtubeViewDescription')}
                        </p>
                    </div>
                </div>

                <div className="relative mt-8">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('youtubeViewPlaceholder')}
                        className="w-full p-4 pl-6 pr-20 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white text-gray-900 placeholder-gray-400"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!url.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-orange-500 to-fuchsia-500 text-white hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="요약 시작"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
                 <p className="text-center text-sm text-gray-500 mt-6 max-w-2xl mx-auto">
                    {t('youtubeFeatureDescription')}
                </p>
            </div>
        </div>
    );
};

export default YoutubeWebView;