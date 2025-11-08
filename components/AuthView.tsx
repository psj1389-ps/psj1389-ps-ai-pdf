import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogoIcon } from './icons';
import { getTranslator } from '../types';

const AuthView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    // A dummy language state for the translator, as this view is standalone.
    const t = getTranslator('한국어');

    const handleGoogleLogin = async () => {
        setLoading(true);
        setMessage('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) {
                setMessage(`오류: ${error.message}`);
                setLoading(false);
            }
            // On success, Supabase handles the redirect, so we don't need to setLoading(false) here.
        } catch(e) {
             if (e instanceof Error) {
                setMessage(`클라이언트 오류: ${e.message}. Supabase 환경 변수가 올바르게 설정되었는지 확인하세요.`);
            } else {
                setMessage('알 수 없는 오류가 발생했습니다.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full text-center">
                <div className="flex items-center justify-center space-x-3 mb-6">
                    <LogoIcon className="w-12 h-12"/>
                    <h1 className="text-5xl font-bold text-gray-800">77-tools PDF</h1>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                    <h2 className="text-2xl font-semibold mb-2 text-gray-700">{t('authTitle')}</h2>
                    <p className="text-gray-500 mb-6">{/* Description removed for cleaner UI */}</p>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-violet-500 text-white rounded-lg h-12 text-lg font-semibold hover:bg-violet-600 transition-colors shadow-md disabled:bg-violet-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? '전송 중...' : t('authGoogle')}
                    </button>
                    {message && <p className="mt-4 text-sm text-center text-red-500">{message}</p>}
                </div>
                 <p className="text-xs text-gray-400 mt-4">
                    {t('authFooter')}
                </p>
            </div>
        </div>
    );
};

export default AuthView;