// src/app/components/ChatList.js
'use client';

import React from 'react';

// Ahora no usa useRouter internamente, lo recibe de quien lo usa
export default function ChatList({ userChats, selectedChatId, setSelectedChatId, currentUser }) {

  const getChatDisplayName = (chat) => {
    if (chat.name) {
      return chat.name;
    }
    const otherMembers = chat.members.filter(memberId => memberId !== currentUser.uid);
    if (otherMembers.length > 0) {
      // Necesitarías una forma de obtener el displayName de los otros UIDs.
      // Aquí asumo que si es un chat 1-a-1, puedes mostrar el ID truncado o buscar el nombre.
      // Para una solución robusta, deberías tener un mapa de UIDs a displayNames en tu contexto o pasar una lista de amigos.
      return `Chat con ${otherMembers.length > 1 ? `${otherMembers.length} personas` : `Usuario ${otherMembers[0].substring(0, 4)}...`}`;
    }
    return 'Chat Sin Nombre';
  };

  return (
    <div className="flex flex-col space-y-2"> {/* quitamos el 'h-full' y el 'mb-6' de h2 */}
      {/* ELIMINADO: h2 "Tus Chats" y botón "Crear Nuevo Chat" - ahora en la página /chats */}
      
      {userChats.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
          No hay chats disponibles.
        </p>
      ) : (
        userChats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setSelectedChatId(chat.id)} // Llama a la función proporcionada por el padre
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