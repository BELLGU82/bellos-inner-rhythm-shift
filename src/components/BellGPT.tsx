
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Mic, Clock, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import NeumorphButton from './NeumorphButton';
import { cn } from '@/lib/utils';
import { sendToBellGpt, generateSessionId } from '@/utils/bellGptApi';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
};

const BellGPT = () => {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: t('welcome_back'),
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session ID on component mount
  useEffect(() => {
    setSessionId(generateSessionId());
  }, []);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Add loading message placeholder
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true,
    };
    
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    const currentInput = inputValue;
    setInputValue('');
    
    try {
      const response = await sendToBellGpt(currentInput, sessionId);
      
      // Replace loading message with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading 
            ? {
                id: msg.id,
                content: response.response,
                sender: 'ai',
                timestamp: new Date(),
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      // Handle error
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading 
            ? {
                id: msg.id,
                content: "Sorry, I couldn't process that request. Please try again.",
                sender: 'ai',
                timestamp: new Date(),
                isLoading: false,
              }
            : msg
        )
      );
    }
  };

  const handleActNow = (message: Message) => {
    // For now just log the action
    console.log("Act Now on:", message.content);
    // In a real implementation, this would convert the message to a task or calendar event
  };

  const handleSendToInbox = (message: Message) => {
    // For now just log the action
    console.log("Send to Inbox:", message.content);
    // In a real implementation, this would send the content to the Inbox component
  };

  return (
    <>
      {/* Floating button */}
      <button 
        onClick={toggleOpen}
        className={cn(
          "fixed z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-neumorph bg-bell-primary text-white transition-all duration-300",
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100",
          "hover:shadow-neumorph-sm",
          isRTL ? "left-4 bottom-20" : "right-4 bottom-20"
        )}
        aria-label={t('ask')}
      >
        <MessageSquare size={20} />
      </button>
      
      {/* Sliding panel */}
      <div 
        className={cn(
          "fixed z-50 top-0 h-screen w-80 md:w-96 bg-bell-background shadow-neumorph transition-all duration-300 ease-in-out",
          isRTL 
            ? "right-0 transform translate-x-full rounded-l-2xl" 
            : "right-0 transform translate-x-full rounded-l-2xl",
          isOpen && (isRTL 
            ? "transform translate-x-0" 
            : "transform translate-x-0")
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bell-muted">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-bell-primary" />
            <h2 className="text-lg font-bold">{t('ask')}</h2>
          </div>
          <button 
            onClick={toggleOpen}
            className="p-2 rounded-full hover:bg-bell-subtle transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Messages Container */}
        <div className="flex flex-col h-[calc(100vh-136px)] overflow-y-auto p-4 gap-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={cn(
                "max-w-[85%] p-3 rounded-lg animate-fade-in",
                message.sender === 'user' 
                  ? "self-end bg-bell-primary text-white" 
                  : "self-start neumorph-sm"
              )}
            >
              {message.isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-bell-muted rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-bell-muted rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-bell-muted rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              ) : (
                <>
                  <p>{message.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    
                    {message.sender === 'ai' && (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleSendToInbox(message)}
                          className="text-xs text-bell-muted hover:text-bell-primary"
                          title={t('send_to_inbox')}
                        >
                          <Clock size={14} />
                        </button>
                        <button 
                          onClick={() => handleActNow(message)}
                          className="text-xs text-bell-muted hover:text-bell-primary"
                          title={t('act_now')}
                        >
                          <CheckCircle size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t border-bell-muted">
          <button 
            type="button"
            className="p-2 rounded-full text-bell-muted hover:text-bell-primary transition-colors"
            aria-label="Voice Input"
          >
            <Mic size={20} />
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`${t('ask')}...`}
            className="flex-1 p-2 rounded-lg shadow-neumorph-inner bg-transparent focus:outline-none"
          />
          
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className={cn(
              "p-2 rounded-full transition-colors",
              inputValue.trim() 
                ? "text-bell-primary hover:bg-bell-subtle" 
                : "text-bell-muted"
            )}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
      
      {/* Overlay when open on mobile */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 md:opacity-0 md:pointer-events-none" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleOpen}
      />
    </>
  );
};

export default BellGPT;
