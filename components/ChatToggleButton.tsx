'use client';

import React from 'react';
import { Button } from './ui/button';
import { MessageCircle, X } from 'lucide-react';
import { useChat } from './ChatProvider';

export function ChatToggleButton() {
  const { isOpen, toggleChat, messages } = useChat();
  
  const unreadCount = messages.filter(msg => msg.type === 'assistant').length;

  return (
    <Button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg border-0"
      size="lg"
    >
      {isOpen ? (
        <X className="w-6 h-6 text-white" />
      ) : (
        <div className="relative">
          <MessageCircle className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      )}
    </Button>
  );
}