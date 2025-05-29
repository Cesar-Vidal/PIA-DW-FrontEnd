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
  const [selectedChatName, setSelectedChatName] = useState('Chat Global'); // Nuevo estado para el nombre del chat, con un valor por defecto
  const [userChats, setUserChats] = useState([]);

  // Efecto para obtener los chats del usuario
  useEffect(() => {
    if (!currentUser) {
      setUserChats([]);
      setSelectedChatId(null);
      setSelectedChatName('Chat Global'); // Resetear nombre al cerrar sesión
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

      // Lógica para seleccionar el chat inicial
      if (chats.length > 0) {
        // Si no hay chat seleccionado, o el chat seleccionado ya no existe/no es válido
        if (!selectedChatId || !chats.some(chat => chat.id === selectedChatId)) {
          setSelectedChatId(chats[0].id); // Selecciona el primer chat del usuario por defecto
        }
      } else {
        setSelectedChatId(null); // No hay chats de grupo para el usuario
      }

    }, (error) => {
      console.error("Error fetching user chats in ChatContext:", error);
    });

    return () => unsubscribe();
  }, [currentUser, selectedChatId]); // selectedChatId se mantiene como dependencia para re-evaluar si el seleccionado desaparece

  // NUEVO Efecto para actualizar el nombre del chat cuando selectedChatId cambia
  useEffect(() => {
    if (selectedChatId) {
      const chat = userChats.find(c => c.id === selectedChatId);
      if (chat) {
        setSelectedChatName(chat.name);
      } else if (selectedChatId === 'global-chat') { // Si tienes un ID específico para el chat global
        setSelectedChatName('Chat Global');
      } else {
        setSelectedChatName('Cargando Chat...'); // O un nombre genérico
      }
    } else {
      setSelectedChatName('Selecciona un Chat'); // Mensaje cuando no hay chat seleccionado
    }
  }, [selectedChatId, userChats]); // Depende de selectedChatId y userChats

  const value = {
    selectedChatId,
    setSelectedChatId,
    selectedChatName, // Exporta el nombre del chat
    userChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}