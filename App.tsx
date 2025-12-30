
import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Zap, 
  Menu, 
  X, 
  Skull, 
  Heart,
  ShieldCheck
} from 'lucide-react';
import { AIPersona, ChatSession, Message, UserSettings } from './types';
import { CHARACTER_DETAILS } from './constants';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    userId: uuidv4(),
    enableImageGen: true,
    enableLiveSearch: true,
    activePersona: AIPersona.ZOHAIBXNO18
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedSessions = localStorage.getItem('zx18_sessions');
    const savedSettings = localStorage.getItem('zx18_settings');
    
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    } else {
      const initialId = uuidv4();
      const initialSession: ChatSession = {
        id: initialId,
        title: 'System Initialized',
        persona: AIPersona.ZOHAIBXNO18,
        messages: [{
          id: uuidv4(),
          role: 'model',
          content: "ZOHAIBXNO18 HERE’S WHAT YOU WANT MAN.",
          timestamp: Date.now()
        }],
        lastUpdated: Date.now()
      };
      setSessions([initialSession]);
      setActiveSessionId(initialId);
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zx18_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('zx18_settings', JSON.stringify(settings));
  }, [settings]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => s.persona === settings.activePersona);
  }, [sessions, settings.activePersona]);

  useEffect(() => {
    const currentActive = sessions.find(s => s.id === activeSessionId);
    if (!currentActive || currentActive.persona !== settings.activePersona) {
      setActiveSessionId(filteredSessions[0]?.id || null);
    }
  }, [settings.activePersona, sessions, activeSessionId, filteredSessions]);

  const createNewSession = (persona: AIPersona) => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'Neural link active...',
      persona: persona,
      messages: [],
      lastUpdated: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const clearAllData = () => {
    if (window.confirm("CRITICAL: DATA WIPE?")) {
      setSessions([]);
      setActiveSessionId(null);
      localStorage.removeItem('zx18_sessions');
      createNewSession(settings.activePersona);
    }
  };

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const firstUserMsg = messages.find(m => m.role === 'user');
        const title = firstUserMsg ? firstUserMsg.content.slice(0, 30) : s.title;
        return { ...s, messages, lastUpdated: Date.now(), title };
      }
      return s;
    }));
  };

  const activePersonaDetails = CHARACTER_DETAILS[settings.activePersona];

  return (
    <div className="flex h-screen bg-[#020202] text-zinc-100 overflow-hidden relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-[#050505] border-r border-white/5 transition-all duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <Sidebar 
          sessions={filteredSessions}
          activeSessionId={activeSessionId}
          onSessionSelect={(id) => { setActiveSessionId(id); setIsSidebarOpen(false); }}
          onNewChat={() => createNewSession(settings.activePersona)}
          onDeleteSession={deleteSession}
          onOpenSettings={() => setShowSettings(true)}
          currentPersona={settings.activePersona}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-[#020202]/50 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-zinc-400 md:hidden"><Menu size={24} /></button>
            
            <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 items-center gap-1.5">
              <button 
                onClick={() => setSettings(s => ({...s, activePersona: AIPersona.ZOHAIBXNO18}))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold uppercase transition-all duration-300 ${settings.activePersona === AIPersona.ZOHAIBXNO18 ? 'bg-cyan-500 text-black active-cyan scale-105 shadow-lg' : 'text-zinc-500 hover:text-cyan-400'}`}
              >
                <Zap size={14} fill="currentColor" />
                <span className="hidden sm:inline text-[11px] mono">ZX18</span>
              </button>
              
              <button 
                onClick={() => setSettings(s => ({...s, activePersona: AIPersona.EVIL_FRIEND}))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold uppercase transition-all duration-300 ${settings.activePersona === AIPersona.EVIL_FRIEND ? 'bg-red-600 text-white active-red scale-105 shadow-lg' : 'text-zinc-500 hover:text-red-500'}`}
              >
                <Skull size={14} fill="currentColor" />
                <span className="hidden sm:inline text-[11px] mono">EVIL</span>
              </button>

              <button 
                onClick={() => setSettings(s => ({...s, activePersona: AIPersona.ELLA}))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold uppercase transition-all duration-300 ${settings.activePersona === AIPersona.ELLA ? 'bg-pink-600 text-white active-pink scale-105 shadow-lg' : 'text-zinc-500 hover:text-pink-500'}`}
              >
                <Heart size={14} fill="currentColor" />
                <span className="hidden sm:inline text-[11px] mono">ELLA</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end mr-2">
                <span className={`text-[12px] font-bold mono ${activePersonaDetails.color} terminal-glow uppercase tracking-wider`}>{activePersonaDetails.name}</span>
                <span className="text-[9px] text-zinc-600 mono uppercase tracking-[0.3em]">SECURE LINK ACTIVE</span>
             </div>
             <button onClick={() => setShowSettings(true)} className="p-3 text-zinc-500 hover:text-white border border-white/5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 transition-all"><Settings size={20} /></button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {activeSessionId ? (
            <ChatArea 
              session={sessions.find(s => s.id === activeSessionId)!}
              settings={settings}
              onMessagesUpdate={(msgs) => updateSessionMessages(activeSessionId, msgs)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
              <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center mb-8 shadow-2xl">
                <ShieldCheck size={48} className="text-zinc-800" />
              </div>
              <h2 className={`text-2xl font-bold mb-4 mono uppercase tracking-tight ${activePersonaDetails.color}`}>{activePersonaDetails.name} SECTOR</h2>
              <button 
                onClick={() => createNewSession(settings.activePersona)}
                className="px-12 py-5 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase text-sm tracking-widest"
              >
                New Neural Thread
              </button>
            </div>
          )}
        </main>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowSettings(false)} />
          <div className="relative w-full max-w-sm glass-obsidian rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
              <h2 className="text-[10px] font-black mono text-zinc-500 uppercase tracking-[0.4em]">SYSTEM ROOT</h2>
              <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/40 border border-white/5">
                <span className="text-xs font-bold uppercase mono tracking-widest text-zinc-400">Synthesis</span>
                <input type="checkbox" checked={settings.enableImageGen} onChange={(e) => setSettings({ ...settings, enableImageGen: e.target.checked })} className="w-10 h-5 bg-zinc-800 rounded-full appearance-none checked:bg-cyan-500 relative transition-all cursor-pointer after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-3 after:h-3 after:rounded-full after:transition-all checked:after:left-6 shadow-inner" />
              </div>

              <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/40 border border-white/5">
                <span className="text-xs font-bold uppercase mono tracking-widest text-zinc-400">Live Intel</span>
                <input type="checkbox" checked={settings.enableLiveSearch} onChange={(e) => setSettings({ ...settings, enableLiveSearch: e.target.checked })} className="w-10 h-5 bg-zinc-800 rounded-full appearance-none checked:bg-cyan-500 relative transition-all cursor-pointer after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-3 after:h-3 after:rounded-full after:transition-all checked:after:left-6 shadow-inner" />
              </div>

              <button onClick={clearAllData} className="w-full p-5 rounded-2xl bg-red-950/20 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all font-bold text-[10px] uppercase tracking-[0.3em]">Full Wipe</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
