'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

type GradientTheme = 'blue' | 'sunset';

interface ThemeContextType {
  gradientTheme: GradientTheme;
  setGradientTheme: (theme: GradientTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  gradientTheme: 'blue',
  setGradientTheme: () => null,
});

export function useGradientTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useGradientTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  const [gradientTheme, setGradientTheme] = useState<GradientTheme>('blue');

  useEffect(() => {
    // Load saved gradient theme from localStorage
    const savedTheme = localStorage.getItem('gradientTheme') as GradientTheme;
    if (savedTheme) {
      setGradientTheme(savedTheme);
      document.documentElement.classList.add(`gradient-${savedTheme}`);
    }
  }, []);

  const handleGradientChange = (theme: GradientTheme) => {
    setGradientTheme(theme);
    localStorage.setItem('gradientTheme', theme);
    // Update root element classes
    document.documentElement.classList.remove('gradient-blue', 'gradient-sunset');
    document.documentElement.classList.add(`gradient-${theme}`);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        gradientTheme, 
        setGradientTheme: handleGradientChange 
      }}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        {...props}
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
}