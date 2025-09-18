import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { ClockIcon } from './IconComponents';

interface HeaderProps {
  toolName: string;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onShowHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ toolName, theme, setTheme, onShowHistory }) => {
  return (
    <header className="bg-transparent py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">
            <span role="img" aria-label="sparkles emoji" className="mr-2">✨</span>
            {toolName}
          </h1>
          <p className="mt-2 text-md sm:text-lg text-gray-600 dark:text-gray-300">Your AI-Powered Flyer Design Assistant</p>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 lg:right-8 flex items-center gap-2">
          <button
            onClick={onShowHistory}
            className="p-2 rounded-full text-gray-400 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-200/50 dark:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#0A0A22] focus:ring-[#0808F5] transition-colors duration-200"
            aria-label="View generation history"
          >
            <ClockIcon className="w-6 h-6" />
          </button>
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </header>
  );
};

export default Header;
