// src/app/components/ChatScreen.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
} from '@lib/firebase';
import { useChat } from '../context/ChatContext';

export default function ChatScreen({ user }) {
  const { selectedChatId } = useChat();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    const messagesCollectionRef = collection(db, "chats", selectedChatId, "messages");
    const q = query(
      messagesCollectionRef,
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    }, (error) => {
      console.error("Error fetching messages for chat:", selectedChatId, error);
      setMessages([]);
    });

    return () => unsubscribe();
  }, [selectedChatId]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    if (!selectedChatId) {
      console.warn("No hay chat seleccionado para enviar mensaje.");
      return;
    }

    try {
      await addDoc(collection(db, "chats", selectedChatId, "messages"), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: user.displayName || user.email,
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 overflow-y-auto px-6 py-4 pt-16 pb-20">
        <div className="space-y-4">
          {!selectedChatId ? (
            <div className="text-center text-gray-500 text-lg mt-10 dark:text-gray-400">
              Selecciona un chat del menú lateral o crea uno nuevo para empezar a conversar.
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 text-lg mt-10 dark:text-gray-400">
              ¡Sé el primero en enviar un mensaje en este chat!
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.uid === user.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-xl shadow-md ${
                    msg.uid === user.uid
                      ? 'bg-blue-400 text-white drop-shadow-sm dark:bg-blue-600 dark:text-white' // Mensaje del usuario
                      : 'bg-white text-gray-800 border border-blue-200 drop-shadow-sm dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600' // Mensaje de otros
                  }`}
                >
                  <p className="font-semibold text-sm opacity-90 dark:opacity-100">{msg.displayName}</p>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={sendMessage}
        className="fixed bottom-0 left-0 right-0 p-4 bg-blue-100 border-t border-blue-200 shadow-inner z-10 flex items-center
                   dark:bg-gray-800 dark:border-gray-700 dark:shadow-none"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={selectedChatId ? "Escribe tu mensaje..." : "Selecciona un chat para escribir..."}
          disabled={!selectedChatId}
          className="flex-1 border border-blue-300 rounded-full p-3 mr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-700 placeholder-gray-500 disabled:bg-gray-200 disabled:cursor-not-allowed
                     dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-600 dark:disabled:bg-gray-600"
        />
        <button
          type="submit"
          disabled={!selectedChatId}
          className="bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-full hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed
                     dark:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-gray-600 dark:shadow-none dark:hover:shadow-lg"
          aria-label="Enviar mensaje"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="w-6 h-6 transform -rotate-45 translate-x-px translate-y-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}