// src/app/home/page.js
'use client';

import { auth, onAuthStateChanged } from '@lib/firebase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import ChatScreen from '../components/ChatScreen';


export default function HomePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.replace('/auth/login');
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, [router]);

  // ELIMINAR: const handleChatSelection = (chatId) => { ... }; // Ya no es necesario aquí

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-bold text-blue-600">Cargando...</div>
    );
  }

  return (
    <div className="h-screen flex flex-col">

      {currentUser ? (
        // ChatScreen ya no necesita selectedChatId como prop, lo obtiene del contexto
        <ChatScreen user={currentUser} />
      ) : (
        <div className="flex justify-center items-center flex-grow text-2xl text-gray-600">
          Por favor, inicia sesión.
        </div>
      )}
    </div>
  );
}