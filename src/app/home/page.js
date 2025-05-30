// src/app/home/page.js
'use client';

import { auth, onAuthStateChanged } from '@lib/firebase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import ChatScreen from '../components/ChatScreen';
import { useChat } from '../context/ChatContext';


export default function HomePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();
  const { selectedChatId } = useChat();


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

  useEffect(() => {
    if (!loadingUser && currentUser && !selectedChatId) {
      router.replace('/chats');
    }
  }, [loadingUser, currentUser, selectedChatId, router]);


  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-bold text-blue-600 dark:text-blue-300 dark:bg-gray-900">Cargando...</div>
    );
  }

  if (currentUser && selectedChatId) {
    return (
      <div className="h-screen flex flex-col">
        <ChatScreen user={currentUser} />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center flex-grow text-2xl text-gray-600 dark:text-gray-400 h-screen">
      {!currentUser ? "Por favor, inicia sesión." : "Redirigiendo a tus chats..."}
    </div>
  );
}