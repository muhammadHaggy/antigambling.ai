import SearchBar from './_components/SearchBar';
import CharacterSection from './_components/CharacterSection';
import { getPublicCharacters } from '@/lib/characters';

export default function Home() {
  const allCharacters = getPublicCharacters();
  
  // Split characters into sections for better organization
  const featuredCharacters = allCharacters.slice(0, 3);
  const moreCharacters = allCharacters.slice(3);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">
            Welcome back, <span className="text-blue-400">User</span>
          </h1>
          
          {/* Search Bar */}
          <SearchBar />
        </div>

        {/* Character Sections */}
        <div className="space-y-8">
          <CharacterSection title="Featured Characters" characters={featuredCharacters} />
          {moreCharacters.length > 0 && (
            <CharacterSection title="More Characters" characters={moreCharacters} />
          )}
        </div>
      </div>
    </div>
  );
}
