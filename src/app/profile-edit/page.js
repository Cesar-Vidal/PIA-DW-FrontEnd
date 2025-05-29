// src/app/profile-edit/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { auth, updateProfile } from '@lib/firebase';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

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
      await updateProfile(currentUser, {
        displayName: displayName,
        photoURL: photoURL,
      });
      setSuccess(true);
      console.log('Perfil actualizado exitosamente!');
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
            <label htmlFor="photoURL" className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-200">URL de la Imagen de Perfil:</label> 
            <input
              type="text"
              id="photoURL"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="shadow appearance-none border border-blue-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500
                         dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-600" 
              placeholder="Ej: https://ejemplo.com/tu_imagen.jpg"
            />
            {(photoURL || currentUser?.photoURL) && ( 
              <img src={photoURL || currentUser.photoURL || DefaultAvatar.src} alt="Vista previa" className="mt-4 w-24 h-24 rounded-full object-cover border-2 border-blue-200 shadow-md mx-auto
              dark:border-gray-600" /> 
            )}
          </div>

          {error && <p className="text-red-500 text-sm italic bg-red-100 p-2 rounded-md dark:bg-red-900 dark:text-red-200">{error}</p>} 
          {success && <p className="text-green-500 text-sm italic bg-green-100 p-2 rounded-md dark:bg-green-900 dark:text-green-200">¡Perfil actualizado con éxito!</p>} 

          {/* Botón Guardar Cambios */}
          <button
            type="submit"
            disabled={saving} // Deshabilita el botón mientras se guarda
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 shadow-md
                       disabled:bg-blue-300 disabled:cursor-not-allowed
                       dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-gray-100 dark:disabled:bg-blue-900" 
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'} 
          </button>

          <button
            type="button"
            onClick={() => router.push('/home')}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 shadow-md
                       dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100" 
          >
            Volver a Inicio
          </button>

        </form>
      </div>
    </div>
  );
}