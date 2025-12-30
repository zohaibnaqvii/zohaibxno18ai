
import React from 'react';
import { ExternalLink, User } from 'lucide-react';
import { Message, AIPersona } from '../types';
import { CHARACTER_DETAILS } from '../constants';

interface MessageItemProps {
  message: Message;
  persona: AIPersona;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, persona }) => {
  const isUser = message.role === 'user';
  const char = CHARACTER_DETAILS[persona];
  const isElla = persona === AIPersona.ELLA;

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group w-full animate-in fade-in slide-in-from-bottom-2 duration-200`}>
      <div className={`flex gap-3 max-w-[95%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all shadow-lg ${isUser ? 'bg-zinc-800 border-white/5' : `bg-[#080808] ${char.borderColor}`}`}>
          {isUser ? <User size={14} className="text-zinc-500" /> : <span className="text-base leading-none">{char.icon}</span>}
        </div>

        <div className="space-y-1.5 w-full">
          <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed transition-all tracking-tight ${isUser ? 'bg-zinc-100 text-black font-semibold rounded-tr-none' : `bg-[#0f0f0f] text-zinc-100 border border-white/5 rounded-tl-none ${isElla ? 'shadow-[0_0_20px_rgba(236,72,153,0.05)]' : ''}`}`}>
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
            
            {message.groundingLinks && message.groundingLinks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                {message.groundingLinks.map((link, idx) => (
                  <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-all bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                    <ExternalLink size={9} /> {link.title}
                  </a>
                ))}
              </div>
            )}
          </div>

          {message.imageUrl && (
            <div className="mt-2 rounded-2xl overflow-hidden border border-white/5 shadow-2xl max-w-sm group/img relative">
              <img src={message.imageUrl} alt="Render" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-2 bg-black/80 backdrop-blur-md border-t border-white/5 flex justify-between items-center translate-y-full group-hover/img:translate-y-0 transition-transform duration-300">
                 <span className="text-[8px] mono uppercase text-zinc-500">Render complete</span>
                 <a href={message.imageUrl} download className="text-[8px] font-bold uppercase bg-white text-black px-3 py-1 rounded-md active:scale-95 transition-all">Save</a>
              </div>
            </div>
          )}

          <div className={`px-1 text-[8px] text-zinc-600 mono uppercase tracking-[0.2em] ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {!isUser && <span className={`ml-2 font-bold ${char.color} terminal-glow`}>// {char.name}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
