// src/app/layout.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { auth, onAuthStateChanged, upsertUserDocument } from '@lib/firebase';

import './globals.css';

import HamburgerMenu from './components/HamburgerMenu';
import { ChatProvider, useChat } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggleButton from './components/ThemeToggleButton';
import FriendRequestsButton from './components/FriendRequestsButton';


function HeaderContent({ currentUser }) {
  const { selectedChatName, selectedChatId, selectedChatColor, setSelectedChatId, setSelectedChatName, setSelectedChatColor: setChatColorFromContext } = useChat();

  const router = useRouter();
  const pathname = usePathname();

  const noHeaderPaths = ['/auth/login', '/auth/register'];
  const shouldShowHeader = !noHeaderPaths.includes(pathname);

  if (!shouldShowHeader) return null;

  let headerTitle = selectedChatName || 'Simple Chat';

  if (pathname === '/create-chat') {
    headerTitle = 'Crear Nuevo Chat';
  } else if (pathname === '/add-friends') {
    headerTitle = 'Agregar Amigos';
  } else if (pathname === '/profile-edit') {
    headerTitle = 'Editar Perfil';
  } else if (pathname === '/edit-chat') {
    headerTitle = 'Editar Chat';
  } else if (pathname === '/chats') {
    headerTitle = 'Mis Chats';
  } else if (pathname === '/home') {
    headerTitle = selectedChatName || 'Cargando Chat...';
  }


  const headerBackgroundColor = (pathname === '/home' && selectedChatId)
    ? selectedChatColor
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1f2937' : '#2563eb');

  const shouldShowBackButton = !noHeaderPaths.includes(pathname) && pathname !== '/chats';

  return (
    <header
      className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-[100] shadow-xl text-white"
      style={{ backgroundColor: headerBackgroundColor }}
    >
      <div className="flex items-center space-x-4 flex-grow min-w-0">
        {shouldShowBackButton && (
          <button
            onClick={() => {
              setSelectedChatId(null);
              setSelectedChatName(null);
              setChatColorFromContext(null);
              router.push('/chats');
            }}
            className="
              flex items-center justify-center
              w-10 h-10 rounded-full
              bg-white bg-opacity-20 hover:bg-opacity-30
              text-white
              dark:bg-gray-700 dark:hover:bg-gray-600
              dark:text-gray-200
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
              dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800
              transition-all duration-200 ease-in-out
              shadow-sm hover:shadow-md
              active:scale-95
            "
            aria-label="Volver a Mis Chats"
            title="Volver a Mis Chats"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
        )}
        <h1 className="text-2xl font-bold text-blue-100 drop-shadow-md truncate dark:text-blue-300 flex-grow min-w-0">
          {headerTitle}
        </h1>
      </div>

      <div className="flex items-center space-x-4 flex-shrink-0">
        {pathname === '/home' && selectedChatId && (
          <button
            onClick={() => router.push(`/edit-chat?id=${selectedChatId}`)}
            className={`
              flex items-center justify-center
              w-10 h-10 rounded-full
              bg-white bg-opacity-20 hover:bg-opacity-30
              text-white
              dark:bg-gray-700 dark:hover:bg-gray-600
              dark:text-gray-200
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
              dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800
              transition-all duration-200 ease-in-out
              shadow-sm hover:shadow-md
              active:scale-95
            `}
            aria-label="Editar Chat"
            title="Editar Chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
        )}
        <FriendRequestsButton currentUser={currentUser} />
        <ThemeToggleButton />
        <HamburgerMenu currentUser={currentUser} />
      </div>
    </header>
  );
}


export default function RootLayout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const noHeaderPaths = ['/auth/login', '/auth/register'];
  const shouldShowHeader = !noHeaderPaths.includes(pathname);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        upsertUserDocument(user);
        if (noHeaderPaths.includes(pathname)) {
          if (pathname === '/auth/login' || pathname === '/auth/register') {
            router.replace('/home');
          }
        }
      } else {
        setCurrentUser(null);
        if (!noHeaderPaths.includes(pathname)) {
          router.replace('/auth/login');
        }
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {loadingUser ? (
            <div className="flex justify-center items-center h-screen text-2xl font-bold text-blue-600 dark:text-blue-300 dark:bg-gray-900">Cargando...</div>
          ) : (
            <>
              <ChatProvider currentUser={currentUser}>
                <HeaderContent currentUser={currentUser} />

                <main className={shouldShowHeader ? "pt-16" : ""}>
                  {children}
                </main>
              </ChatProvider>
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}