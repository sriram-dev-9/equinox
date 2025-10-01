'use client';

import React from 'react';
import { ChatInterface } from './ChatInterface';
import { useChat } from './ChatProvider';
import { Button } from './ui/button';
import { X } from 'lucide-react';

export function ChatSidebar() {
  const { isOpen, toggleChat } = useChat();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleChat}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-gray-950 border-l border-gray-800 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:w-96
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
          <Button
            onClick={toggleChat}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="h-[calc(100vh-5rem)]">
          <ChatInterface />
        </div>
      </div>
    </>
  );
}