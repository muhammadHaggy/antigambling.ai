import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare } from 'lucide-react';

interface CharacterCardProps {
  id: string;
  name: string;
  creator: string;
  description: string;
  avatar: string;
  interactions: number;
}

export default function CharacterCard({
  id,
  name,
  creator,
  description,
  avatar,
  interactions,
}: CharacterCardProps) {
  return (
    <Link
      href={`/chat/${id}`}
      className="block bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02] min-w-[280px] max-w-[320px]"
    >
      <div className="aspect-video relative mb-3 rounded-lg overflow-hidden">
        <Image
          src={avatar}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-white text-lg leading-tight">
          {name}
        </h3>
        
        <p className="text-gray-400 text-sm">
          By {creator}
        </p>
        
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center gap-1 text-gray-400 text-sm pt-1">
          <MessageSquare size={14} />
          <span>{interactions.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
} 