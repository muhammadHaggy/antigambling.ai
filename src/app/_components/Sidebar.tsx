'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, MessageSquare } from 'lucide-react';
import LoginButton from './LoginButton';
import { useSearch } from '@/app/_contexts/SearchContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, text, href, isActive, onClick }: NavItemProps) {
  const content = (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
      isActive
        ? 'bg-gray-800 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`}>
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </div>
  );

  if (onClick) {
    return (
      <li>
        <button onClick={onClick} className="w-full text-left">
          {content}
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link href={href || '#'}>
        {content}
      </Link>
    </li>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { searchQuery } = useSearch();

  const handleSearchClick = () => {
    if (searchQuery) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/');
      // Focus on search input after navigation
      setTimeout(() => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-40 transform transition-transform md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">AntiGambling.ai</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <NavItem
              icon={<Home size={18} />}
              text="Discover"
              href="/"
              isActive={pathname === '/'}
              onClick={onClose}
            />
            <NavItem
              icon={<Search size={18} />}
              text="Search"
              onClick={() => {
                handleSearchClick();
                onClose();
              }}
              isActive={pathname === '/' && !!searchQuery}
            />
            <NavItem
              icon={<MessageSquare size={18} />}
              text="Chats"
              href="/chats"
              isActive={pathname.startsWith('/chat')}
              onClick={onClose}
            />
          </ul>
        </nav>

        {/* Authentication Section */}
        <div className="p-4 border-t border-gray-800">
          <LoginButton />
          
          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300"> </Link>
            <Link href="/terms" className="hover:text-gray-300"> </Link>
          </div>
        </div>
      </aside>
    </>
  );
} 