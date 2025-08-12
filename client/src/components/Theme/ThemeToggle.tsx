import React from 'react';
import { Sun, Moon, Eye } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'colorblind' : 'light'} mode`}
      title={`Current theme: ${theme}. Click to switch.`}
    >
      {theme === 'light' && <Sun size={20} />}
      {theme === 'dark' && <Moon size={20} />}
      {theme === 'colorblind' && <Eye size={20} />}
    </button>
  );
};

export default ThemeToggle;