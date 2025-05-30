// src/app/edit-chat/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  db,
  collection,
  doc,
  getDoc,
  updateDoc,
  query,
  onSnapshot,
  auth,
} from '@lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useChat } from '../context/ChatContext';

export default function EditChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');

  const [chatName, setChatName] = useState('');
  const [chatColor, setChatColor] = useState('#2563eb');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [initialMembers, setInitialMembers] = useState([]);

  const chatLoadedRef = useRef(false);

  const { setSelectedChatId } = useChat();

  const predefinedColors = [
    '#2563eb', '#dc2626', '#16a34a', '#eab308', '#9333ea', '#ea580c', '#0ea5e9',
    '#f43f5e', '#be185d', '#7c2d12', '#6d28d9', '#0f766e', '#1e40af', '#a21caf',
  ];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const friendsCollectionRef = collection(db, 'users', user.uid, 'friends');
        const q = query(friendsCollectionRef);
        const unsubscribeFriends = onSnapshot(q, async (snapshot) => {
          const friendIds = snapshot.docs
            .filter(doc => doc.data().status === 'accepted')
            .map(doc => doc.id);

          const friendsDataPromises = friendIds.map(async (friendId) => {
            const userDocRef = doc(db, 'users', friendId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              return { id: userDocSnap.id, ...userDocSnap.data() };
            }
            return null;
          });
          const fetchedFriends = (await Promise.all(friendsDataPromises)).filter(Boolean);
          setFriends(fetchedFriends);
        }, (err) => {
          console.error("Error fetching user's friends:", err);
          setError('Error al cargar la lista de amigos.');
        });
        return () => unsubscribeFriends();
      } else {
        router.replace('/auth/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (chatLoadedRef.current || !chatId || !currentUser) {
      if (!chatId && !loading) {
        setError('ID del chat no proporcionado.');
        setLoading(false);
      }
      return;
    }

    const fetchChatData = async () => {
      setLoading(true);
      setError('');
      try {
        const chatDocRef = doc(db, 'chats', chatId);
        const docSnap = await getDoc(chatDocRef);

        if (docSnap.exists()) {
          const chatData = docSnap.data();
          setChatName(chatData.name || '');
          setChatColor(chatData.color || predefinedColors[0]);

          const currentMemberIds = chatData.members || [];

          if (!currentMemberIds.includes(currentUser.uid)) {
            setError('No tienes permiso para editar este chat.');
            setLoading(false);
            return;
          }

          const memberDetailsPromises = currentMemberIds.map(async (memberId) => {
            if (memberId === currentUser.uid) {
              return { id: currentUser.uid, displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Tú' };
            }
            const friendData = friends.find(f => f.id === memberId);
            if (friendData) {
              return friendData;
            } else {
              const userDocRef = doc(db, 'users', memberId);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                return { id: userDocSnap.id, ...userDocSnap.data() };
              }
            }
            return null;
          });

          const fetchedMembers = (await Promise.all(memberDetailsPromises)).filter(Boolean);
          setSelectedMembers(fetchedMembers);
          setInitialMembers(fetchedMembers);
          chatLoadedRef.current = true; 
        } else {
          setError('Chat no encontrado.');
        }
      } catch (err) {
        console.error("Error fetching chat data:", err);
        setError('Error al cargar los datos del chat.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && chatId && friends.length > 0 && !chatLoadedRef.current) {
        fetchChatData();
    }
  }, [chatId, currentUser, friends]); 


  const handleToggleMember = (userToToggle) => {
    setSelectedMembers((prevMembers) =>
      prevMembers.some((member) => member.id === userToToggle.id)
        ? prevMembers.filter((member) => member.id !== userToToggle.id)
        : [...prevMembers, userToToggle]
    );
  };

  const handleUpdateChat = async (e) => {
    e.preventDefault();
    setError('');
    if (!chatName.trim()) {
      setError('El nombre del chat no puede estar vacío.');
      return;
    }
    if (!currentUser || !chatId) {
      setError('No hay usuario autenticado o ID de chat.');
      return;
    }

    setSaving(true);
    try {
      const chatDocRef = doc(db, 'chats', chatId);
      const updatedMembersUids = Array.from(new Set(selectedMembers.map(m => m.id)));

      if (!updatedMembersUids.includes(currentUser.uid)) {
        setError('No puedes eliminarte a ti mismo del chat.');
        setSaving(false);
        return;
      }

      await updateDoc(chatDocRef, {
        name: chatName,
        color: chatColor,
        members: updatedMembersUids,
      });

      console.log('Chat actualizado con ID: ', chatId);
      setSelectedChatId(chatId);
      router.push('/home');
    } catch (err) {
      console.error('Error updating chat:', err);
      setError('Error al actualizar el chat. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-2xl font-bold text-blue-600 dark:text-blue-300 dark:bg-gray-900 pt-16">
        Cargando datos del chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 p-4 pt-16 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-blue-200 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8 dark:text-blue-400">Editar Chat</h2>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleUpdateChat} className="space-y-6">
          <div>
            <label htmlFor="chatName" className="block text-lg font-medium text-gray-700 mb-2 dark:text-gray-200">
              Nombre del Chat:
            </label>
            <input
              type="text"
              id="chatName"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Nombre del chat"
              className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2 dark:text-gray-200">
              Color del Chat:
            </label>
            <div className="grid grid-cols-7 gap-3 p-2 border border-blue-300 rounded-lg dark:border-gray-600 bg-blue-50 dark:bg-gray-700">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setChatColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                  style={{
                    backgroundColor: color,
                    borderColor: chatColor === color ? 'white' : 'transparent',
                    boxShadow: chatColor === color
                      ? `0 0 0 3px ${color}, 0 0 0 5px ${color === '#ffffff' ? '#000000' : 'white'}`
                      : 'none',
                    outline: chatColor === color ? `3px solid ${color === '#ffffff' ? '#000000' : 'white'}` : 'none'
                  }}
                  title={color}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Color seleccionado: <span className="font-semibold" style={{ color: chatColor }}>{chatColor}</span></p>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3 dark:text-gray-200">
              Miembros del Chat:
            </label>
            {loading ? (
              <p className="text-center text-gray-500 dark:text-gray-400">Cargando miembros...</p>
            ) : friends.length === 0 && selectedMembers.length <= 1 ? (
              <p className="text-center text-gray-500 text-sm dark:text-gray-400">No hay amigos disponibles para añadir.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-blue-200 rounded-lg p-2 bg-blue-50 dark:border-gray-600 dark:bg-gray-700">
                {currentUser && (
                  <div
                    key={currentUser.uid}
                    className="flex items-center justify-between p-3 mb-2 bg-white rounded-md shadow-sm dark:bg-gray-800 dark:shadow-none"
                  >
                    <span className="text-gray-800 font-medium dark:text-gray-100">
                      {currentUser.displayName || currentUser.email.split('@')[0]} (Tú)
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedMembers.some((member) => member.id === currentUser.uid)}
                      disabled={true}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 dark:text-blue-500"
                    />
                  </div>
                )}

                {friends.filter(friend => friend.id !== currentUser?.uid).map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 mb-2 bg-white rounded-md shadow-sm hover:bg-blue-100 transition duration-150 cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-600 dark:shadow-none"
                    onClick={() => handleToggleMember(friend)}
                  >
                    <span className="text-gray-800 font-medium dark:text-gray-100">
                      {friend.displayName || friend.email.split('@')[0]}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedMembers.some((member) => member.id === friend.id)}
                      onChange={() => handleToggleMember(friend)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 dark:text-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg
                       focus:outline-none focus:shadow-outline transition duration-200
                       shadow-md border border-blue-700
                       disabled:bg-blue-300 disabled:cursor-not-allowed
                       dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-gray-100
                       dark:disabled:bg-blue-900 dark:border-blue-900"
          >
            {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/home')}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg
                       focus:outline-none focus:shadow-outline transition duration-200
                       shadow-md border border-gray-400
                       dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100
                       dark:border-gray-600"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}