// src/app/components/ChatList.js
'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Importa useRouter para la navegación

export default function ChatList({ userChats, selectedChatId, setSelectedChatId, currentUser }) {
  const router = useRouter(); // Inicializa el router

  const getChatDisplayName = (chat) => {
    if (chat.name) {
      return chat.name;
    }
    const otherMembers = chat.members.filter(memberId => memberId !== currentUser.uid);
    if (otherMembers.length > 0) {
      return `Chat con ${otherMembers.length > 1 ? `${otherMembers.length} personas` : `Usuario ${otherMembers[0].substring(0, 4)}...`}`;
    }
    return 'Chat Sin Nombre';
  };

  const handleCreateNewChat = () => {
    router.push('/create-chat'); 
  };

  return (
    <div className="flex flex-col space-y-2">

      <button
        onClick={handleCreateNewChat}
        className={`w-full text-left px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center
          bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md
          dark:bg-blue-700 dark:hover:bg-blue-600
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Crear Nuevo Chat
      </button>

      {userChats.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
          No hay chats disponibles.
        </p>
      ) : (
        userChats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setSelectedChatId(chat.id)}
            className={`w-full text-left px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-between
              ${selectedChatId === chat.id
                ? 'bg-blue-200 dark:bg-blue-700 shadow-md transform scale-[1.01] text-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-600'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
              }`}
          >
            <span className="font-semibold text-lg truncate flex-1">
              {chat.name || getChatDisplayName(chat)}
            </span>
            {chat.color && (
                <div
                    className="w-4 h-4 rounded-full ml-2 flex-shrink-0"
                    style={{ backgroundColor: chat.color }}
                    title={`Color del chat: ${chat.color}`}
                ></div>
            )}
          </button>
        ))
      )}
    </div>
  );
}