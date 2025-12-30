
import React from 'react';
import { Plus, Trash2, Settings, Shield, Skull, Zap, Heart } from 'lucide-react';
import { ChatSession, AIPersona } from '../types';
import { CHARACTER_DETAILS } from '../constants';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (id: string) => void;
  onNewChat: (persona?: AIPersona) => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  currentPersona: AIPersona;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  onOpenSettings,
  currentPersona
}) => {
  const char = CHARACTER_DETAILS[currentPersona];

  return (
    <div className="h-full flex flex-col bg-[#080808] border-r border-white/5">
      {/* Sidebar Header */}
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-black border ${char.borderColor} flex items-center justify-center shadow-xl`}>
             <span className="text-2xl">{char.icon}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tighter mono italic text-white leading-none">CORE-X</span>
            <span className={`text-[9px] mono font-bold uppercase tracking-[0.2em] ${char.color} mt-1`}>{char.name} Sector</span>
          </div>
        </div>
        
        <button 
          onClick={() => onNewChat(currentPersona)}
          className={`w-full group flex items-center justify-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-all active:scale-95 shadow-inner`}
        >
          <Plus size={20} className={`${char.color}`} />
          <span className="font-black text-[12px] uppercase tracking-[0.15em] mono">New Record</span>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3">
        <div className="flex items-center justify-between px-3 mb-4">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] mono">Local Logs</p>
          <span className={`text-[10px] mono px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-gray-500`}>{sessions.length}</span>
        </div>
        
        {sessions.length === 0 ? (
          <div className="px-3 py-16 text-center opacity-30 select-none">
            <p className="text-[11px] text-gray-600 mono uppercase animate-pulse">Scanning DB...</p>
            <p className="text-[9px] text-gray-800 mono uppercase mt-3">No sessions recovered</p>
          </div>
        ) : (
          sessions.map(session => (
            <div 
              key={session.id}
              className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all relative cursor-pointer ${
                activeSessionId === session.id 
                  ? `bg-white/[0.05] border-white/10 text-white ${char.glowColor}` 
                  : 'text-gray-500 border-transparent hover:bg-white/[0.03] hover:text-gray-400'
              }`}
              onClick={() => onSessionSelect(session.id)}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] font-bold truncate pr-6 mono tracking-tight ${activeSessionId === session.id ? 'text-white' : ''}`}>
                   {session.title || 'Untitled Session'}
                </p>
                <p className="text-[9px] text-gray-700 mono uppercase mt-1">
                   {new Date(session.lastUpdated).toLocaleDateString()} • {session.id.slice(0, 8)}
                </p>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className={`absolute right-4 opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-xl`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Area */}
      <div className="p-8 border-t border-white/5 space-y-3">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-600 hover:text-white hover:bg-white/5 transition-all mono text-[11px] uppercase font-bold tracking-widest"
        >
          <Settings size={18} />
          Terminal Root
        </button>
        <div className="flex justify-center pt-3 border-t border-white/5">
           <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[8px] mono text-gray-700 uppercase tracking-[0.25em]">Link Encryption: Active</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
