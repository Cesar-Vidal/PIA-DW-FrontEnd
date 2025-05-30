// src/app/auth/register/page.js
'use client';

import React, { useState } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  provider,
  upsertUserDocument // <-- NUEVA IMPORTACIÓN
} from "@lib/firebase"; // Asegúrate de que upsertUserDocument esté exportado desde tu firebase.js
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const onSignUpHandle = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await upsertUserDocument(user); // <-- LLAMADA A LA NUEVA FUNCIÓN

      console.log('Registration successful!');
      router.push('/home');
    } catch (err) {
      setError(err.message);
      console.error("Error during email/password registration:", err);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await upsertUserDocument(user); // <-- LLAMADA A LA NUEVA FUNCIÓN

      console.log('Google Sign-up successful:', user.email);
      router.push('/home');
    } catch (err) {
      setError(err.message);
      console.error("Error during Google Sign-up:", err);
    }
  };

  return (
    // ... (Tu JSX y Tailwind CSS sin cambios)
    <div className='w-full h-screen flex items-center justify-center
                     bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200
                     dark:from-gray-800 dark:via-gray-900 dark:to-black'>

      <div className='w-11/12 max-w-[700px] px-10 py-20 rounded-3xl
                      bg-white bg-opacity-30 backdrop-blur-md
                      border-2 border-white border-opacity-50
                      shadow-xl shadow-blue-300/50
                      dark:bg-gray-900 dark:bg-opacity-50 dark:border-gray-700 dark:border-opacity-50 dark:shadow-purple-900/50'>

        <h1 className='text-5xl font-semibold text-gray-800
                       dark:text-white'>
          Register
        </h1>
        <p className='font-medium text-lg text-gray-700 mt-4
                      dark:text-gray-300'>
          Welcome! Please enter your details to create an account.
        </p>

        <div className='mt-8'>
          <div className='flex flex-col'>
            <label className='text-lg font-medium text-gray-700
                              dark:text-gray-200' htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full border-2 border-white border-opacity-70 rounded-xl p-4 mt-1 bg-white bg-opacity-60 placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400
                        dark:bg-gray-800 dark:bg-opacity-60 dark:border-gray-700 dark:border-opacity-70 dark:placeholder-gray-400 dark:text-gray-100 dark:focus:ring-purple-500'
              placeholder="Enter your email"
              type="email"
            />
          </div>

          <div className='flex flex-col mt-4'>
            <label className='text-lg font-medium text-gray-700
                              dark:text-gray-200' htmlFor="password">Password</label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full border-2 border-white border-opacity-70 rounded-xl p-4 mt-1 bg-white bg-opacity-60 placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400
                        dark:bg-gray-800 dark:bg-opacity-60 dark:border-gray-700 dark:border-opacity-70 dark:placeholder-gray-400 dark:text-gray-100 dark:focus:ring-purple-500'
              placeholder="Enter your password"
              type="password"
            />
          </div>

          <div className='mt-8 flex flex-col gap-y-4'>
            <button
              onClick={onSignUpHandle}
              className='active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01] ease-in-out transform py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-bold text-lg shadow-md hover:shadow-lg
                        dark:from-purple-700 dark:to-indigo-600 dark:hover:from-purple-800 dark:hover:to-indigo-700'
            >
              Register
            </button>
            <button
              onClick={handleGoogleSignUp}
              className='flex items-center justify-center gap-2 active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01] ease-in-out transform py-4 rounded-xl text-gray-800 font-semibold text-lg border-2 border-white border-opacity-70 bg-white bg-opacity-60 hover:bg-opacity-80 shadow-md hover:shadow-lg
                        dark:text-gray-200 dark:border-gray-700 dark:border-opacity-70 dark:bg-gray-800 dark:bg-opacity-60 dark:hover:bg-opacity-80'
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.26644 9.76453C6.19903 6.93863 8.85469 4.90909 12.0002 4.90909C13.6912 4.90909 15.2184 5.50909 16.4184 6.49091L19.9093 3C17.7821 1.14545 15.0548 0 12.0002 0C7.27031 0 3.19799 2.6983 1.24023 6.65002L5.26644 9.76453Z" fill="#EA4335"/>
                <path d="M16.0406 18.0142C14.9508 18.718 13.5659 19.0926 11.9998 19.0926C8.86633 19.0926 6.21896 17.0785 5.27682 14.2695L1.2373 17.3366C3.19263 21.2953 7.26484 24.0017 11.9998 24.0017C14.9327 24.0017 17.7352 22.959 19.834 21.0012L16.0406 18.0142Z" fill="#34A853"/>
                <path d="M19.8342 20.9978C22.0292 18.9503 23.4545 15.9019 23.4545 11.9982C23.4545 11.2891 23.3455 10.5255 23.1818 9.81641H12V14.4528H18.4364C18.1188 16.0119 17.2663 17.2194 16.0407 18.0108L19.8342 20.9978Z" fill="#4A90E2"/>
                <path d="M5.27698 14.2663C5.03833 13.5547 4.90909 12.7922 4.90909 11.9984C4.90909 11.2167 5.03444 10.4652 5.2662 9.76294L1.23999 6.64844C0.436587 8.25884 0 10.0738 0 11.9984C0 13.918 0.444781 15.7286 1.23746 17.3334L5.27698 14.2663Z" fill="#FBBC05"/>
              </svg>
              Sign up with Google
            </button>
          </div>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

          <div className='mt-8 flex justify-center items-center'>
            <p className='font-medium text-base text-gray-700
                          dark:text-gray-300'>Already have an account?</p>
            <button
              onClick={() => router.push('/auth/login')}
              className='ml-2 font-medium text-base text-blue-600 hover:text-blue-800 transition-colors duration-200
                        dark:text-blue-400 dark:hover:text-blue-300'
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}