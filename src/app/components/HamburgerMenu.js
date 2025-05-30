// src/app/components/HamburgerMenu.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@lib/firebase';

export default function HamburgerMenu({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-500 transition-colors duration-200"
        aria-label="Menú"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 animate-fade-in-down border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentUser?.email}
            </p>
          </div>

          <nav className="flex flex-col p-2 space-y-1">

            <button
              onClick={() => handleNavigation('/create-chat')}
              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Crear Nuevo Chat
            </button>

            <button
              onClick={() => handleNavigation('/chats')}
              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.105A9.952 9.952 0 0112 4c4.97 0 9 3.582 9 8z" />
              </svg>
              Ver Mis Chats
            </button>

            <button
              onClick={() => handleNavigation('/profile-edit')}
              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Editar Perfil
            </button>
            <button
              onClick={() => handleNavigation('/add-friends')}
              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 11c0 1.657-3.582 3-8 3s-8-1.343-8-3V4a4 4 0 018 0c4.418 0 8 1.343 8 3v7z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17L12 20 15 17" />
              </svg>
              Agregar Amigos
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition-colors duration-150 flex items-center"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Cerrar Sesión
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}