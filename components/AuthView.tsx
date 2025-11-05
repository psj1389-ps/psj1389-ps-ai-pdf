import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogoIcon } from './icons';

const AuthView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) {
                setMessage(`오류: ${error.message}`);
            } else {
                setMessage('이메일을 확인하여 로그인 링크를 클릭하세요!');
            }
        } catch(e) {
             if (e instanceof Error) {
                setMessage(`클라이언트 오류: ${e.message}. Supabase 환경 변수가 올바르게 설정되었는지 확인하세요.`);
            } else {
                setMessage('알 수 없는 오류가 발생했습니다.');
            }
        } finally {
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
                    <h2 className="text-2xl font-semibold mb-2 text-gray-700">로그인 또는 가입</h2>
                    <p className="text-gray-500 mb-6">이메일로 매직 링크를 받아 시작하세요.</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-violet-500 text-white rounded-lg h-12 text-lg font-semibold hover:bg-violet-600 transition-colors shadow-md disabled:bg-violet-300 disabled:cursor-not-allowed"
                        >
                            {loading ? '전송 중...' : '매직 링크 받기'}
                        </button>
                    </form>
                    {message && <p className="mt-4 text-sm text-center text-gray-600">{message}</p>}
                </div>
                 <p className="text-xs text-gray-400 mt-4">
                    과거 대화 내용을 저장하고 불러오려면 로그인하세요.
                </p>
            </div>
        </div>
    );
};

export default AuthView;
