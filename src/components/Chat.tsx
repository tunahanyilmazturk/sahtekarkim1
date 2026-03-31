import { useState, useRef, useEffect, type FormEvent, type RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Smile } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Message } from '../types';

interface ChatProps {
  messages: Message[];
  playerId?: string;
  inputRef?: RefObject<HTMLDivElement | null>;
  canChat: boolean;
  placeholder: string;
  onSendMessage: (text: string) => void;
}

const QUICK_EMOJIS = ['👍', '👎', '❤️', '😂', '😮', '🎉', '🔥', '💯'];

export function Chat({ messages, playerId, inputRef, canChat, placeholder, onSendMessage }: ChatProps) {
  const [input, setInput] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRefInternal = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canChat) return;
    onSendMessage(input);
    setInput('');
  };

  const addEmoji = (emoji: string) => {
    setInput(input + emoji);
    setShowEmojis(false);
    inputRefInternal.current?.focus();
  };

  return (
    <>
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-zinc-50 to-zinc-100">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => {
            const isMe = msg.playerId === playerId;
            const isSystem = msg.isSystem;

            if (isSystem) {
              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-center my-4"
                >
                  <div className="bg-zinc-200/70 text-zinc-600 px-4 py-2 rounded-full text-xs font-bold text-center max-w-[85%] backdrop-blur-sm">
                    {msg.text}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
              >
                {!isMe && (
                  <span className="text-[11px] font-bold text-zinc-400 ml-2 mb-1">{msg.playerAvatar} {msg.playerName}</span>
                )}
                <div className={cn(
                  "max-w-[85%] px-4 py-3 text-[15px] font-medium shadow-sm",
                  isMe 
                    ? "bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl rounded-tr-sm" 
                    : "bg-white border border-zinc-200 text-zinc-900 rounded-2xl rounded-tl-sm"
                )}>
                  {msg.text}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={inputRef} />
      </div>

      {showEmojis && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-2 bg-zinc-50 border-t border-zinc-100 flex gap-2 overflow-x-auto"
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="text-2xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}

      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-zinc-100 shrink-0 pb-safe">
        <form onSubmit={handleSubmit} className="flex gap-3 items-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmojis(!showEmojis)}
            className="w-14 h-14 shrink-0 bg-zinc-100 text-zinc-600 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <Smile className="w-6 h-6" />
          </motion.button>
          <input
            type="text"
            ref={inputRefInternal}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={!canChat}
            className="flex-1 px-5 py-4 rounded-2xl bg-zinc-100 border-2 border-transparent focus:bg-white focus:border-zinc-900 focus:ring-0 transition-all font-medium outline-none disabled:opacity-50 text-[16px]"
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || !canChat}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-14 h-14 shrink-0 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-zinc-900/15"
          >
            <Send className="w-6 h-6" />
          </motion.button>
        </form>
      </div>
    </>
  );
}
