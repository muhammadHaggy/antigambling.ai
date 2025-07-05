'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Home, Search, MessageSquare, Settings, Crown } from 'lucide-react';
import LoginButton from './LoginButton';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  isActive?: boolean;
}

function NavItem({ icon, text, href, isActive }: NavItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-gray-800 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
      >
        {icon}
        <span className="text-sm font-medium">{text}</span>
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">character.ai</h1>
        </div>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
          <Plus size={16} className="text-gray-300" />
          <span className="text-sm font-medium text-gray-300">Create</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <NavItem
            icon={<Home size={18} />}
            text="Discover"
            href="/"
            isActive={pathname === '/'}
          />
          <NavItem
            icon={<Search size={18} />}
            text="Search"
            href="/search"
            isActive={pathname === '/search'}
          />
          <NavItem
            icon={<MessageSquare size={18} />}
            text="Chats"
            href="/chats"
            isActive={pathname.startsWith('/chat')}
          />
          <NavItem
            icon={<Settings size={18} />}
            text="Settings"
            href="/settings"
            isActive={pathname === '/settings'}
          />
        </ul>
      </nav>

      {/* Authentication Section */}
      <div className="p-4 border-t border-gray-800">
        <LoginButton />
        
        <Link
          href="/upgrade"
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity mt-3"
        >
          <Crown size={16} />
          <span>Upgrade to c.ai+</span>
        </Link>
        
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
        </div>
      </div>
    </aside>
  );
} 