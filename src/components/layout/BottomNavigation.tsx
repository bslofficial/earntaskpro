import React from 'react';
import { Home, CheckSquare, Wallet, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNavigation: React.FC<Props> = ({ activeTab, onSelectTab }) => {
  const { language } = useApp();

  const navItems = [
    {
      id: 'home',
      label: language === 'bn' ? 'হোম' : 'Home',
      icon: Home,
    },
    {
      id: 'task',
      label: language === 'bn' ? 'টাস্ক' : 'Tasks',
      icon: CheckSquare,
    },
    {
      id: 'wallet',
      label: language === 'bn' ? 'ওয়ালেট' : 'Wallet',
      icon: Wallet,
    },
    {
      id: 'profile',
      label: language === 'bn' ? 'প্রোফাইল' : 'Profile',
      icon: User,
    },
  ];

  const handleSelect = (id: string) => {
    sound.playClick();
    onSelectTab(id);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/90 py-1.5 px-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive ? 'text-amber-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {/* Active glow indicator pill */}
              {isActive && (
                <div className="absolute -top-1.5 w-6 h-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              )}

              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-amber-500/15 text-amber-400' : 'text-zinc-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${isActive ? 'text-amber-300 font-extrabold' : 'text-zinc-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
