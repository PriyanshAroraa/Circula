import React, { useState, useMemo } from 'react';
import { Task, CategoryType } from '../types';
import { CATEGORIES } from '../constants';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';

interface WeeklyViewProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onAddTask: (date: Date) => void;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({ tasks, onTaskSelect, onAddTask }) => {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    return startOfWeek;
  });

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek);
      date.setDate(currentWeek.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentWeek]);

  const tasksByDay = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    weekDays.forEach(day => {
      const dayKey = day.toDateString();
      grouped[dayKey] = tasks.filter(task => {
        // For now, assume all tasks are for today. In a full implementation,
        // you'd have task dates. For demo purposes, we'll show tasks on current day.
        const today = new Date();
        return day.toDateString() === today.toDateString();
      });
    });
    return grouped;
  }, [tasks, weekDays]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newWeek = new Date(prev);
      newWeek.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newWeek;
    });
  };

  const goToToday = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    setCurrentWeek(startOfWeek);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-32">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-1">Weekly Overview</h2>
          <p className="text-neutral-500">
            {currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-lg bg-surface hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Today
          </button>

          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-lg bg-surface hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayKey = day.toDateString();
          const dayTasks = tasksByDay[dayKey] || [];
          const isToday = day.toDateString() === new Date().toDateString();
          const isPast = day < new Date() && !isToday;

          return (
            <div
              key={index}
              className={`min-h-[200px] rounded-2xl border transition-all ${
                isToday
                  ? 'border-primary bg-primary/5'
                  : isPast
                  ? 'border-neutral-800 bg-surface/50'
                  : 'border-neutral-800 bg-surface hover:bg-surface/80'
              }`}
            >
              {/* Day Header */}
              <div className="p-4 border-b border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold uppercase tracking-wider ${
                    isToday ? 'text-primary' : 'text-neutral-500'
                  }`}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <button
                    onClick={() => onAddTask(day)}
                    className="p-1 rounded-full hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Plus size={16} className="text-neutral-400" />
                  </button>
                </div>
                <span className={`text-2xl font-mono font-bold ${
                  isToday ? 'text-white' : 'text-neutral-400'
                }`}>
                  {day.getDate()}
                </span>
              </div>

              {/* Tasks List */}
              <div className="p-3 space-y-2 max-h-[140px] overflow-y-auto">
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => onTaskSelect(task)}
                    className="group p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORIES[task.category]?.color }}
                      />
                      <span className="text-xs font-medium text-white truncate">
                        {task.title}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {formatTime(task.startTime)} - {formatTime(task.endTime)}
                    </div>
                  </div>
                ))}

                {dayTasks.length === 0 && (
                  <div className="text-center py-4 text-neutral-600 text-xs">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <div className="bg-surface border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-white">
              {tasks.filter(t => !t.completed).length}
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">
              Pending Tasks
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-success">
              {tasks.filter(t => t.completed).length}
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">
              Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-primary">
              {Math.round(tasks.reduce((acc, t) => {
                const duration = t.endTime - t.startTime;
                return acc + (duration < 0 ? duration + 24 : duration);
              }, 0) * 10) / 10}h
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">
              Total Hours
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-warning">
              {Math.round((tasks.filter(t => t.completed).length / Math.max(tasks.length, 1)) * 100)}%
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">
              Completion Rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;
