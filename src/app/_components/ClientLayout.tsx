'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import WeeklyProgressCheckin from './WeeklyProgressCheckin';
import { useWeeklyCheckin } from '../hooks/useWeeklyCheckin';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const { 
    showWeeklyCheckin, 
    updateLastCheckinDate, 
    closeWeeklyCheckin 
  } = useWeeklyCheckin();

  // Check if we're on the landing page
  const isLandingPage = pathname === '/landing';

  // If on landing page, render without sidebar
  if (isLandingPage) {
    return (
      <div className="w-full h-full">
        {children}
      </div>
    );
  }

  const handleWeeklyCheckinSubmit = async (rating: number) => {
    if (!session?.user) {
      console.error('No user session available for weekly check-in submission');
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackType: 'weekly_checkin',
          rating,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit weekly check-in');
      }

      // Update localStorage date to prevent showing again for a week
      updateLastCheckinDate();
      
      console.log('Weekly check-in submitted successfully:', data);
    } catch (error) {
      console.error('Error submitting weekly check-in:', error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  const handleWeeklyCheckinClose = () => {
    // Close without updating the date (user skipped)
    closeWeeklyCheckin();
  };

  return (
    <div className="flex h-screen w-full overflow-x-hidden">
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md bg-gray-800 text-white"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 h-full pt-16 md:pt-0 w-full overflow-x-hidden">
        {children}
      </main>

      {/* Weekly Progress Check-in Modal */}
      {showWeeklyCheckin && session?.user && (
        <WeeklyProgressCheckin
          onSubmit={handleWeeklyCheckinSubmit}
          onClose={handleWeeklyCheckinClose}
        />
      )}
    </div>
  );
} 