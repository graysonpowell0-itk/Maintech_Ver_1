
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Camera, Sparkles, Image as ImageIcon, MinusCircle, ChevronDown, Globe } from 'lucide-react';
import { ChatMessage, sendMessageToAssistant } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const MaintenanceAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize welcome message when language or open state changes, only if empty
  useEffect(() => {
     if(messages.length === 0) {
         setMessages([{ role: 'model', text: t.chatIntro }]);
     }
  }, [t.chatIntro]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      image: attachedImage ? attachedImage.split(',')[1] : undefined // Remove data url prefix for storage/sending
    };

    // Optimistic UI update
    setMessages(prev => [...prev, { ...userMsg, image: attachedImage || undefined }]); // Store full data url for local preview
    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    const apiHistory = messages.map(m => ({
        role: m.role,
        text: m.text,
        image: m.image?.startsWith('data:') ? m.image.split(',')[1] : m.image
    }));

    const responseText = await sendMessageToAssistant(
      apiHistory, 
      userMsg.text, 
      userMsg.image, // This is already stripped
      language
    );

    setIsLoading(false);
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isOpen ? 'bg-white text-[#2a313d]' : 'bg-[#2a313d] text-white border-2 border-[#1d98d2]'
        }`}
      >
         {isOpen ? <X size={24} /> : <Sparkles size={24} className="text-[#1d98d2]" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-[#d4d5da] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#2a313d] text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1d98d2] flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{t.assistantTitle}</h3>
                  <p className="text-[10px] text-gray-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#87b21e]"></span> {t.online}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                    <MinusCircle size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#1d98d2] text-white rounded-br-none' 
                      : 'bg-white text-[#2a313d] border border-gray-200 rounded-bl-none'
                  }`}>
                    {msg.image && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                         {/* Handle both raw base64 (from history) and data url (local state) */}
                         <img 
                           src={msg.image.startsWith('data:') ? msg.image : `data:image/jpeg;base64,${msg.image}`} 
                           alt="Upload" 
                           className="w-full h-auto object-cover max-h-40" 
                         />
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                   <div className="bg-white text-[#2a313d] border border-gray-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2">
                     <div className="w-2 h-2 bg-[#1d98d2] rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-[#1d98d2] rounded-full animate-bounce delay-100"></div>
                     <div className="w-2 h-2 bg-[#1d98d2] rounded-full animate-bounce delay-200"></div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
              {attachedImage && (
                <div className="mb-2 relative inline-block">
                  <img src={attachedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                  <button 
                    onClick={() => setAttachedImage(null)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                 <button 
                   type="button" 
                   onClick={() => fileInputRef.current?.click()}
                   className="p-2 text-gray-400 hover:text-[#1d98d2] hover:bg-gray-50 rounded-xl transition-colors"
                 >
                   <Camera size={22} />
                 </button>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleImageSelect}
                 />
                 
                 <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#1d98d2]/20 transition-all">
                    <input
                      type="text"
                      className="w-full bg-transparent border-none outline-none text-sm text-[#2a313d]"
                      placeholder={t.chatPlaceholder}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                 </div>
                 
                 <button 
                   type="submit" 
                   disabled={!input.trim() && !attachedImage}
                   className="p-2 bg-[#1d98d2] text-white rounded-xl shadow-md hover:bg-[#158bbd] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                   <Send size={20} />
                 </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MaintenanceAssistant;
