'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from './_components/SearchBar';
import CharacterSection from './_components/CharacterSection';
import CharacterCard from './_components/CharacterCard';
import LoginButton from './_components/LoginButton';
import { getPublicCharacters } from '@/lib/characters';
import { useSearch } from './_contexts/SearchContext';
import { Character } from '@/lib/types';
import { useSession } from 'next-auth/react';

function HomeContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const { searchQuery, searchResults, setSearchQuery, clearSearch } = useSearch();
  const [displayCharacters, setDisplayCharacters] = useState<Character[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const allCharacters = useMemo(() => getPublicCharacters(), []);

  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam && searchParam !== searchQuery) {
      setSearchQuery(searchParam);
      setIsSearchMode(true);
    } else if (!searchQuery) {
      setIsSearchMode(false);
      setDisplayCharacters(allCharacters);
    }
  }, [searchParams, setSearchQuery, searchQuery, allCharacters]);

  useEffect(() => {
    if (searchQuery) {
      setIsSearchMode(true);
      setDisplayCharacters(searchResults);
    } else {
      setIsSearchMode(false);
      setDisplayCharacters(allCharacters);
    }
  }, [searchQuery, searchResults, allCharacters]);

  const handleSearchChange = (query: string) => {
    if (!query.trim()) {
      setIsSearchMode(false);
      clearSearch();
    }
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="h-full bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="h-full bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <svg className="mx-auto h-16 w-16 text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h1 className="text-3xl font-bold mb-4">Selamat Datang di AntiGambling.ai</h1>
            <p className="text-gray-400 mb-8">
              Silakan login untuk memulai percakapan dengan karakter AI dan meminta saran finansial.
            </p>
          </div>
          <LoginButton />
          <div className="mt-6">
            <a 
              href="/landing" 
              className="text-blue-400 hover:text-blue-300 underline text-sm"
            >
              Pelajari lebih lanjut tentang AntiGambling.AI
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Split characters into sections for better organization (when not searching)
  const victimCharacters = displayCharacters.slice(0, 3);
  const expertCharacters = displayCharacters.slice(3, 5);
  const religiousCharacters = displayCharacters.slice(5);

  return (
    <div className="h-full bg-gray-950 text-white overflow-y-auto overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-full">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 break-words">
            {isSearchMode && searchQuery ? (
              <>Search results for: <span className="text-purple-400">&quot;{searchQuery}&quot;</span></>
            ) : (
              <>Selamat datang, <span className="text-blue-400">{session?.user?.name || session?.user?.email}</span>!</>
            )}
          </h1>
          
          <SearchBar onSearch={handleSearchChange} />
        </div>

        {/* Characters Display */}
        {isSearchMode && searchQuery ? (
          // Search results view
          <div>
            {displayCharacters.length > 0 ? (
              <div className="grid gap-4 md:gap-6">
                                 {displayCharacters.map((character) => (
                   <CharacterCard 
                     key={character.id} 
                     id={character.id}
                     name={character.name}
                     creator={character.creator}
                     description={character.description}
                     avatar={character.avatar}
                     interactions={character.interactions}
                   />
                 ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No characters found matching your search.</p>
              </div>
            )}
          </div>
        ) : (
          // Default sectioned view
          <div className="flex flex-col gap-8">
            <CharacterSection
              title="Mantan Korban Judi"
              characters={victimCharacters}
            />
            <CharacterSection
              title="Ahli Finansial & Psikolog"
              characters={expertCharacters}
            />
            <CharacterSection
              title="Tokoh Agama"
              characters={religiousCharacters}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-full bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

