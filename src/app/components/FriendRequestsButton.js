// src/app/components/FriendRequestsButton.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, collection, query, where, onSnapshot } from '@lib/firebase';

export default function FriendRequestsButton({ currentUser }) {
  const router = useRouter();
  const [hasPendingRequests, setHasPendingRequests] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) {
      setHasPendingRequests(false);
      setLoadingRequests(false);
      return;
    }

    const requestsRef = collection(db, `users/${currentUser.uid}/friends`);
    const q = query(requestsRef, where('status', '==', 'pending'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHasPendingRequests(!snapshot.empty);
      setLoadingRequests(false);
    }, (error) => {
      console.error("Error fetching friend requests:", error);
      setHasPendingRequests(false);
      setLoadingRequests(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleClick = () => {
    router.push('/add-friends');
  };

  if (!currentUser?.uid || (loadingRequests && !hasPendingRequests)) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center
        w-10 h-10 rounded-full relative
        ${hasPendingRequests
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'}
        dark:bg-gray-700 dark:hover:bg-gray-600
        dark:text-gray-200
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
        dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800
        transition-all duration-200 ease-in-out
        shadow-sm hover:shadow-md
        active:scale-95
      `}
      aria-label={hasPendingRequests ? "Tienes solicitudes de amistad pendientes" : "Ver amigos"}
      title={hasPendingRequests ? "Tienes solicitudes de amistad pendientes" : "Ver amigos"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.672.843A9.998 9.998 0 0 0 12 21.75c-2.502 0-4.847-.655-6.832-1.779A9.38 9.38 0 0 0 3 19.128V16.5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2.628Zm-2.25-10.472a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-5.25 0a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Z" />
      </svg>
      {hasPendingRequests && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-red-700 rounded-full border-2 border-white dark:border-gray-800"></span>
      )}
    </button>
  );
}