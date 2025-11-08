import React from 'react';

const SummarySkeleton: React.FC = () => {
    return (
        <div className="space-y-8 animate-pulse-slow">
            {/* First section */}
            <div className="flex items-start space-x-4">
                <div className="w-5 h-5 bg-gray-300 rounded-full flex-shrink-0 mt-1"></div>
                <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-300 rounded w-2/5"></div>
                    <div className="space-y-2 pt-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>

            {/* Second section */}
            <div className="flex items-start space-x-4">
                <div className="w-5 h-5 bg-gray-300 rounded-full flex-shrink-0 mt-1"></div>
                 <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                    <div className="space-y-2 pt-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>

            {/* Third section */}
            <div className="flex items-start space-x-4">
                <div className="w-5 h-5 bg-gray-300 rounded-full flex-shrink-0 mt-1"></div>
                 <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                    <div className="space-y-2 pt-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummarySkeleton;
