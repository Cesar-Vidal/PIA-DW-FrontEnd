// src/app/context/ChatContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, doc } from '@lib/firebase';

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children, currentUser }) {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState('Chat Global');
  const [selectedChatColor, setSelectedChatColor] = useState('#60a5fa');
  const [userChats, setUserChats] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      setUserChats([]);
      setSelectedChatId(null);
      setSelectedChatName('Chat Global');
      setSelectedChatColor('#60a5fa');
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

        if (!chatToSelect) {
          chatToSelect = chats[0];
        }

        setSelectedChatId(chatToSelect.id);
        setSelectedChatName(chatToSelect.name);
        setSelectedChatColor(chatToSelect.color || '#60a5fa');
      } else {
        setSelectedChatId(null);
        setSelectedChatName('Selecciona un Chat');
        setSelectedChatColor('#60a5fa');
      }

    }, (error) => {
      console.error("Error fetching user chats in ChatContext:", error);
    });

    return () => unsubscribe();
  }, [currentUser, selectedChatId]);


  useEffect(() => {
    if (selectedChatId && userChats.length > 0) {
      const chat = userChats.find(c => c.id === selectedChatId);
      if (chat) {
        setSelectedChatName(chat.name);
        setSelectedChatColor(chat.color || '#60a5fa');
      } else {
        setSelectedChatName('Chat no encontrado');
        setSelectedChatColor('#60a5fa');
      }
    } else if (!selectedChatId) {
      setSelectedChatName('Selecciona un Chat');
      setSelectedChatColor('#60a5fa');
    }
  }, [selectedChatId, userChats]);

  const value = {
    selectedChatId,
    setSelectedChatId,
    selectedChatName,
    setSelectedChatName,
    selectedChatColor,
    setSelectedChatColor,
    userChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}