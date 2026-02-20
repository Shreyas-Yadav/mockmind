'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/CodeEditor';
import { ChatPanel } from '@/components/ChatPanel';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { MessageType, MessageSender, HintType } from '@/lib/types';
import type { Message, Question, Difficulty } from '@/lib/types';

// Mock data for development
const mockQuestion: Question = {
  id: 'two-sum',
  title: 'Two Sum',
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  difficulty: 'easy' as Difficulty,
  constraints: [
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    '-10^9 <= target <= 10^9',
    'Only one valid answer exists.'
  ],
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]'
    },
    {
      input: 'nums = [3,3], target = 6',
      output: '[0,1]'
    }
  ],
  testCases: [],
  hints: [
    {
      level: 1,
      content: 'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
      type: HintType.APPROACH
    },
    {
      level: 2,
      content: 'Can we use a hash map to speed up the search?',
      type: HintType.IMPLEMENTATION
    }
  ],
  timeLimit: 60,
  memoryLimit: 256
};

const initialCode = `def two_sum(nums, target):
    """
    Find two numbers that add up to target.
    
    Args:
        nums: List of integers
        target: Target sum
        
    Returns:
        List of two indices
    """
    # Write your solution here
    pass
`;

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [code, setCode] = useState(initialCode);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: MessageType.TEXT,
      content: 'Welcome to your coding interview! I\'ve loaded the problem for you. Take your time to read through it, and feel free to ask any clarifying questions.',
      timestamp: new Date().toISOString(),
      sender: MessageSender.AGENT
    }
  ]);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Validate session on mount
  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }
    
    // In a real implementation, we would validate the session with the backend
    console.log('Interview session started:', sessionId);
  }, [sessionId, router]);

  const handleSendMessage = (content: string, type: MessageType) => {
    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      type,
      content,
      timestamp: new Date().toISOString(),
      sender: MessageSender.USER
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    
    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: `msg_${Date.now()}_agent`,
        type: MessageType.TEXT,
        content: 'That\'s a great question! Let me help you with that. In a real interview, I would provide contextual guidance based on your question.',
        timestamp: new Date().toISOString(),
        sender: MessageSender.AGENT
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setIsChatLoading(false);
    }, 1500);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    
    // Simulate code execution
    setTimeout(() => {
      const executionMessage: Message = {
        id: `msg_${Date.now()}_exec`,
        type: MessageType.SYSTEM,
        content: 'Code execution completed. In a real implementation, this would show test results and feedback.',
        timestamp: new Date().toISOString(),
        sender: MessageSender.SYSTEM
      };
      
      setMessages(prev => [...prev, executionMessage]);
      setIsRunning(false);
    }, 2000);
  };

  const handleRequestHint = () => {
    if (hintsRevealed < mockQuestion.hints.length) {
      setHintsRevealed(prev => prev + 1);
      
      const hintMessage: Message = {
        id: `msg_${Date.now()}_hint`,
        type: MessageType.HINT,
        content: `Hint ${hintsRevealed + 1}: ${mockQuestion.hints[hintsRevealed].content}`,
        timestamp: new Date().toISOString(),
        sender: MessageSender.AGENT
      };
      
      setMessages(prev => [...prev, hintMessage]);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your code? This cannot be undone.')) {
      setCode(initialCode);
    }
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit the interview? Your progress will be saved.')) {
      router.push('/');
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      {/* Header */}
      <header className="shrink-0 bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExit}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit Interview
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-lg font-semibold">Coding Interview Session</h1>
              <p className="text-xs text-muted-foreground">Session ID: {sessionId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Code
            </Button>
            <Button
              size="sm"
              onClick={handleRunCode}
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Code
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 min-h-0 p-4 pb-8">
        <div className="h-full grid grid-cols-12 gap-4">
          {/* Left Panel - Question Display */}
          <div className="col-span-4 min-h-0">
            <QuestionDisplay
              question={mockQuestion}
              showHints={true}
              hintsRevealed={hintsRevealed}
              onRequestHint={handleRequestHint}
            />
          </div>

          {/* Middle Panel - Code Editor */}
          <div className="col-span-5 min-h-0">
            <CodeEditor
              value={code}
              onChange={setCode}
              language="python"
              theme="vs-dark"
            />
          </div>

          {/* Right Panel - Chat */}
          <div className="col-span-3 min-h-0">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
