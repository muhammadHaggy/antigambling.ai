import SearchBar from './_components/SearchBar';
import CharacterSection from './_components/CharacterSection';

// Sample data for demonstration
const sampleCharacters = [
  {
    id: '1',
    name: 'Elon Musk',
    creator: '@ElonMuskAI',
    description: 'Entrepreneur and business magnate focused on electric vehicles and space exploration.',
    image: '/next.svg',
    interactions: 125000,
  },
  {
    id: '2',
    name: 'Socrates',
    creator: '@PhilosopherAI',
    description: 'Ancient Greek philosopher known for his method of questioning and pursuit of wisdom.',
    image: '/vercel.svg',
    interactions: 89000,
  },
  {
    id: '3',
    name: 'Sherlock Holmes',
    creator: '@DetectiveAI',
    description: 'Brilliant detective with exceptional deductive reasoning and observational skills.',
    image: '/file.svg',
    interactions: 156000,
  },
  {
    id: '4',
    name: 'Marie Curie',
    creator: '@ScienceAI',
    description: 'Pioneering physicist and chemist, first woman to win a Nobel Prize.',
    image: '/globe.svg',
    interactions: 67000,
  },
];

const featuredCharacters = [
  {
    id: '5',
    name: 'Albert Einstein',
    creator: '@GeniusAI',
    description: 'Theoretical physicist who developed the theory of relativity.',
    image: '/window.svg',
    interactions: 234000,
  },
  {
    id: '6',
    name: 'Leonardo da Vinci',
    creator: '@RenaissanceAI',
    description: 'Renaissance polymath known for art, science, and engineering.',
    image: '/next.svg',
    interactions: 178000,
  },
];

export default function Home() {
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
          <CharacterSection title="For you" characters={sampleCharacters} />
          <CharacterSection title="Featured" characters={featuredCharacters} />
        </div>
      </div>
    </div>
  );
}
