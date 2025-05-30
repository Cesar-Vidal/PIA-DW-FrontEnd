// src/app/components/ChatScreen.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, collection, query, orderBy, addDoc, serverTimestamp, onSnapshot } from '@lib/firebase';
import { useChat } from '../context/ChatContext';

import MessageInput from './MessageInput';
import MessagesDisplay from './MessagesDisplay';

export default function ChatScreen({ user: currentUser }) {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState(null);

  const { selectedChatId, selectedChatName } = useChat();

  useEffect(() => {
    if (!selectedChatId || !currentUser) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);
    setError(null);
    const messagesCollectionRef = collection(db, 'chats', selectedChatId, 'messages');
    const q = query(messagesCollectionRef, orderBy('createdAt', 'asc'));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError('Error al cargar los mensajes del chat.');
      setLoadingMessages(false);
    });

    return () => unsubscribeMessages();
  }, [selectedChatId, currentUser]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || !currentUser || !selectedChatId) {
      setError('No se puede enviar un mensaje vacío o sin chat seleccionado.');
      return;
    }

    try {
      await addDoc(collection(db, 'chats', selectedChatId, 'messages'), {
        text,
        createdAt: serverTimestamp(),
        uid: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email?.split('@')[0],
        photoURL: currentUser.photoURL || null,
      });
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error al enviar el mensaje. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
          {error}
        </p>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedChatId ? (
          loadingMessages ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Cargando mensajes...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Sé el primero en enviar un mensaje.</p>
          ) : (
            <MessagesDisplay messages={messages} currentUser={currentUser} />
          )
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-center text-lg">
              Selecciona un chat desde la página <span className="font-semibold text-blue-500 cursor-pointer" onClick={() => router.push('/chats')}>Mis Chats</span>.
            </p>
          </div>
        )}
      </div>

      {selectedChatId && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );
}