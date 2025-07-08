'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, User } from 'lucide-react';
import Image from 'next/image';

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-300 text-sm">Loading...</span>
      </div>
    );
  }

  if (session) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {session.user?.name || 'User'}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {session.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <LogOut size={16} className="text-white" />
          <span className="text-white text-sm font-medium">Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="max-w-xs mx-auto flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
    >
      <LogIn size={16} className="text-white" />
      <span className="text-white text-sm font-medium">Sign in with Google</span>
    </button>
  );
} 