// src/app/create-chat/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  auth,
  query,
  getDoc,
  doc,
  onSnapshot
} from '@lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useChat } from '../context/ChatContext';

export default function CreateChatPage() {
  const [chatName, setChatName] = useState('');
  const [chatColor, setChatColor] = useState('#2563eb'); // Cambiado el valor por defecto para que coincida con el primer color de la lista
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const router = useRouter();
  const { setSelectedChatId } = useChat();

  // Define los 14 colores predefinidos (2 filas de 7)
  const predefinedColors = [
    '#2563eb', // blue-600 (azul)
    '#dc2626', // red-600 (rojo)
    '#16a34a', // green-600 (verde)
    '#eab308', // yellow-500 (amarillo)
    '#9333ea', // purple-600 (púrpura)
    '#ea580c', // orange-600 (naranja)
    '#0ea5e9', // sky-500 (azul cielo)
    '#f43f5e', // rose-500 (rosa fuerte)
    '#be185d', // pink-700 (rosa oscuro)
    '#7c2d12', // amber-800 (marrón-rojizo)
    '#6d28d9', // violet-700 (violeta más oscuro)
    '#0f766e', // teal-700 (verde azulado)
    '#1e40af', // blue-800 (azul más oscuro)
    '#a21caf', // fuchsia-700 (fucsia)
  ];


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.replace('/auth/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!currentUser) {
      setFriends([]);
      return;
    }

    const friendsCollectionRef = collection(db, 'users', currentUser.uid, 'friends');
    const q = query(friendsCollectionRef);

    const unsubscribe = onSnapshot(q, async (snapshot) => {
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

    return () => unsubscribe();
  }, [currentUser]);


  const handleToggleMember = (userToAdd) => {
    setSelectedMembers((prevMembers) =>
      prevMembers.some((member) => member.id === userToAdd.id)
        ? prevMembers.filter((member) => member.id !== userToAdd.id)
        : [...prevMembers, userToAdd]
    );
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    setError('');
    if (!chatName.trim()) {
      setError('El nombre del chat no puede estar vacío.');
      return;
    }
    if (!currentUser) {
      setError('No hay usuario autenticado.');
      return;
    }

    setLoading(true);
    try {
      const initialMembersUids = [
        currentUser.uid,
        ...selectedMembers.map((member) => member.id),
      ];

      const newChatRef = await addDoc(collection(db, 'chats'), {
        name: chatName,
        color: chatColor, // Usamos el color seleccionado de los predefinidos
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        members: Array.from(new Set(initialMembersUids)),
      });

      await addDoc(collection(db, 'chats', newChatRef.id, 'messages'), {
        text: `¡Bienvenido al chat "${chatName}"! Creado por ${currentUser.displayName || currentUser.email.split('@')[0]}.`,
        createdAt: serverTimestamp(),
        uid: 'system',
        displayName: 'Sistema',
      });

      console.log('Chat creado con ID: ', newChatRef.id);
      setSelectedChatId(newChatRef.id);
      router.push('/home'); // Al crear un chat, te lleva a la vista de ese chat
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Error al crear el chat. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 p-4 pt-16 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-blue-200 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8 dark:text-blue-400">Crear Nuevo Chat</h2>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleCreateChat} className="space-y-6">
          <div>
            <label htmlFor="chatName" className="block text-lg font-medium text-gray-700 mb-2 dark:text-gray-200">
              Nombre del Chat:
            </label>
            <input
              type="text"
              id="chatName"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Ej: Amigos del gym, Proyecto secreto"
              className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2 dark:text-gray-200">
              Color del Chat:
            </label>
            {/* Ajusta la clase 'grid' para controlar el número de columnas */}
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
                    boxShadow: chatColor === color ? '0 0 0 3px ' + color + ', 0 0 0 5px white' : 'none',
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
              Seleccionar Amigos para el Chat (opcional):
            </label>
            {loading ? (
              <p className="text-center text-gray-500 dark:text-gray-400">Cargando amigos...</p>
            ) : friends.length === 0 ? (
              <p className="text-center text-gray-500 text-sm dark:text-gray-400">No tienes amigos aún. ¡Agregalos en Agregar Amigos!</p>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-blue-200 rounded-lg p-2 bg-blue-50 dark:border-gray-600 dark:bg-gray-700">
                {friends.map((friend) => (
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
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-blue-900 dark:shadow-none"
          >
            {loading ? 'Creando Chat...' : 'Crear Chat'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/chats')}
            className="w-full bg-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-400 transition duration-200 shadow-md dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:shadow-none"
          >
            Volver a Mis Chats
          </button>
        </form>
      </div>
    </div>
  );
}