'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Brain, Mic, CheckCircle } from 'lucide-react';
import type { Difficulty } from '@/lib/types';

export default function HomePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const difficulties = [
    {
      level: 'easy' as Difficulty,
      title: 'Easy',
      description: 'Perfect for beginners or warming up',
      color: 'border-green-200 hover:border-green-300 bg-green-50',
      textColor: 'text-green-700',
      examples: ['Two Sum', 'Valid Parentheses', 'Merge Two Sorted Lists']
    },
    {
      level: 'medium' as Difficulty,
      title: 'Medium',
      description: 'Standard interview difficulty',
      color: 'border-yellow-200 hover:border-yellow-300 bg-yellow-50',
      textColor: 'text-yellow-700',
      examples: ['Add Two Numbers', 'Longest Substring', 'Binary Tree Traversal']
    },
    {
      level: 'hard' as Difficulty,
      title: 'Hard',
      description: 'Advanced algorithms and data structures',
      color: 'border-red-200 hover:border-red-300 bg-red-50',
      textColor: 'text-red-700',
      examples: ['Median of Two Arrays', 'Serialize Binary Tree', 'Word Ladder II']
    }
  ];

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'AI Interview Assistant',
      description: 'Get guided through problems with intelligent hints and feedback'
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'Real-time Code Execution',
      description: 'Test your solutions instantly with our secure sandbox environment'
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: 'Voice Interaction',
      description: 'Practice explaining your approach with natural voice conversation'
    }
  ];

  const handleCreateSession = async () => {
    if (!selectedDifficulty) return;
    
    setIsCreating(true);
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/sessions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ difficulty: selectedDifficulty })
      // });
      // const data = await response.json();
      // const sessionId = data.session.id;
      
      // Mock session creation for now
      const mockSessionId = `session_${Date.now()}_${selectedDifficulty}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to interview page
      router.push(`/interview/${mockSessionId}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create interview session. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MockMind Coding Interview
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Practice coding interviews with our AI-powered platform. Get real-time feedback, 
            hints, and improve your problem-solving skills.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="flex justify-center mb-4 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Difficulty Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Choose Your Challenge Level</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {difficulties.map((difficulty) => (
              <Card
                key={difficulty.level}
                className={`p-6 cursor-pointer transition-all duration-200 ${difficulty.color} ${
                  selectedDifficulty === difficulty.level 
                    ? 'ring-2 ring-blue-500 ring-offset-2' 
                    : ''
                }`}
                onClick={() => setSelectedDifficulty(difficulty.level)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${difficulty.textColor}`}>
                    {difficulty.title}
                  </h3>
                  {selectedDifficulty === difficulty.level && (
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                
                <p className="text-gray-700 mb-4">{difficulty.description}</p>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Example problems:</p>
                  {difficulty.examples.map((example, index) => (
                    <p key={index} className="text-sm text-gray-500">• {example}</p>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button
              onClick={handleCreateSession}
              disabled={!selectedDifficulty || isCreating}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Session...
                </>
              ) : (
                'Start Interview'
              )}
            </Button>
            
            {selectedDifficulty && (
              <p className="text-sm text-gray-600 mt-2">
                Starting a <span className="font-medium">{selectedDifficulty}</span> level interview
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p className="text-sm">
            MockMind Interview Platform • Practice makes perfect
          </p>
        </div>
      </div>
    </div>
  );
}