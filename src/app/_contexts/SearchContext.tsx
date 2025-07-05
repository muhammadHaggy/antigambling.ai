'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Character } from '@/lib/types';
import { characters } from '@/lib/characters';

interface SearchContextType {
  searchQuery: string;
  searchResults: Character[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Character[];
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Character[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback((query: string): Character[] => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return [];
    }

    setIsSearching(true);
    const lowercaseQuery = query.toLowerCase().trim();
    
    const results = characters.filter(character => {
      // Search in character name
      const nameMatch = character.name.toLowerCase().includes(lowercaseQuery);
      
      // Search in character description
      const descriptionMatch = character.description.toLowerCase().includes(lowercaseQuery);
      
      // Search in character background story
      const backgroundMatch = character.backgroundStory.toLowerCase().includes(lowercaseQuery);
      
      return nameMatch || descriptionMatch || backgroundMatch;
    });

    // Sort results by relevance (name matches first, then description, then background)
    const sortedResults = results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(lowercaseQuery);
      const bNameMatch = b.name.toLowerCase().includes(lowercaseQuery);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      const aDescMatch = a.description.toLowerCase().includes(lowercaseQuery);
      const bDescMatch = b.description.toLowerCase().includes(lowercaseQuery);
      
      if (aDescMatch && !bDescMatch) return -1;
      if (!aDescMatch && bDescMatch) return 1;
      
      return 0;
    });

    setSearchResults(sortedResults);
    setIsSearching(false);
    return sortedResults;
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    performSearch(query);
  }, [performSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearching,
        setSearchQuery: handleSetSearchQuery,
        performSearch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
} 