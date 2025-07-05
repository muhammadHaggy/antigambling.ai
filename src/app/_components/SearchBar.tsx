'use client';

import { Search, X } from 'lucide-react';
import { useSearch } from '@/app/_contexts/SearchContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({ onSearch, placeholder = "Search characters...", autoFocus = false }: SearchBarProps) {
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();
  const router = useRouter();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    setSearchQuery(value);
    
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      // Navigate to search results if we have a query
      router.push(`/?search=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    clearSearch();
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={16} className="text-gray-400" />
      </div>
      <input
        type="text"
        value={localQuery}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-10 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
      />
      {localQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
} 