'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Crea el contexto
const ThemeContext = createContext(null);

// Hook personalizado para usar el tema
export function useTheme() {
  return useContext(ThemeContext);
}

// Proveedor de tema
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light'); // Estado inicial 'light'

  useEffect(() => {
    // 1. Intentar cargar el tema desde localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.add(savedTheme); // Aplicar clase al html
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // 2. Si no hay tema guardado, usar la preferencia del sistema
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []); // Solo se ejecuta una vez al montar

  // Función para alternar el tema
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Actualizar la clase en el elemento html
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Guardar la preferencia en localStorage
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const value = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}