// src/app/chats/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@lib/firebase';
import { useChat } from '../context/ChatContext'; // Necesitas userChats y setSelectedChatId
import ChatList from '../components/ChatList'; // Importa el componente ChatList

export default function ChatsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Obtén userChats del contexto. setSelectedChatId es clave para la navegación.
  const { userChats, setSelectedChatId } = useChat();

  // Autenticación de usuario
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

  const handleCreateNewChat = () => {
    router.push('/create-chat');
  };

  const handleChatSelection = (chatId) => {
    setSelectedChatId(chatId); // Establece el chat seleccionado en el contexto
    router.push('/home'); // Redirige a la página principal del chat
  };

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-bold text-blue-600 dark:text-blue-300 dark:bg-gray-900">Cargando chats...</div>
    );
  }

  if (!currentUser) {
    return null; // Ya será redirigido por el useEffect
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)] overflow-y-auto"> {/* Ajusta min-h para el header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center dark:text-gray-100">Mis Chats</h1>

      <div className="max-w-md mx-auto mb-6">
        <button
          onClick={handleCreateNewChat}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-900"
        >
          + Crear Nuevo Chat
        </button>
      </div>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        {userChats.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg mt-4">
            No tienes chats aún. ¡Crea uno nuevo para empezar!
          </p>
        ) : (
          <ChatList
            userChats={userChats}
            selectedChatId={null} // No hay un chat "seleccionado" en esta vista de lista
            setSelectedChatId={handleChatSelection} // Usa la función local para seleccionar y navegar
            currentUser={currentUser}
            // Puedes pasar isCompact={false} o simplemente no pasarla para el estilo por defecto
          />
        )}
      </div>
    </div>
  );
}