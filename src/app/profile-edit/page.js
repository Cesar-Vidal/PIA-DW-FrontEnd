// src/app/profile-edit/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
// Assuming @lib/firebase exports 'auth' and 'firestore' correctly
import { auth, updateProfile, firestore } from '@lib/firebase'; // <-- firestore imported here
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // <-- doc and setDoc are imported from firebase/firestore

import DefaultAvatar from '../../../public/DefaultAvatar/default_avatar.png';


export default function ProfileEditPage() {
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();


  const fileInputRef = useRef(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setDisplayName(user.displayName || '');
        setPhotoURL(user.photoURL || '');
      } else {
        router.replace('/auth/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result);
      };
      reader.onerror = (readError) => {
        console.error("Error al leer el archivo:", readError);
        setError("No se pudo leer la imagen seleccionada.");
        setPhotoURL('');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setSuccess(false);

  if (!currentUser) {
    setError('No hay usuario autenticado.');
    return;
  }

  setSaving(true);
  try {
    // 1. Update Firebase Authentication profile
    await updateProfile(currentUser, {
      displayName: displayName,
      photoURL: photoURL,
    });

    // 2. Update Firestore document
    // Ensure 'firestore' is the actual Firestore instance
    await setDoc(doc(firestore, 'users', currentUser.uid), {
      uid: currentUser.uid,
      displayName: displayName,
      avatarBase64: photoURL, // Storing Base64 in Firestore
    }, { merge: true }); // Use { merge: true } to update existing fields without overwriting the entire document

    setSuccess(true);
    console.log('Perfil actualizado en Firestore y Auth!');
  } catch (err) {
    console.error("Error al actualizar el perfil:", err);
    setError(err.message);
  } finally {
    setSaving(false);
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-bold text-blue-600 dark:text-blue-400">Cargando perfil...</div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 p-4 pt-20
                     dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-blue-200
                       dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6 dark:text-blue-400">Editar Perfil</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-200">Nombre de Usuario:</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="shadow appearance-none border border-blue-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500
                         dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-600"
              placeholder="Tu nombre para el chat"
            />
          </div>

          <div>
            <label htmlFor="photoURLInput" className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-200">Imagen de Perfil:</label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />

            <button
              type="button"
              onClick={triggerFileInput}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 shadow-sm
                         dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 mb-2"
            >
              Subir Imagen desde el dispositivo
            </button>

            {(photoURL || currentUser?.photoURL) && (
              <img src={photoURL || currentUser.photoURL || DefaultAvatar.src} alt="Vista previa" className="mt-4 w-24 h-24 rounded-full object-cover border-2 border-blue-200 shadow-md mx-auto
              dark:border-gray-600" />
            )}
          </div>

          {error && <p className="text-red-500 text-sm italic bg-red-100 p-2 rounded-md dark:bg-red-900 dark:text-red-200">{error}</p>}
          {success && <p className="text-green-500 text-sm italic bg-green-100 p-2 rounded-md dark:bg-green-900 dark:text-green-200">¡Perfil actualizado con éxito!</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 shadow-md
                       disabled:bg-blue-300 disabled:cursor-not-allowed
                       dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-gray-100 dark:disabled:bg-blue-900"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/chats')}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 shadow-md
                       dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
          >
            Volver a Mis Chats
          </button>

        </form>
      </div>
    </div>
  );
}