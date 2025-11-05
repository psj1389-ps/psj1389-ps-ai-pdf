
export enum AppState {
    IDLE = 'idle',
    PROCESSING = 'processing',
    CHAT = 'chat',
}

export interface PdfFile {
    name: string;
    url: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}
