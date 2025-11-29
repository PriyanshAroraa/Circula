import React, { useState, useEffect } from 'react';
import { Task, ViewState, CategoryType } from './types';
import { INITIAL_TASKS, CATEGORIES, QUICK_TEMPLATES } from './constants';
import RadialTimeline from './components/RadialTimeline';
import TaskModal from './components/TaskModal';
import Navigation from './components/Navigation';
import Analytics from './components/Analytics';
import FocusMode from './components/FocusMode';
import WeeklyView from './components/WeeklyView';
import SettingsView from './components/SettingsView';
import LoginModal from './components/Auth/LoginModal';
import SignupModal from './components/Auth/SignupModal';
import AuthCallback from './components/Auth/AuthCallback';
import { storage } from './utils/storage';
import { taskService } from './services/taskService';
import { useAuth } from './contexts/AuthContext';
import { isSupabaseConfigured } from './services/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Play, Flame, Trophy, AlertTriangle, LogOut, User } from 'lucide-react';

const App: React.FC = () => {
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewState>('daily');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Load tasks from Supabase or localStorage
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        
        // If Supabase is configured and user is authenticated, use Supabase
        if (isSupabaseConfigured() && user) {
          const supabaseTasks = await taskService.getTasks();
          setTasks(supabaseTasks.length > 0 ? supabaseTasks : []);
        } else {
          // Fallback to localStorage
          const savedTasks = storage.getTasks();
          setTasks(savedTasks.length > 0 ? savedTasks : INITIAL_TASKS);
        }

        const savedState = storage.getAppState();
        const initialView = (savedState.view as ViewState) || 'daily';
        setView(initialView);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoadError('Failed to load your data. Using defaults.');
        const savedTasks = storage.getTasks();
        setTasks(savedTasks.length > 0 ? savedTasks : INITIAL_TASKS);
        setView('daily');
      } finally {
        setIsLoading(false);
      }
    };

    // Wait for auth to finish loading
    if (!authLoading) {
      loadTasks();
    }
  }, [user, authLoading]);

  // Set up real-time sync when authenticated
  useEffect(() => {
    if (!isSupabaseConfigured() || !user) return;

    const subscription = taskService.subscribeToTasks(
      user.id,
      (newTask) => {
        setTasks(prev => {
          if (prev.some(t => t.id === newTask.id)) return prev;
          return [...prev, newTask].sort((a, b) => a.startTime - b.startTime);
        });
      },
      (updatedTask) => {
        setTasks(prev => prev.map(t => 
          t.id === updatedTask.id ? updatedTask : t
        ));
      },
      (deletedId) => {
        setTasks(prev => prev.filter(t => t.id !== deletedId));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Load screen dimensions for responsive SVG
  const [dimensions, setDimensions] = useState({ width: 360, height: 360 });

  // Persist view changes
  useEffect(() => {
    storage.saveAppState({ view });
  }, [view]);

  useEffect(() => {
    const handleResize = () => {
      const w = Math.min(window.innerWidth - 32, 500); 
      const h = window.innerHeight - 200; 
      const size = Math.min(w, h, 500);
      setDimensions({ width: size, height: size });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTimeSelect = (time: number, prefillData?: Partial<Task>) => {
    const roundedStart = Math.round(time * 4) / 4;
    let duration = prefillData?.endTime ? (prefillData.endTime - (prefillData.startTime || 0)) : 1;
    let roundedEnd = roundedStart + duration;
    if (roundedEnd >= 24) roundedEnd -= 24;
    
    const newTaskTemplate: Task = {
        id: '', 
        title: prefillData?.title || '',
        category: prefillData?.category || CategoryType.FOCUS,
        startTime: roundedStart,
        endTime: roundedEnd,
        completed: false,
        energyLevel: 2,
        ...prefillData
    };
    setSelectedTask(newTaskTemplate);
    setIsModalOpen(true);
  };

  const handleQuickAdd = (template: typeof QUICK_TEMPLATES[0]) => {
     // Find next available slot or default to nearest hour
     const now = new Date();
     const currentH = now.getHours() + (Math.ceil(now.getMinutes() / 15) * 15) / 60;
     
     handleTimeSelect(currentH, {
       title: template.label,
       category: template.category,
       startTime: currentH,
       endTime: currentH + template.duration
     });
  };

  const handleSaveTask = async (taskUpdate: Partial<Task>) => {
    let newTask: Task;

    if (taskUpdate.id && tasks.some(t => t.id === taskUpdate.id)) {
      // Update existing task
      newTask = { ...tasks.find(t => t.id === taskUpdate.id)!, ...taskUpdate } as Task;
    } else {
      // Create new task
      newTask = {
        ...taskUpdate,
        id: uuidv4(),
        completed: false,
        energyLevel: taskUpdate.energyLevel || 2
      } as Task;
    }

    // Save to Supabase or localStorage
    try {
      if (isSupabaseConfigured() && user) {
        await taskService.saveTask(newTask);
      } else {
        const updatedTasks = taskUpdate.id && tasks.some(t => t.id === taskUpdate.id)
          ? tasks.map(t => t.id === taskUpdate.id ? newTask : t)
          : [...tasks, newTask];
        storage.saveTasks(updatedTasks);
      }
      
      // Update local state
      setTasks(prev => {
        if (prev.some(t => t.id === newTask.id)) {
          return prev.map(t => t.id === newTask.id ? newTask : t);
        }
        return [...prev, newTask].sort((a, b) => a.startTime - b.startTime);
      });
    } catch (error) {
      console.error('Failed to save task:', error);
      // Fallback to localStorage
      const updatedTasks = taskUpdate.id && tasks.some(t => t.id === taskUpdate.id)
        ? tasks.map(t => t.id === taskUpdate.id ? newTask : t)
        : [...tasks, newTask];
      storage.saveTasks(updatedTasks);
      setTasks(updatedTasks);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      if (isSupabaseConfigured() && user) {
        await taskService.deleteTask(id);
      } else {
        const newTasks = tasks.filter(t => t.id !== id);
        storage.saveTasks(newTasks);
        setTasks(newTasks);
      }
      
      // Update local state
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Fallback to localStorage
      const newTasks = tasks.filter(t => t.id !== id);
      storage.saveTasks(newTasks);
      setTasks(newTasks);
    }
  };

  const handleAIPlan = async (newTasks: Task[]) => {
    try {
      if (isSupabaseConfigured() && user) {
        await taskService.saveTasks(newTasks);
      } else {
        storage.saveTasks(newTasks);
      }
      setTasks(newTasks);
      setView('daily');
      storage.saveAppState({ view: 'daily' });
    } catch (error) {
      console.error('Failed to save AI plan:', error);
      storage.saveTasks(newTasks);
      setTasks(newTasks);
      setView('daily');
      storage.saveAppState({ view: 'daily' });
    }
  };

  // Show loading screen
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading Circula...</p>
        </div>
      </div>
    );
  }

  // Show error message if loading failed
  if (loadError) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface border border-neutral-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} className="text-warning" />
          </div>
          <h2 className="text-xl font-bold mb-4">Data Loading Issue</h2>
          <p className="text-neutral-400 mb-6">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-black font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  // Handle auth callback route
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  return (
    <div className="min-h-screen bg-background text-white font-sans overflow-hidden flex flex-col items-center select-none relative z-0">
      
      {/* Ambient Background Layer */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
      </div>

      {/* Focus Mode Overlay */}
      {activeFocusTask && (
        <FocusMode 
          task={activeFocusTask} 
          onExit={() => setActiveFocusTask(null)}
          onComplete={() => {
            handleSaveTask({ id: activeFocusTask.id, completed: true });
            setActiveFocusTask(null);
          }}
        />
      )}

      {/* Top Bar */}
      <div className="w-full max-w-md px-6 pt-6 pb-2 flex items-center justify-between z-10 shrink-0">
        <div>
           <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">Circula</h1>
           <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
           </p>
        </div>
        <div className="flex items-center gap-2">
            {/* Gamification Badge */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-full px-2 py-1">
                <Flame size={14} className="text-orange-500" fill="currentColor" />
                <span className="text-xs font-mono font-bold">5</span>
            </div>
            {/* Auth Button */}
            {user ? (
              <div className="relative group">
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={18} className="text-neutral-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 rounded-lg bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Sign In
              </button>
            )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md relative overflow-y-auto no-scrollbar flex flex-col">
        
        {view === 'daily' && (
          <div className="flex flex-col items-center w-full min-h-0 animate-in fade-in duration-700">
            {/* Timeline Container */}
            <div className="flex-1 flex items-center justify-center py-4 w-full relative">
              <RadialTimeline 
                tasks={tasks} 
                onTaskSelect={handleEditTask}
                onTimeSelect={handleTimeSelect}
                width={dimensions.width}
                height={dimensions.height}
              />
            </div>
            
             {/* Quick Actions Strip */}
             <div className="w-full px-6 mb-6">
               <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2 ml-1">Quick Add</p>
               <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
                 {QUICK_TEMPLATES.map((tpl, i) => (
                   <button
                    key={i}
                    onClick={() => handleQuickAdd(tpl)}
                    className="flex-shrink-0 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md shadow-sm"
                   >
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORIES[tpl.category].color }} />
                     <span className="text-xs font-medium whitespace-nowrap">{tpl.label} <span className="opacity-50 text-[10px] ml-1">+{tpl.duration}h</span></span>
                   </button>
                 ))}
               </div>
            </div>

            {/* Task List (Below Radial) */}
            <div className="w-full px-6 pb-24 space-y-3 shrink-0">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Upcoming</h3>
               </div>
               
               {tasks
                 .sort((a, b) => a.startTime - b.startTime)
                 .filter(t => {
                   const now = new Date();
                   const currentH = now.getHours() + now.getMinutes() / 60;
                   // Show tasks that end in the future or recently ended
                   return t.endTime > currentH - 2; 
                 })
                 .slice(0, 3)
                 .map(task => (
                   <div 
                    key={task.id}
                    className="group relative flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer backdrop-blur-md overflow-hidden shadow-sm"
                    onClick={() => handleEditTask(task)}
                   >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div className="flex flex-col items-center text-xs font-mono text-neutral-400 w-10 shrink-0 z-10">
                        <span>{Math.floor(task.startTime).toString().padStart(2,'0')}:{Math.round((task.startTime % 1)*60).toString().padStart(2,'0')}</span>
                        <div className="h-6 w-[1px] bg-neutral-700 my-1"></div>
                        <span className="opacity-50">{Math.floor(task.endTime).toString().padStart(2,'0')}:{Math.round((task.endTime % 1)*60).toString().padStart(2,'0')}</span>
                      </div>
                      
                      <div className="min-w-0 z-10 flex-1">
                        <h4 className="font-semibold text-sm truncate text-white group-hover:text-primary transition-colors flex items-center gap-2">
                            {task.title}
                            {task.completed && <span className="text-[9px] bg-success/10 text-success border border-success/20 px-1 rounded">DONE</span>}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-neutral-400 border border-white/5">
                            {CATEGORIES[task.category]?.label}
                          </span>
                           {task.energyLevel && (
                            <span className="text-xs grayscale opacity-60" title="Energy Level">
                              {task.energyLevel === 3 ? '🔥' : task.energyLevel === 2 ? '⚡' : '😌'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveFocusTask(task); }}
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-glow hover:scale-110 active:scale-95 transition-all z-20"
                      >
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                      </button>

                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/40 to-transparent" style={{ backgroundColor: CATEGORIES[task.category]?.color }} />
                   </div>
                 ))}
                 
                 {tasks.length === 0 && (
                   <div className="text-center py-6 text-neutral-600 text-xs uppercase tracking-widest">
                     No tasks scheduled
                   </div>
                 )}
            </div>
          </div>
        )}

        {view === 'analytics' && <Analytics tasks={tasks} />}

        {view === 'weekly' && (
          <WeeklyView
            tasks={tasks}
            onTaskSelect={handleEditTask}
            onAddTask={() => setIsModalOpen(true)}
          />
        )}

        {view === 'settings' && (
          <SettingsView
            onDataImported={() => {
              // Reload tasks from storage after import
              const savedTasks = storage.getTasks();
              setTasks(savedTasks.length > 0 ? savedTasks : INITIAL_TASKS);
            }}
          />
        )}

      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialData={selectedTask}
        existingTasks={tasks}
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />

      {/* Bottom Navigation */}
      <Navigation 
        currentView={view} 
        onChangeView={setView} 
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default App;