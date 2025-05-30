// src/app/chats/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, collection, query, where, onSnapshot } from '@lib/firebase';
import { useChat } from '../context/ChatContext';
import { auth, onAuthStateChanged } from '@lib/firebase';

export default function ChatsListPage() {
  const router = useRouter();
  const { setSelectedChatId, setSelectedChatName, setSelectedChatColor } = useChat();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userChats, setUserChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.replace('/auth/login');
      }
      setLoadingUser(false);
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!currentUser) {
      setLoadingChats(false);
      return;
    }

    setLoadingChats(true);
    setError(null);

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('members', 'array-contains', currentUser.uid));

    const unsubscribeChats = onSnapshot(q, (snapshot) => {
      const fetchedChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserChats(fetchedChats);
      setLoadingChats(false);
    }, (err) => {
      console.error("Error fetching user chats:", err);
      setError('Error al cargar la lista de chats.');
      setLoadingChats(false);
    });

    return () => unsubscribeChats();
  }, [currentUser]);

  const handleChatSelect = (chatId, chatName, chatColor) => {
    setSelectedChatId(chatId);
    setSelectedChatName(chatName);
    setSelectedChatColor(chatColor);
    router.push('/home');
  };

  const handleCreateNewChat = () => {
    router.push('/create-chat');
  };

  if (loadingUser || loadingChats) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-bold text-blue-600 dark:text-blue-300 dark:bg-gray-900">Cargando chats...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-500 dark:text-gray-400">
        Por favor, inicia sesión para ver tus chats.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 pt-20 pb-4 min-h-screen">
      <div className="mb-6 flex justify-center">
        <button
          onClick={handleCreateNewChat}
          className="w-full max-w-sm text-left px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center
            bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md
            dark:bg-blue-700 dark:hover:bg-blue-600
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Crear Nuevo Chat
        </button>
      </div>

      {userChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-gray-600 dark:text-gray-400 py-10"> {/* Ajustado para que se vea bien debajo del botón */}
          <p className="text-xl mb-2">No tienes chats aún.</p>
          <p className="text-sm">¡Empieza uno ahora!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat.id, chat.name, chat.color)}
              className="flex items-center p-4 bg-white rounded-lg shadow-md cursor-pointer
                         hover:shadow-lg transition-shadow duration-200 ease-in-out
                         dark:bg-gray-800 dark:hover:bg-gray-700 dark:shadow-none"
              style={{ borderLeft: `5px solid ${chat.color || '#2563eb'}` }}
            >
              <div className="flex-shrink-0 mr-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl"
                  style={{ backgroundColor: chat.color || '#2563eb' }}
                >
                  {chat.name ? chat.name.charAt(0).toUpperCase() : 'C'}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{chat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}