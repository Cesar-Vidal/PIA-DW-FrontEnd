// src/app/components/HamburgerMenu.js
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, auth } from '@lib/firebase';
import DefaultAvatar from '../../../public/DefaultAvatar/default_avatar.png';
import { useChat } from '../context/ChatContext';

export default function HamburgerMenu({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const { setSelectedChatId, userChats } = useChat();
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    setIsOpen(false);
    router.push('/home');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully!');
      router.replace('/auth/login');
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className="text-blue-200 hover:text-blue-50 focus:outline-none z-[100] p-2 drop-shadow-lg dark:text-gray-200 dark:hover:text-white"
        aria-label="Toggle navigation menu"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/30 z-[90] dark:via-black/50 dark:to-black/60"
          onClick={toggleMenu}
        ></div>
      )}

      <nav
        className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-br from-blue-400 to-cyan-300 text-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[95] flex flex-col justify-between
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          dark:from-gray-900 dark:to-gray-800 dark:text-gray-100`}
      >
        <div className="p-6 flex flex-col flex-grow">

          {currentUser && (
            <div className="flex items-center mb-8 bg-blue-500/20 p-3 rounded-lg shadow-inner dark:bg-gray-700/50">
              <img
                src={currentUser.photoURL || DefaultAvatar.src}
                alt="Avatar de usuario"
                className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-blue-200 shadow-md dark:border-gray-600"
              />
              <p className="text-xl text-blue-700 font-semibold truncate dark:text-gray-100">
                {currentUser.displayName || currentUser.email.split('@')[0]}
              </p>
            </div>
          )}

          <ul className="space-y-4 mb-auto">
            <li className="text-lg font-semibold text-blue-800 pt-4 pb-2 border-t border-blue-300 dark:text-blue-400 dark:border-gray-600">
              Tus Chats
            </li>
            {userChats.length > 0 ? (
              userChats.map(chat => (
                <li key={chat.id}>
                  <button
                    onClick={() => handleSelectChat(chat.id)}
                    className="w-full text-left text-xl py-3 px-4 rounded-xl bg-blue-500/80 hover:bg-blue-600/90 transition-all duration-200 text-white shadow-inner hover:shadow-md
                               dark:bg-gray-700/80 dark:hover:bg-gray-600/90 dark:text-gray-100 dark:shadow-none dark:hover:shadow-md"
                  >
                    {chat.name}
                  </button>
                </li>
              ))
            ) : (
              <li>
                <p className="text-sm text-blue-200 pl-4 dark:text-gray-400">No tienes chats aún. ¡Crea uno!</p>
              </li>
            )}

            <li className="text-lg font-semibold text-blue-800 pt-4 pb-2 border-t border-blue-300 mt-4 dark:text-blue-400 dark:border-gray-600">
              Opciones
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/create-chat')}
                className="w-full text-left text-xl py-3 px-4 rounded-xl bg-blue-500/80 hover:bg-blue-600/90 transition-all duration-200 text-white shadow-inner hover:shadow-md
                           dark:bg-gray-700/80 dark:hover:bg-gray-600/90 dark:text-gray-100 dark:shadow-none dark:hover:shadow-md"
              >
                Crear un Chat
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/add-friends')}
                className="w-full text-left text-xl py-3 px-4 rounded-xl bg-blue-500/80 hover:bg-blue-600/90 transition-all duration-200 text-white shadow-inner hover:shadow-md
                           dark:bg-gray-700/80 dark:hover:bg-gray-600/90 dark:text-gray-100 dark:shadow-none dark:hover:shadow-md"
              >
                Agregar Amigos
              </button>
            </li>
            {currentUser && (
              <li>
                <button
                  onClick={() => handleNavigation('/profile-edit')}
                  className="w-full text-left text-xl py-3 px-4 rounded-xl bg-blue-500/80 hover:bg-blue-600/90 transition-all duration-200 text-white shadow-inner hover:shadow-md
                             dark:bg-gray-700/80 dark:hover:bg-gray-600/90 dark:text-gray-100 dark:shadow-none dark:hover:shadow-md"
                >
                  Editar Perfil
                </button>
              </li>
            )}
          </ul>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleLogout}
            className="w-full text-left text-xl py-3 px-4 rounded-xl bg-red-500/80 hover:bg-red-600/90 transition-all duration-200 text-white shadow-inner hover:shadow-md
                       dark:bg-red-700/80 dark:hover:bg-red-600/90 dark:text-gray-100 dark:shadow-none dark:hover:shadow-md"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </>
  );
}