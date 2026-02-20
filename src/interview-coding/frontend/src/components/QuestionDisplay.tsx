'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Lightbulb, Clock, MemoryStick } from 'lucide-react';
import { HintType } from '@/lib/types';
import type { QuestionDisplayProps, Question, Difficulty } from '@/lib/types';

// Mock question data for development
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
      content: 'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it\'s best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.',
      type: HintType.APPROACH
    },
    {
      level: 2,
      content: 'So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter. Can we change our array somehow so that this search becomes faster?',
      type: HintType.APPROACH
    },
    {
      level: 3,
      content: 'The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?',
      type: HintType.IMPLEMENTATION
    }
  ],
  timeLimit: 60,
  memoryLimit: 256
};

export function QuestionDisplay({
  question = mockQuestion,
  showHints = true,
  hintsRevealed = 0,
  onRequestHint
}: QuestionDisplayProps) {
  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: Difficulty) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <Card className="h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{question.title}</h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
            {getDifficultyText(question.difficulty)}
          </span>
        </div>
        
        {(question.timeLimit || question.memoryLimit) && (
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {question.timeLimit && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{question.timeLimit} min</span>
              </div>
            )}
            {question.memoryLimit && (
              <div className="flex items-center gap-1">
                <MemoryStick className="h-4 w-4" />
                <span>{question.memoryLimit} MB</span>
              </div>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Problem Description */}
          <div>
            <h3 className="font-medium mb-2">Problem Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {question.description}
            </p>
          </div>

          <Separator />

          {/* Examples */}
          <div>
            <h3 className="font-medium mb-3">Examples</h3>
            <div className="space-y-4">
              {question.examples.map((example, index) => (
                <div key={index} className="bg-muted p-3 rounded-lg">
                  <div className="font-medium text-sm mb-2">Example {index + 1}:</div>
                  <div className="space-y-1 text-sm font-mono">
                    <div><span className="text-muted-foreground">Input:</span> {example.input}</div>
                    <div><span className="text-muted-foreground">Output:</span> {example.output}</div>
                    {example.explanation && (
                      <div className="mt-2 text-xs text-muted-foreground font-sans">
                        <span className="font-medium">Explanation:</span> {example.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Constraints */}
          <div>
            <h3 className="font-medium mb-3">Constraints</h3>
            <ul className="space-y-1">
              {question.constraints.map((constraint, index) => (
                <li key={index} className="text-sm text-muted-foreground font-mono">
                  • {constraint}
                </li>
              ))}
            </ul>
          </div>

          {/* Hints Section */}
          {showHints && question.hints.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Hints ({hintsRevealed}/{question.hints.length})
                  </h3>
                  {hintsRevealed < question.hints.length && onRequestHint && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRequestHint}
                      className="text-xs"
                    >
                      Get Hint {hintsRevealed + 1}
                    </Button>
                  )}
                </div>
                
                {hintsRevealed > 0 && (
                  <div className="space-y-3">
                    {question.hints.slice(0, hintsRevealed).map((hint, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600 uppercase">
                            Hint {hint.level} - {hint.type}
                          </span>
                        </div>
                        <p className="text-sm text-blue-800">{hint.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {hintsRevealed === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No hints revealed yet. Click &quot;Get Hint&quot; when you need help!
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}