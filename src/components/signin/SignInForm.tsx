'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Chrome } from 'lucide-react';

import { signIn } from 'next-auth/react';

const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Note: Email/Password login needs CredentialsProvider in authOptions
    alert("Email login is not fully set up yet. Please use Google Sign In for now.");
  };

  const handleGoogleSignIn = () => {
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    signIn('google', { callbackUrl });
  };

  return (
    <div className='p-8 lg:p-12 flex flex-col justify-center bg-white'>
      <h1 className='text-3xl font-bold text-gray-900 mb-6 text-center'>
        Sign In to MetaKlik
      </h1>
      <form method='POST' className='space-y-6' onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700'
          >
            Email address
          </label>
          <div className='mt-1 relative rounded-md shadow-sm'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Mail className='h-5 w-5 text-gray-500' aria-hidden='true' />
            </div>
            <input
              type='email'
              name='email'
              id='email'
              className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              placeholder='you@example.com'
            />
          </div>
        </div>
        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-700'
          >
            Password
          </label>
          <div className='mt-1 relative rounded-md shadow-sm'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Lock className='h-5 w-5 text-gray-500' aria-hidden='true' />
            </div>
            <input
              type='password'
              name='password'
              id='password'
              className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              placeholder='••••••••'
            />
          </div>
        </div>
        <div className='flex items-center justify-between'>
          <div className='text-sm'>
            <a
              href='/maintenance'
              className='font-medium text-indigo-600 hover:text-indigo-500'
            >
              Forgot your password?
            </a>
          </div>
        </div>
        <div>
          <button
            type='submit'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-linear-to-br from-slate-900 via-slate-800 to-indigo-900 hover:from-slate-900 hover:via-slate-800 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:shadow-lg transition-all ease-in-out duration-300 '
          >
            Sign In
          </button>
        </div>
      </form>
      <div className='mt-6 relative'>
        <div className='absolute inset-0 flex items-center' aria-hidden='true'>
          <div className='w-full border-t border-gray-300' />
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='px-2 bg-white text-gray-500'>Or continue with</span>
        </div>
      </div>
      <div className='mt-6'>
        <button
          type='button'
          onClick={handleGoogleSignIn}
          className='w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          <Chrome className='h-5 w-5 mr-2' />
          Sign in with Google
        </button>
      </div>
      <div className='mt-6 text-center text-sm text-gray-500'>
        Don&apos;t have an account?{' '}
        <a
          href='/maintenance'
          className='font-medium text-indigo-600 hover:text-indigo-500'
        >
          Sign Up
        </a>
      </div>
    </div>
  );
};

export default SignInForm;
