import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Share, Settings } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  creator: string;
  avatar: string;
}

interface ChatHeaderProps {
  character: Character;
}

export default function ChatHeader({ character }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Back button and character info */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-300" />
          </Link>
          
          <div className="flex items-center gap-3">
            <Image
              src={character.avatar}
              alt={character.name}
              width={40}
              height={40}
              className="rounded-full bg-gray-700"
            />
            <div>
              <h3 className="font-semibold text-white">{character.name}</h3>
              <p className="text-sm text-gray-400">{character.creator}</p>
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Share size={18} className="text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Settings size={18} className="text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
} 