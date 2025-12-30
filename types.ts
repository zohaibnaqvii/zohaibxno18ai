
export enum AIPersona {
  ZOHAIBXNO18 = 'ZOHAIBXNO18',
  EVIL_FRIEND = 'EVIL_FRIEND',
  ELLA = 'ELLA'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  imageUrl?: string;
  groundingLinks?: { title: string; uri: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  persona: AIPersona;
  messages: Message[];
  lastUpdated: number;
}

export interface UserSettings {
  userId: string;
  enableImageGen: boolean;
  enableLiveSearch: boolean;
  activePersona: AIPersona;
}
