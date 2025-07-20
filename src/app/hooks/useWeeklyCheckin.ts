'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lastWeeklyCheckinDate';

export function useWeeklyCheckin() {
  const [showWeeklyCheckin, setShowWeeklyCheckin] = useState(false);

  // Check if it's time for weekly check-in
  const checkForWeeklyCheckin = () => {
    try {
      const lastCheckinDate = localStorage.getItem(STORAGE_KEY);
      const currentDate = new Date();
      
      // If no previous check-in date is stored, show the check-in
      if (!lastCheckinDate) {
        setShowWeeklyCheckin(true);
        return;
      }
      
      // Parse the stored date
      const lastDate = new Date(lastCheckinDate);
      
      // Calculate the difference in milliseconds
      const timeDifference = currentDate.getTime() - lastDate.getTime();
      
      // Convert to days (1000ms * 60s * 60m * 24h = 86400000ms per day)
      const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
      
      // Show check-in if 7 or more days have passed
      if (daysDifference >= 7) {
        setShowWeeklyCheckin(true);
      }
    } catch (error) {
      console.error('Error checking weekly check-in status:', error);
      // If there's an error reading localStorage, show the check-in to be safe
      setShowWeeklyCheckin(true);
    }
  };

  // Update the last check-in date
  const updateLastCheckinDate = () => {
    try {
      const currentDate = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, currentDate);
      setShowWeeklyCheckin(false);
    } catch (error) {
      console.error('Error updating weekly check-in date:', error);
    }
  };

  // Close the check-in without updating date (for skip functionality)
  const closeWeeklyCheckin = () => {
    setShowWeeklyCheckin(false);
  };

  // For testing purposes - force show the check-in
  const forceShowWeeklyCheckin = () => {
    setShowWeeklyCheckin(true);
  };

  // For testing purposes - reset the stored date
  const resetWeeklyCheckin = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setShowWeeklyCheckin(false);
    } catch (error) {
      console.error('Error resetting weekly check-in:', error);
    }
  };

  // Check on component mount
  useEffect(() => {
    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      checkForWeeklyCheckin();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    showWeeklyCheckin,
    updateLastCheckinDate,
    closeWeeklyCheckin,
    forceShowWeeklyCheckin, // For testing
    resetWeeklyCheckin, // For testing
  };
} 