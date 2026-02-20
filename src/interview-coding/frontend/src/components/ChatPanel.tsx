'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, Bot, User } from 'lucide-react';
import type { ChatPanelProps, Message, MessageType, MessageSender } from '@/lib/types';

// Mock interview data for development
const mockMessages: Message[] = [
  {
    id: '1',
    type: 'text' as MessageType,
    content: 'Hello! I\'m your coding interview assistant. I\'ll be guiding you through today\'s coding challenge. Are you ready to begin?',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    sender: 'agent' as MessageSender
  },
  {
    id: '2',
    type: 'text' as MessageType,
    content: 'Yes, I\'m ready! What\'s the problem we\'ll be working on?',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    sender: 'user' as MessageSender
  },
  {
    id: '3',
    type: 'text' as MessageType,
    content: 'Great! Today we\'ll be working on a classic algorithm problem. Take a look at the problem statement on the right. Feel free to ask any clarifying questions before you start coding.',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    sender: 'agent' as MessageSender
  }
];

export function ChatPanel({
  messages = mockMessages,
  onSendMessage,
  isLoading = false,
  disabled = false
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim(), 'text' as MessageType);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSenderIcon = (sender: MessageSender) => {
    switch (sender) {
      case 'agent':
        return <Bot className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getSenderName = (sender: MessageSender) => {
    switch (sender) {
      case 'agent':
        return 'Interview Assistant';
      case 'user':
        return 'You';
      default:
        return 'System';
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium">Interview Chat</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={message.id} className="space-y-2">
              <div className={`flex items-start gap-3 ${
                message.sender === 'user' ? 'flex-row-reverse' : ''
              }`}>
                <div className={`flex items-center gap-2 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}>
                  <div className={`p-2 rounded-full ${
                    message.sender === 'agent' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {getSenderIcon(message.sender)}
                  </div>
                </div>
                
                <div className={`flex-1 space-y-1 ${
                  message.sender === 'user' ? 'text-right' : ''
                }`}>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{getSenderName(message.sender)}</span>
                    <span>•</span>
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                  
                  <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
              
              {index < messages.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Interview Assistant</span>
                  <span>•</span>
                  <span>typing...</span>
                </div>
                <div className="inline-block p-3 rounded-lg bg-muted">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            disabled={disabled}
            className="min-h-[60px] resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled || isLoading}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}