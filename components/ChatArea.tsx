import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Send, Image as ImageIcon, Sparkles, Loader2, ArrowDownCircle } from 'lucide-react';
import { ChatSession, Message, UserSettings } from '../types';
import MessageItem from './MessageItem';
import { GeminiService } from '../services/geminiService';

interface ChatAreaProps {
  session: ChatSession;
  settings: UserSettings;
  onMessagesUpdate: (messages: Message[]) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ session, settings, onMessagesUpdate }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Instantiating the service safely within the component
  const gemini = useMemo(() => new GeminiService(), []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom('auto');
  }, [session.id, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, scrollToBottom]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isAtBottom);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const updatedWithUser = [...session.messages, userMessage];
    onMessagesUpdate(updatedWithUser);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const imageTriggerWords = ['generate image of', 'show me a picture of', 'create an image of', 'display image', 'make a photo', 'photo bnao'];
      const shouldGenImage = settings.enableImageGen && imageTriggerWords.some(word => currentInput.toLowerCase().includes(word));

      if (shouldGenImage) {
        const imageUrl = await gemini.generateImage(currentInput);
        const aiMessage: Message = {
          id: uuidv4(),
          role: 'model',
          content: "System: Visual synthesis complete. ⚡ Check it out.",
          imageUrl,
          timestamp: Date.now()
        };
        onMessagesUpdate([...updatedWithUser, aiMessage]);
      } else {
        const aiMessageId = uuidv4();
        let streamText = "";
        let streamLinks: { title: string; uri: string }[] | undefined;

        const stream = gemini.generateChatStream(
          session.persona,
          updatedWithUser,
          currentInput,
          settings.enableLiveSearch
        );

        for await (const chunk of stream) {
          setIsTyping(false); 
          streamText = chunk.text;
          streamLinks = chunk.groundingLinks;
          
          const aiMessage: Message = {
            id: aiMessageId,
            role: 'model',
            content: streamText,
            timestamp: Date.now(),
            groundingLinks: streamLinks
          };
          onMessagesUpdate([...updatedWithUser, aiMessage]);
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'model',
        content: "CRITICAL ERROR: Connection severed. Retrying uplink...",
        timestamp: Date.now()
      };
      onMessagesUpdate([...updatedWithUser, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] relative">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-12 space-y-5 scroll-smooth"
      >
        {session.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-5 opacity-10 select-none pointer-events-none">
            <Sparkles size={48} />
            <p className="text-xs font-bold mono tracking-[0.5em] uppercase">LINK IDLE</p>
          </div>
        ) : (
          session.messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} persona={session.persona} />
          ))
        )}
        
        {isTyping && (
          <div className="flex items-start gap-4 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center flex-shrink-0">
              <Loader2 size={12} className="text-zinc-600 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {showScrollBottom && (
        <button 
          onClick={() => scrollToBottom()}
          className="absolute bottom-28 right-6 p-3 bg-zinc-900/90 backdrop-blur-2xl rounded-xl border border-white/10 text-zinc-400 shadow-2xl hover:text-white transition-all z-20"
        >
          <ArrowDownCircle size={18} />
        </button>
      )}

      <div className="p-4 md:p-6 bg-gradient-to-t from-[#020202] via-[#020202] to-transparent">
        <form 
          onSubmit={handleSend}
          className="max-w-3xl mx-auto relative group"
        >
          <div className="relative flex items-end gap-3 p-2 pl-4 pr-2 input-glass rounded-2xl shadow-2xl transition-all focus-within:border-white/20 focus-within:bg-[#121212]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Inject command..."
              className="flex-1 bg-transparent py-3 px-0 text-zinc-100 placeholder:text-zinc-700 focus:outline-none resize-none max-h-36 min-h-[44px] mono text-[13px] leading-relaxed"
              rows={1}
            />
            
            <div className="flex items-center gap-1.5 self-end pb-1.5">
              <button
                type="button"
                className={`p-2 rounded-xl transition-all ${settings.enableImageGen ? 'text-cyan-500 hover:text-cyan-400' : 'text-zinc-700'}`}
              >
                <ImageIcon size={18} />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className={`p-2.5 rounded-xl transition-all ${
                  input.trim() && !isTyping 
                    ? 'bg-zinc-100 text-black hover:scale-105 active:scale-95' 
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <div className="mt-2 text-center">
            <span className="text-[8px] mono text-zinc-800 uppercase tracking-[0.4em]">ZOHAIB X NO 18 Terminal • Encryption Active</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;