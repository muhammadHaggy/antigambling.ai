'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from './_components/SearchBar';
import CharacterSection from './_components/CharacterSection';
import CharacterCard from './_components/CharacterCard';
import { getPublicCharacters } from '@/lib/characters';
import { useSearch } from './_contexts/SearchContext';
import { Character } from '@/lib/types';

function HomeContent() {
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

  // Split characters into sections for better organization (when not searching)
  const featuredCharacters = displayCharacters.slice(0, 3);
  const moreCharacters = displayCharacters.slice(3);

  return (
    <div className="h-full bg-gray-950 text-white overflow-y-auto">
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">
            {isSearchMode && searchQuery ? (
              <>Search results for: <span className="text-purple-400">&quot;{searchQuery}&quot;</span></>
            ) : (
              <>Welcome back, <span className="text-blue-400">User</span></>
            )}
          </h1>
          
          {/* Search Bar */}
          <SearchBar onSearch={handleSearchChange} />
        </div>

        {/* Search Results or Character Sections */}
        {isSearchMode ? (
          <div className="space-y-6">
            {searchResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {searchResults.length} character{searchResults.length !== 1 ? 's' : ''} found
                  </h2>
                  <button
                    onClick={() => {
                      clearSearch();
                      setIsSearchMode(false);
                      window.history.pushState({}, '', '/');
                    }}
                    className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                  >
                    Clear search
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.map((character) => (
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
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No characters found</h3>
                <p className="text-gray-400 mb-4">
                  Try adjusting your search terms or browse all characters below.
                </p>
                <button
                  onClick={() => {
                    clearSearch();
                    setIsSearchMode(false);
                    window.history.pushState({}, '', '/');
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse All Characters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <CharacterSection title="Featured Characters" characters={featuredCharacters} />
            {moreCharacters.length > 0 && (
              <CharacterSection title="More Characters" characters={moreCharacters} />
            )}
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

