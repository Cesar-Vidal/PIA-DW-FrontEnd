// src/app/context/ChatContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, doc } from '@lib/firebase'; // Asegúrate de importar `doc`

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children, currentUser }) {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState('Chat Global');
  const [selectedChatColor, setSelectedChatColor] = useState('#60a5fa'); // <-- NUEVO ESTADO para el color, con un valor por defecto
  const [userChats, setUserChats] = useState([]);

  // Efecto para obtener los chats del usuario
  useEffect(() => {
    if (!currentUser) {
      setUserChats([]);
      setSelectedChatId(null);
      setSelectedChatName('Chat Global');
      setSelectedChatColor('#60a5fa'); // Resetear color al cerrar sesión
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserChats(chats);

      if (chats.length > 0) {
        let chatToSelect = chats.find(chat => chat.id === selectedChatId);

        // Si el chat seleccionado ya no existe o no es válido, o no hay ninguno
        if (!chatToSelect) {
          chatToSelect = chats[0]; // Selecciona el primer chat del usuario por defecto
        }
        
        setSelectedChatId(chatToSelect.id);
        setSelectedChatName(chatToSelect.name);
        setSelectedChatColor(chatToSelect.color || '#60a5fa'); // Establecer el color del chat seleccionado
      } else {
        setSelectedChatId(null); // No hay chats de grupo para el usuario
        setSelectedChatName('Selecciona un Chat');
        setSelectedChatColor('#60a5fa');
      }

    }, (error) => {
      console.error("Error fetching user chats in ChatContext:", error);
    });

    return () => unsubscribe();
  }, [currentUser]); // Removido selectedChatId de las dependencias, ya se maneja internamente.

  // Efecto para actualizar el nombre y color del chat cuando selectedChatId cambia
  // Este efecto es más robusto si ya tenemos los chats en userChats
  useEffect(() => {
    if (selectedChatId && userChats.length > 0) {
      const chat = userChats.find(c => c.id === selectedChatId);
      if (chat) {
        setSelectedChatName(chat.name);
        setSelectedChatColor(chat.color || '#60a5fa'); // Asegura que el color se actualice
      } else {
        // Esto podría ocurrir si selectedChatId es un chat que no está en userChats (ej. un chat eliminado)
        setSelectedChatName('Chat no encontrado');
        setSelectedChatColor('#60a5fa');
      }
    } else if (!selectedChatId) {
      setSelectedChatName('Selecciona un Chat');
      setSelectedChatColor('#60a5fa');
    }
  }, [selectedChatId, userChats]); // Depende de selectedChatId y userChats

  const value = {
    selectedChatId,
    setSelectedChatId,
    selectedChatName,
    selectedChatColor, // <-- Exporta el color del chat
    userChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}