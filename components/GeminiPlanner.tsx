import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader } from 'lucide-react';
import { generateSchedule } from '../services/geminiService';
import { Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface GeminiPlannerProps {
  onPlanGenerated: (tasks: Task[]) => void;
}

const GeminiPlanner: React.FC<GeminiPlannerProps> = ({ onPlanGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setRetryCount(0);

    const attemptGeneration = async (attempt: number = 1): Promise<void> => {
      try {
        const result = await generateSchedule(prompt);

        if (!Array.isArray(result) || result.length === 0) {
          throw new Error('No tasks were generated. Please try a more detailed prompt.');
        }

        // Validate and transform raw JSON to Task objects with IDs
        const newTasks: Task[] = result
          .filter((item: any) => item && typeof item === 'object' && item.title && item.category)
          .map((item: any) => ({
            id: uuidv4(),
            title: String(item.title).trim(),
            category: item.category,
            startTime: Number(item.startTime),
            endTime: Number(item.endTime),
            notes: item.notes ? String(item.notes).trim() : undefined,
            completed: false,
            energyLevel: 2
          }));

        if (newTasks.length === 0) {
          throw new Error('Generated tasks were invalid. Please try again.');
        }

        onPlanGenerated(newTasks);
        setIsOpen(false);
        setPrompt('');
        setRetryCount(0);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';

        if (attempt < 2 && (
          errorMessage.includes('API_KEY') ||
          errorMessage.includes('network') ||
          errorMessage.includes('timeout')
        )) {
          setRetryCount(attempt);
          // Wait 1 second before retry
          setTimeout(() => attemptGeneration(attempt + 1), 1000);
          return;
        }

        setError(`${errorMessage}${attempt > 1 ? ` (Attempted ${attempt} times)` : ''}`);
        throw err;
      }
    };

    try {
      await attemptGeneration();
    } catch (err) {
      // Error already handled in attemptGeneration
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-30 p-3 bg-neutral-800/80 backdrop-blur-md text-primary rounded-full hover:bg-neutral-700 transition-colors border border-neutral-700 shadow-lg"
      >
        <Sparkles size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-surface border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white"
        >
          <Loader size={20} className={loading ? "animate-spin" : "opacity-0"} />
          {!loading && "Close"}
        </button>

        <div className="flex items-center gap-3 mb-4 text-primary">
          <Sparkles size={24} />
          <h2 className="text-xl font-bold text-white">Magic Plan</h2>
        </div>

        <p className="text-neutral-400 text-sm mb-6">
          Describe your ideal day or list your to-dos. AI will organize them into a schedule.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., I want to wake up at 7, exercise for an hour, work on my project until lunch, and read in the evening."
          className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white focus:border-primary focus:outline-none resize-none mb-4 placeholder-neutral-600"
          autoFocus
        />

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
            <p className="text-error text-sm mb-2">{error}</p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="text-error hover:text-error/80 text-sm underline disabled:opacity-50"
            >
              Try Again
            </button>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>Generating <Loader className="animate-spin" size={16} /></>
          ) : (
            <>Generate Schedule <ArrowRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default GeminiPlanner;
