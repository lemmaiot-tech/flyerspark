import React from 'react';
import { SunIcon, MoonIcon } from './IconComponents';

interface ThemeSwitcherProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-400 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-200/50 dark:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#0A0A22] focus:ring-[#0808F5] transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
    </button>
  );
};

export default ThemeSwitcher;
