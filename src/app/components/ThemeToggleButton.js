'use client'; // Es un Client Component porque tiene interactividad (onClick)

import React from 'react';
import { useTheme } from '../../app/context/ThemeContext'; // Ajusta la ruta si es necesario

export default function ThemeToggleButton() {
  // Usamos el hook personalizado para obtener el tema actual y la función para alternarlo
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme} // Al hacer clic, se llama a toggleTheme
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
      aria-label={`Alternar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {theme === 'light' ? (
        // Icono para el modo claro (sol)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.325 3.325l-.707.707M6.707 6.707l-.707-.707m12.62 0l-.707-.707M6.707 17.293l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Icono para el modo oscuro (luna)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}