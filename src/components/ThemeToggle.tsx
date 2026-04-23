
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div 
      onClick={toggleTheme}
      className="relative flex items-center bg-secondary border border-border h-8 w-16 rounded-full cursor-pointer transition-all duration-300 hover:border-primary/50"
    >
      {/* Moving background slider */}
      <div 
        className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-primary shadow-sm transition-all duration-300 ease-in-out ${
          theme === 'dark' ? 'translate-x-8' : 'translate-x-0'
        }`}
      />
      
      {/* Icons container */}
      <div className="relative flex items-center w-full h-full z-10">
        <div className="w-1/2 flex justify-center items-center">
          <Sun className={`h-4 w-4 transition-colors duration-300 ${theme === 'light' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
        </div>
        <div className="w-1/2 flex justify-center items-center">
          <Moon className={`h-4 w-4 transition-colors duration-300 ${theme === 'dark' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
