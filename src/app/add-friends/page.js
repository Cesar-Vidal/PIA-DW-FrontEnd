// src/app/add-friends/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  db,
  auth,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  getDoc
} from '@lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AddFriendsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [friends, setFriends] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.replace('/auth/login');
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, [router]);

useEffect(() => {
    if (!currentUser) return;
    console.log("Listening for friends/requests for user:", currentUser.uid);

    const userFriendsRef = collection(db, 'users', currentUser.uid, 'friends');

    const unsubscribe = onSnapshot(userFriendsRef, async (snapshot) => {
        console.log("Snapshot received for friends:", snapshot.docs.length, "docs");
        const allFriendsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const accepted = [];
        const sent = [];
        const received = [];

        const friendDataPromises = allFriendsData.map(async (friend) => {
            try {
                const friendUserDocRef = doc(db, 'users', friend.id);
                const friendUserDocSnap = await getDoc(friendUserDocRef);

                if (friendUserDocSnap.exists()) {
                    const friendUserData = friendUserDocSnap.data();
                    const friendDisplayName = friendUserData?.displayName || friendUserData?.email?.split('@')[0];
                    return { ...friend, displayName: friendDisplayName };
                } else {
                    console.warn("Friend user document not found for UID:", friend.id);
                    return { ...friend, displayName: "[Usuario Desconocido]" };
                }
            } catch (innerErr) {
                console.error("Error fetching friend details for", friend.id, ":", innerErr);
                return { ...friend, displayName: "[Error al Cargar]" };
            }
        });

        const resolvedFriendsData = await Promise.all(friendDataPromises);

        resolvedFriendsData.forEach((friend) => {
            if (friend.status === 'accepted') {
                accepted.push(friend);
            } else if (friend.status === 'pending' && friend.initiatedBy === currentUser.uid) {
                sent.push(friend);
            } else if (friend.status === 'pending' && friend.initiatedBy !== currentUser.uid) {
                received.push(friend);
            }
        });

        setFriends(accepted);
        setPendingSent(sent);
        setPendingReceived(received);
        console.log("Friends (Accepted):", accepted);
        console.log("Requests (Sent):", sent);
        console.log("Requests (Received):", received);

    }, (err) => {
        console.error("Error fetching friends/requests (onSnapshot callback error):", err);
        setError(`Error al cargar amigos y solicitudes: ${err.message}`);
    });

    return () => unsubscribe();
}, [currentUser]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSearchResults([]);
    if (!searchTerm.trim()) {
      setError('Por favor, ingresa un término de búsqueda.');
      return;
    }
    if (!currentUser) return;

    setLoadingUser(true);
    try {
      const usersRef = collection(db, 'users');
      const qDisplayName = query(
        usersRef,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff')
      );
      const qEmail = query(
        usersRef,
        where('email', '>=', searchTerm),
        where('email', '<=', searchTerm + '\uf8ff')
      );

      const [displayNameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(qDisplayName),
        getDocs(qEmail)
      ]);

      const results = {};
      displayNameSnapshot.forEach(doc => {
        results[doc.id] = { id: doc.id, ...doc.data() };
      });
      emailSnapshot.forEach(doc => {
        results[doc.id] = { id: doc.id, ...doc.data() };
      });

      const uniqueResults = Object.values(results).filter(
        (user) =>
          user.id !== currentUser.uid &&
          !friends.some((f) => f.id === user.id) &&
          !pendingSent.some((p) => p.id === user.id) &&
          !pendingReceived.some((p) => p.id === user.id)
      );

      setSearchResults(uniqueResults);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Error al buscar usuarios.');
    } finally {
      setLoadingUser(false);
    }
  };

  const sendFriendRequest = async (targetUserId) => {
    if (!currentUser) return;
    setError('');

    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'friends', targetUserId), {
        status: 'pending',
        initiatedBy: currentUser.uid,
        timestamp: serverTimestamp(),
      });

      await setDoc(doc(db, 'users', targetUserId, 'friends', currentUser.uid), {
        status: 'pending',
        initiatedBy: currentUser.uid,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Error al enviar la solicitud de amistad.');
    }
  };

  const acceptFriendRequest = async (requesterId) => {
    if (!currentUser) return;
    setError('');

    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'friends', requesterId), {
        status: 'accepted',
      });

      await updateDoc(doc(db, 'users', requesterId, 'friends', currentUser.uid), {
        status: 'accepted',
      });
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Error al aceptar la solicitud.');
    }
  };

  const removeFriendOrRequest = async (targetUserId, type = 'request') => {
    if (!currentUser) return;
    setError('');

    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'friends', targetUserId));
      await deleteDoc(doc(db, 'users', targetUserId, 'friends', currentUser.uid));
    } catch (err) {
      console.error('Error removing friend or request:', err);
      setError(`Error al ${type === 'friend' ? 'eliminar amigo' : 'gestionar solicitud'}.`);
    }
  };


  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 dark:text-gray-200 p-4 pt-20">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-blue-200 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8 dark:text-blue-400">Gestión de Amigos</h2>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
            {error}
          </p>
        )}

        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-blue-600 mb-4 dark:text-blue-300">Buscar Usuarios</h3>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="flex-grow px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={loadingUser}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md disabled:bg-blue-300 dark:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-blue-900 dark:shadow-none"
            >
              Buscar
            </button>
          </form>

          <div className="mt-4 space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg shadow-sm dark:bg-gray-700 dark:shadow-none"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                  <button
                    onClick={() => sendFriendRequest(user.id)}
                    className="bg-green-500 text-white text-sm py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 dark:bg-green-700 dark:hover:bg-green-600"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              ))
            ) : (
              searchTerm && !loadingUser && <p className="text-center text-gray-500 mt-4 dark:text-gray-400">No se encontraron resultados.</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-purple-600 mb-4 dark:text-purple-300">Solicitudes Recibidas ({pendingReceived.length})</h3>
          <div className="space-y-3">
            {pendingReceived.length > 0 ? (
              pendingReceived.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg shadow-sm dark:bg-gray-700 dark:shadow-none"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {req.displayName}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => acceptFriendRequest(req.id)}
                      className="bg-green-500 text-white text-sm py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 dark:bg-green-700 dark:hover:bg-green-600"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => removeFriendOrRequest(req.id, 'request')}
                      className="bg-red-500 text-white text-sm py-2 px-4 rounded-md hover:bg-red-600 transition duration-200 dark:bg-red-700 dark:hover:bg-red-600"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">No tienes solicitudes de amistad pendientes.</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-orange-600 mb-4 dark:text-orange-300">Solicitudes Enviadas ({pendingSent.length})</h3>
          <div className="space-y-3">
            {pendingSent.length > 0 ? (
              pendingSent.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg shadow-sm dark:bg-gray-700 dark:shadow-none"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {req.displayName} (Pendiente)
                  </span>
                  <button
                    onClick={() => removeFriendOrRequest(req.id, 'request')}
                    className="bg-gray-400 text-white text-sm py-2 px-4 rounded-md hover:bg-gray-500 transition duration-200 dark:bg-gray-600 dark:hover:bg-gray-500"
                  >
                    Cancelar Solicitud
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">No has enviado solicitudes de amistad pendientes.</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-blue-600 mb-4 dark:text-blue-300">Mis Amigos ({friends.length})</h3>
          <div className="space-y-3">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg shadow-sm dark:bg-gray-700 dark:shadow-none"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {friend.displayName}
                  </span>
                  <button
                    onClick={() => removeFriendOrRequest(friend.id, 'friend')}
                    className="bg-red-500 text-white text-sm py-2 px-4 rounded-md hover:bg-red-600 transition duration-200 dark:bg-red-700 dark:hover:bg-red-600"
                  >
                    Eliminar Amigo
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">Aún no tienes amigos. ¡Envía algunas solicitudes!</p>
            )}
          </div>
        </div>

        <Link href="/chats" className="block w-full text-center bg-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-400 transition duration-200 shadow-md mt-6 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:shadow-none">
          Volver a Mis Chats
        </Link>
      </div>
    </div>
  );
}