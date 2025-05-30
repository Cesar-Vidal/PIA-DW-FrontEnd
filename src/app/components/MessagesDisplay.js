// src/app/components/MessagesDisplay.js
'use client';

import React, { useRef, useEffect } from 'react';

export default function MessagesDisplay({ messages, currentUser }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.uid === currentUser.uid ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`rounded-xl p-3 max-w-[70%] shadow-md ${
              msg.uid === currentUser.uid
                ? 'bg-blue-500 text-white self-end rounded-br-none' 
                : 'bg-gray-300 text-gray-800 self-start rounded-bl-none dark:bg-gray-700 dark:text-gray-100' 
            }`}
          >
            {msg.uid !== currentUser.uid && msg.uid !== 'system' && (
              <p className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-200">
                {msg.displayName}
              </p>
            )}
            <p className="break-words">{msg.text}</p> 
            <p className="text-xs text-right opacity-80 mt-1">
              {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Enviando...'}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} /> 
    </div>
  );
}