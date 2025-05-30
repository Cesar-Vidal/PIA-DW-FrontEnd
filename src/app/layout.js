// src/app/layout.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { auth, onAuthStateChanged, upsertUserDocument } from '@lib/firebase'; // <-- Importar upsertUserDocument

import './globals.css';

import HamburgerMenu from './components/HamburgerMenu';
import { ChatProvider, useChat } from './context/ChatContext';

import { ThemeProvider } from './context/ThemeContext';
import ThemeToggleButton from './components/ThemeToggleButton';


function HeaderContent({ currentUser }) {
  const { selectedChatName } = useChat();
  const pathname = usePathname();
  const router = useRouter();
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
  } else if (pathname === '/home' && !selectedChatName) {
    headerTitle = 'Bienvenido al Chat';
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 flex justify-between items-center z-[100] shadow-xl
                dark:from-gray-900 dark:to-gray-700 dark:text-gray-100 dark:shadow-2xl"
    >
      <h1
        className="text-2xl font-bold text-blue-100 drop-shadow-md truncate dark:text-blue-300"
      >
        {headerTitle}
      </h1>
      <div className="flex items-center space-x-4">
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
  // const shouldShowHeader = !noHeaderPaths.includes(pathname); // Esta variable ya está definida en HeaderContent

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Asegúrate de que el documento del usuario exista en Firestore
        upsertUserDocument(user); // <-- LLAMADA A LA NUEVA FUNCIÓN
        if (noHeaderPaths.includes(pathname)) {
          router.replace('/home');
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
  }, [router, pathname]); // Dependencias: router y pathname

  // Determinar si se debe mostrar el encabezado aquí también para el className del main
  const shouldShowHeader = !noHeaderPaths.includes(pathname);


  return (
    <html lang="en">
      {/* El body no tendrá clases de Tailwind para el tema aquí, usará las variables CSS */}
      <body>
        <ThemeProvider>
          {loadingUser ? (
            // Mensaje de carga con clases Tailwind (sin dark: por ahora)
            <div className="flex justify-center items-center h-screen text-2xl font-bold text-blue-600 dark:text-blue-300 dark:bg-gray-900">Cargando...</div>
          ) : (
            <>
              <ChatProvider currentUser={currentUser}>
                {/* Pasar shouldShowHeader para el HeaderContent para evitar renderizar el header innecesariamente */}
                <HeaderContent currentUser={currentUser} />

                {/* Aplica el padding solo si el Header se muestra */}
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