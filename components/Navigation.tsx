import React from 'react';
import { Home, PieChart, Settings, Plus } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onAddTask: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView, onAddTask }) => {
  const navItemClass = (view: ViewState) => `
    flex flex-col items-center justify-center w-full h-full space-y-1
    ${currentView === view ? 'text-primary' : 'text-neutral-500 hover:text-neutral-300'}
    transition-colors
  `;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface/80 backdrop-blur-xl border-t border-neutral-800 pb-2 z-40">
      <div className="max-w-md mx-auto h-full relative">
        
        {/* Perfect symmetrical 3-section layout with equal spacing */}
        <div className="w-full h-full flex items-center justify-between px-4">
          
          {/* Left: Daily */}
          <button 
            onClick={() => onChangeView('daily')} 
            className={navItemClass('daily')}
          >
            <Home size={24} strokeWidth={currentView === 'daily' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Daily</span>
          </button>

          {/* Center: Insights */}
          <button 
            onClick={() => onChangeView('analytics')} 
            className={navItemClass('analytics')}
          >
            <PieChart size={24} strokeWidth={currentView === 'analytics' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Insights</span>
          </button>

          {/* Right: Settings */}
          <button 
            onClick={() => onChangeView('settings')} 
            className={navItemClass('settings')}
          >
            <Settings size={24} strokeWidth={currentView === 'settings' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>

        </div>

        {/* Plus Button: Elevated above center, slightly higher */}
        <button 
          onClick={onAddTask}
          className="absolute left-1/2 -translate-x-1/2 -top-10 bg-white text-black rounded-full p-4 shadow-glow hover:scale-105 transition-transform active:scale-95 z-20"
        >
          <Plus size={28} strokeWidth={3} />
        </button>

      </div>
    </div>
  );
};

export default Navigation;
