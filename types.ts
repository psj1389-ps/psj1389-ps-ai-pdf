// types.ts

export type ActiveTool = 'home' | 'summarize' | 'translate' | 'convert' | 'auth';

export enum AppState {
    IDLE = 'idle',
    PROCESSING = 'processing',
    CHAT = 'chat',
}

export interface PdfFile {
    name: string;
    url: string;
}

export interface RecentFile {
    name: string;
    size: number; // in bytes
    lastModified: number; // timestamp
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// I18N
interface TranslationSet {
    [key: string]: string;
}
  
interface Translations {
    [key: string]: TranslationSet;
}

export const languages = [
    { code: '한국어', name: '한국어', native: '한국어' },
    { code: 'English', name: 'English', native: 'English' },
    { code: '日本語', name: 'Japanese', native: '日本語' },
    { code: '中文 (简体)', name: 'Chinese (Simplified)', native: '中文 (简体)' },
    { code: '中文 (繁體)', name: 'Chinese (Traditional)', native: '中文 (繁體)' },
    { code: 'Español', name: 'Spanish', native: 'Español' },
    { code: 'Français', name: 'French', native: 'Français' },
    { code: 'Deutsch', name: 'German', native: 'Deutsch' },
    { code: 'Português', name: 'Portuguese', native: 'Português' },
    { code: 'Русский', name: 'Russian', native: 'Русский' },
    { code: 'العربية', name: 'Arabic', native: 'العربية' },
    { code: 'हिन्दी', name: 'Hindi', native: 'हिन्दी' },
    { code: 'Bahasa Indonesia', name: 'Indonesian', native: 'Bahasa Indonesia' },
    { code: 'Italiano', name: 'Italian', native: 'Italiano' },
    { code: 'Nederlands', name: 'Dutch', native: 'Nederlands' },
    { code: 'Polski', name: 'Polish', native: 'Polski' },
    { code: 'Svenska', name: 'Swedish', native: 'Svenska' },
    { code: 'Türkçe', name: 'Turkish', native: 'Türkçe' },
    { code: 'Tiếng Việt', name: 'Vietnamese', native: 'Tiếng Việt' },
    { code: 'Čeština', name: 'Czech', native: 'Čeština' },
    { code: 'Dansk', name: 'Danish', native: 'Dansk' },
    { code: 'Suomi', name: 'Finnish', native: 'Suomi' },
    { code: 'Ελληνικά', name: 'Greek', native: 'Ελληνικά' },
    { code: 'Magyar', name: 'Hungarian', native: 'Magyar' },
    { code: 'Norsk', name: 'Norwegian', native: 'Norsk' },
    { code: 'Română', name: 'Romanian', native: 'Română' },
    { code: 'Slovenčina', name: 'Slovak', native: 'Slovenčina' },
    { code: 'Українська', name: 'Ukrainian', native: 'Українська' },
    { code: 'עברית', name: 'Hebrew', native: 'עברית' },
    { code: 'فارسی', name: 'Persian', native: 'فارسی' },
    { code: 'ไทย', name: 'Thai', native: 'ไทย' },
    { code: 'Afrikaans', name: 'Afrikaans', native: 'Afrikaans' },
    { code: 'Català', name: 'Catalan', native: 'Català' },
    { code: 'Eesti', name: 'Estonian', native: 'Eesti' },
    { code: 'Filipino', name: 'Filipino', native: 'Filipino' },
    { code: 'Galego', name: 'Galician', native: 'Galego' },
    { code: 'Íslenska', name: 'Icelandic', native: 'Íslenska' },
    { code: 'Lietuvių', name: 'Lithuanian', native: 'Lietuvių' },
    { code: 'Latviešu', name: 'Latvian', native: 'Latviešu' },
    { code: 'Slovenščina', name: 'Slovenian', native: 'Slovenščina' },
    { code: 'Swahili', name: 'Swahili', native: 'Swahili' },
    { code: 'Zulu', name: 'Zulu', native: 'Zulu' },
];
  
export const translations: Translations = {
    '한국어': {
      // Sidebar
      home: '홈',
      pdfTools: 'PDF도구들',
      toolSummarize: '문서 요약',
      toolTranslate: '문서 번역',
      toolConvert: '문서 변환',
      recent: '최근',
      noHistory: '대화 기록이 없습니다.',
      login: '로그인',
      logout: '로그아웃',
      search: '검색',
      // AuthView
      authTitle: '로그인 또는 가입',
      authGoogle: 'Google로 로그인',
      authFooter: '과거 대화 내용을 저장하고 불러오려면 로그인하세요.',
      // UploadView
      uploadTitle: '77-tools PDF',
      uploadDescription: '77-tools의 온라인 PDF 도구를 사용하여 파일 내용을 더 잘 이해하고 관련 지식을 얻을 수 있습니다. 독해는 어려울 수 있지만, PDF 채팅을 통해 대화로 정보를 이해하는 것이 간단해집니다! 문서의 요지를 파악하거나 내용을 번역해야 할 때 언제든지 77-tools가 도와줍니다. 독해 과정을 즐겁게 만들어 드립니다.',
      uploadButton: '여기를 클릭하거나 드래그하여 업로드',
      uploadViaLink: '링크를 통해 업로드',
      uploadHint: '지원되는 파일 유형: PDF | 최대 파일 크기: 50MB',
      featureTitle: '77-tools PDF로 모든 것 해결하기',
      summarizeTitle: '문서 요약',
      summarizeDescription: '핵심 정보를 지능적으로 식별하여 빠르게 간결한 요약을 작성하여 문서의 핵심을 파악하는 데 도움을 줍니다.',
      qnaTitle: '스마트 Q&A',
      qnaDescription: '문서 내용을 기반으로 질문에 답변하며 전문적인 답변 내용을 작성하여 문서의 이해를 높이는 데 도움을 줍니다.',
      compareTitle: '컨텐츠 비교',
      compareDescription: '원본 텍스트로 쉽게 이동할 수 있는 참조된 컨텐츠를 지원하여 정확한 비교를 용이하게 하고 독해 효율을 높입니다.',
      translateTitle: '문서 번역',
      translateDescription: 'PDF 파일을 번역하고, 왼쪽에 원본 파일, 오른쪽에 번역된 파일과 나란히 비교합니다.',
      // ProcessingView
      loadingPDF: 'PDF 파일 로딩 중... ({{progress}}%)',
      extractingText: '텍스트 추출 중... ({{progress}}%)',
      cancel: '취소',
      // ChatView
      preparingSummary: '요약 준비 중...',
      askAnything: '아무것이나 물어보세요...',
      refineSummary: '글자크기, 들여쓰기 등 서식에 맞게 요약을 수정해줘',
      copied: '복사됨!',
      // TranslationView
      translateButton: '번역',
      original: '원본',
      translation: '번역본',
      translating: '번역 중...',
      // App.tsx
      pdfOnly: 'PDF 파일만 업로드할 수 있습니다.',
      pdfProcessError: 'PDF 파일을 처리하는 중 오류가 발생했습니다: {{error}}',
      summaryError: '죄송합니다, 요약을 생성하는 중에 오류가 발생했습니다.\n\n**오류:** {{error}}',
      chatError: '죄송합니다, 답변을 생성하는 중에 오류가 발생했습니다. API 키 또는 네트워크 연결을 확인해주세요.',
      passwordRequired: '이 PDF는 비밀번호로 보호되어 있습니다. 비밀번호를 입력해주세요:',
      incorrectPassword: '비밀번호가 틀렸습니다. 파일을 다시 업로드해주세요.',
      passwordCancelled: '비밀번호 입력이 취소되었습니다. PDF를 열 수 없습니다.',
      // Summary Prompt
      summaryPrompt_system: '당신은 고도로 발전된 문서 분석 AI입니다. 당신의 유일한 임무는 제공된 텍스트에 대해 구조화되고 상세하며 읽기 쉬운 요약을 {{language}}로 생성하는 것입니다.',
      summaryPrompt_rulesTitle: '절대 규칙',
      summaryPrompt_ruleLang: '1. **언어**: 전체 응답은 반드시 {{language}}로 작성되어야 합니다.',
      summaryPrompt_ruleFormat: '2. **형식**: 아래의 마크다운 템플릿과 형식 가이드라인을 정확하게 따라야 합니다. 벗어나지 마세요.',
      summaryPrompt_ruleNoConvo: '3. **대화 금지**: 대화체 텍스트, 인사, 소개 또는 설명을 추가하지 마세요. 전체 응답은 오직 마크다운 요약 내용이어야 합니다.',
      summaryPrompt_ruleFailure: '4. **실패**: 요약이 불가능할 경우, 유일한 응답은 \'# {{summaryCantGenerate}}\'이어야 하며 다른 내용은 없어야 합니다.',
      summaryPrompt_cantGenerate: '요약 생성 불가',
      summaryPrompt_guidelinesTitle: '형식 가이드라인',
      summaryPrompt_guideline1: '- 항목 목록에는 글머리 기호 (`*` 또는 `-`)를 사용하세요.',
      summaryPrompt_guideline2: '- "2. 핵심 내용 및 주요 포인트" 내의 하위 주제에 대해서는 숫자와 괄호로 시작하는 새 단락을 사용하세요 (예: "1) 하위 주제 제목"). 이것은 목록이 아니라 텍스트 한 줄입니다. 세부 사항은 글머리 기호로 따르세요.',
      summaryPrompt_guideline3: '- 기술 용어, 파일 이름 또는 코드 스니펫에는 인라인 코드 형식 (`code`)을 사용하세요 (예: `pdfplumber`).',
      summaryPrompt_guideline4: '- URL은 자동으로 클릭 가능한 링크로 형식을 지정하세요.',
      summaryPrompt_templateTitle: '마크다운 템플릿 (이 정확한 구조를 사용하세요)',
      summaryPrompt_templateHeader: '# PDF 내용 요약: {{fileName}}',
      summaryPrompt_templateSection1Title: '## 1. 주요 주제 및 핵심 아이디어',
      summaryPrompt_templateSection1Content: '* [문서 전체를 주의 깊게 읽고, 가장 중요한 주제, 주장, 그리고 핵심적인 아이디어를 식별하여 글머리 기호로 요약하세요. 문서의 목적과 핵심 메시지를 명확히 전달해야 합니다.]',
      summaryPrompt_templateSection2Title: '## 2. 핵심 내용 및 주요 포인트',
      summaryPrompt_templateSection2Content1: '1) [첫 번째 소주제]\n* [소주제에 대한 상세 설명. 불릿 포인트를 사용하세요.]\n* [필요한 경우, `inline code`를 사용하여 기술 용어를 강조하세요.]',
      summaryPrompt_templateSection2Content2: '2) [두 번째 소주제]\n* [소주제에 대한 상세 설명.]',
      summaryPrompt_templateSection3Title: '## 3. 결론 및 최종 상태',
      summaryPrompt_templateSection3Content: '* [문서의 결론과 최종 상태에 대한 요약.]\n* [URL이 있는 경우, 자동으로 링크로 변환하세요. 예: http://127.0.0.1:5000]',
    },
    'English': {
      home: 'Home',
      pdfTools: 'PDF Tools',
      toolSummarize: 'Document Summary',
      toolTranslate: 'Document Translation',
      toolConvert: 'Document Conversion',
      recent: 'Recent',
      noHistory: 'No chat history.',
      login: 'Login',
      logout: 'Logout',
      search: 'Search',
      authTitle: 'Login or Sign Up',
      authGoogle: 'Login with Google',
      authFooter: 'Log in to save and load past conversations.',
      uploadTitle: '77-tools PDF',
      uploadDescription: "Use 77-tools' online PDF tool to better understand file contents and gain relevant knowledge. Reading can be difficult, but understanding information through conversation with PDF chat is simple! Whether you need to grasp the main points of a document or translate its content, 77-tools is always here to help. We make the reading process enjoyable.",
      uploadButton: 'Click here or drag to upload',
      uploadViaLink: 'Upload via link',
      uploadHint: 'Supported file type: PDF | Max file size: 50MB',
      featureTitle: 'Solve everything with 77-tools PDF',
      summarizeTitle: 'Document Summary',
      summarizeDescription: 'Intelligently identifies key information to quickly create concise summaries, helping you grasp the core of the document.',
      qnaTitle: 'Smart Q&A',
      qnaDescription: 'Answers questions based on the document content and helps you write professional responses, enhancing your understanding of the document.',
      compareTitle: 'Content Comparison',
      compareDescription: 'Supports referenced content that can be easily navigated to the original text, facilitating accurate comparisons and improving reading efficiency.',
      translateTitle: 'Document Translation',
      translateDescription: 'Translate PDF files and compare them side-by-side with the original file on the left and the translated file on the right.',
      loadingPDF: 'Loading PDF file... ({{progress}}%)',
      extractingText: 'Extracting text... ({{progress}}%)',
      cancel: 'Cancel',
      preparingSummary: 'Preparing summary...',
      askAnything: 'Ask anything...',
      refineSummary: 'Please revise the summary according to the format (font size, indentation, etc.)',
      copied: 'Copied!',
      translateButton: 'Translate',
      original: 'Original',
      translation: 'Translation',
      translating: 'Translating...',
      pdfOnly: 'Only PDF files can be uploaded.',
      pdfProcessError: 'An error occurred while processing the PDF file: {{error}}',
      summaryError: 'Sorry, an error occurred while generating the summary.\n\n**Error:** {{error}}',
      chatError: 'Sorry, an error occurred while generating a response. Please check your API key or network connection.',
      passwordRequired: 'This PDF is password protected. Please enter the password:',
      incorrectPassword: 'Incorrect password. Please try uploading the file again.',
      passwordCancelled: 'Password entry was cancelled. Unable to open the PDF.',
      summaryPrompt_system: 'You are a highly advanced document analysis AI. Your single task is to generate a structured, detailed, and easy-to-read summary of the provided text in {{language}}.',
      summaryPrompt_rulesTitle: 'ABSOLUTE RULES',
      summaryPrompt_ruleLang: '1.  **LANGUAGE**: The entire response MUST be in {{language}}.',
      summaryPrompt_ruleFormat: '2.  **FORMAT**: You MUST follow the MARKDOWN TEMPLATE and FORMATTING GUIDELINES below precisely. Do not deviate.',
      summaryPrompt_ruleNoConvo: '3.  **NO CONVERSATION**: DO NOT add any conversational text, greetings, introductions, or explanations. Your entire response must be ONLY the markdown summary content.',
      summaryPrompt_ruleFailure: '4.  **FAILURE**: If summarizing is impossible, your ONLY response is \'# {{summaryCantGenerate}}\' and nothing else.',
      summaryPrompt_cantGenerate: 'Summary Generation Failed',
      summaryPrompt_guidelinesTitle: 'FORMATTING GUIDELINES',
      'summaryPrompt_guideline1': '- Use bullet points (`*` or `-`) for lists of items.',
      'summaryPrompt_guideline2': '- For sub-topics within "2. Key Contents and Main Points", start a new paragraph with a number followed by a parenthesis, like "1) Sub-topic Title". This is NOT a list, just a line of text. Follow it with bullet points for details.',
      'summaryPrompt_guideline3': '- Use inline code formatting (`code`) for technical terms, filenames, or code snippets (e.g., `pdfplumber`).',
      'summaryPrompt_guideline4': '- Automatically format any URLs as clickable links.',
      'summaryPrompt_templateTitle': 'MARKDOWN TEMPLATE (Use this exact structure)',
      'summaryPrompt_templateHeader': '# PDF Content Summary: {{fileName}}',
      'summaryPrompt_templateSection1Title': '## 1. Main Topic and Core Ideas',
      'summaryPrompt_templateSection1Content': '* [Read the entire document carefully, identify the most important topics, arguments, and core ideas, and summarize them using bullet points. The purpose and core message of the document should be clearly conveyed.]',
      'summaryPrompt_templateSection2Title': '## 2. Key Contents and Main Points',
      'summaryPrompt_templateSection2Content1': '1) [First Sub-topic]\n* [Detailed explanation of the sub-topic. Use bullet points.]\n* [If necessary, use `inline code` to highlight technical terms.]',
      'summaryPrompt_templateSection2Content2': '2) [Second Sub-topic]\n* [Detailed explanation of the sub-topic.]',
      'summaryPrompt_templateSection3Title': '## 3. Conclusion and Final Status',
      'summaryPrompt_templateSection3Content': '* [Summary of the document\'s conclusion and final status.]\n* [If there are URLs, format them as clickable links automatically. e.g., http://127.0.0.1:5000]',
    },
};
  
export const getTranslator = (language: string) => {
    // Find the language object that matches the code
    const langKey = Object.keys(translations).find(key => key.startsWith(language.split(' ')[0])) || 'English';
    const langSet = translations[langKey] || translations['English'];
    
    return (key: string, vars?: { [key: string]: string | number }) => {
        let text = langSet[key] || key;
        if (vars) {
            Object.keys(vars).forEach(varKey => {
                text = text.replace(`{{${varKey}}}`, String(vars[varKey]));
            });
        }
        return text;
    };
};