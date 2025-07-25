"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { characters } from "@/lib/characters";

export default function LandingPage() {
  const router = useRouter();
  const problemsRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add animate class when entering viewport
          entry.target.classList.add('animate');
        } else {
          // Remove animate class when leaving viewport
          entry.target.classList.remove('animate');
        }
      });
    }, observerOptions);

    // Wait for DOM to be ready
    setTimeout(() => {
      // Observe all scroll-trigger elements
      const scrollTriggers = document.querySelectorAll('.scroll-trigger');
      scrollTriggers.forEach(el => observer.observe(el));

      // Observe section transition
      const sectionTransition = document.querySelector('.section-transition');
      if (sectionTransition) {
        observer.observe(sectionTransition);
      }
    }, 100);

    return () => observer.disconnect();
  }, []);

  const handleStepClick = (stepNumber: number) => {
    setActiveStep(stepNumber);
  };

  const handleCharacterSelect = (characterId: string) => {
    router.push(`/chat/${characterId}`);
  };

  const handleStartConsultation = () => {
    // Scroll to character selection
    const characterSection = document.getElementById('character-selection');
    if (characterSection) {
      characterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="absolute top-6 right-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                STEP 1
              </div>
            </div>
            <div className="mt-8 space-y-6">
              <div className="text-center">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Choose Your AI Companion
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Select from our diverse characters - each specialized in different aspects of recovery support
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="h-4 bg-blue-200 dark:bg-blue-600 rounded w-1/2 ml-auto"></div>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="absolute top-6 right-6">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                STEP 2
              </div>
            </div>
            <div className="mt-8 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Start Free Consultation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Begin your confidential conversation with AI-powered psychological counseling
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="h-4 bg-green-200 dark:bg-green-600 rounded w-3/4 ml-auto"></div>
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="absolute top-6 right-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                STEP 3
              </div>
            </div>
            <div className="mt-8 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Financial Recovery Plan
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Get structured financial analysis and personalized recovery strategies
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Spending Analysis</span>
                    <span className="text-sm font-semibold text-purple-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Recovery Plan</span>
                    <span className="text-sm font-semibold text-green-600">Ready</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div className="absolute top-6 right-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                STEP 4
              </div>
            </div>
            <div className="mt-8 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Continuous Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Receive ongoing psychological well-being support and long-term recovery guidance
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Weekly Check-ins</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Progress Tracking</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">24/7 Support</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-400/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-indigo-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-10 w-12 h-12 bg-pink-400/20 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
        </div>

        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12">
          <div className="max-w-4xl w-full text-center">
            {/* Logo with floating animation */}
            <div className="mb-8 animate-float">
              <div className="relative inline-block">
                <Image
                  src="/images/logo.png"
                  alt="AntiGambling.AI Logo"
                  width={120}
                  height={120}
                  className="drop-shadow-2xl animate-pulse-glow"
                  priority
                />
                {/* Sparkle effects around logo */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-sparkle"></div>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full animate-sparkle" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-pink-400 rounded-full animate-sparkle" style={{animationDelay: '1.5s'}}></div>
              </div>
            </div>

            {/* Main heading with gradient text */}
            <h1 className="text-5xl sm:text-7xl font-black mb-6 animate-fade-in-up">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-shift">
                AntiGambling.AI
              </span>
            </h1>

            {/* Subtitle with wave animation */}
            <p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 animate-fade-in-up stagger-1">
              <span className="animate-wave inline-block">🚀</span> Transforming the cycle of chaos into financial clarity
            </p>

            {/* Description with slide-in animation */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 animate-slide-in-left stagger-2">
              AI-powered chatbot for psychological counseling, financial education, and financial analysis for individuals affected by online gambling addiction. Non-judgmental, educational, and character-based approach.
            </p>

            {/* Character Grid in Hero Section */}
            <div className="mb-8 animate-fade-in-up stagger-3" id="character-selection">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Choose your trusted companion:
              </p>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4 max-w-5xl mx-auto">
                {characters.map((character, index) => {
                  const borderColors = [
                    'border-blue-200 dark:border-blue-700 group-hover:border-blue-400 dark:group-hover:border-blue-300',
                    'border-purple-200 dark:border-purple-700 group-hover:border-purple-400 dark:group-hover:border-purple-300',
                    'border-pink-200 dark:border-pink-700 group-hover:border-pink-400 dark:group-hover:border-pink-300',
                    'border-green-200 dark:border-green-700 group-hover:border-green-400 dark:group-hover:border-green-300',
                    'border-orange-200 dark:border-orange-700 group-hover:border-orange-400 dark:group-hover:border-orange-300',
                    'border-red-200 dark:border-red-700 group-hover:border-red-400 dark:group-hover:border-red-300',
                    'border-yellow-200 dark:border-yellow-700 group-hover:border-yellow-400 dark:group-hover:border-yellow-300',
                    'border-indigo-200 dark:border-indigo-700 group-hover:border-indigo-400 dark:group-hover:border-indigo-300',
                    'border-teal-200 dark:border-teal-700 group-hover:border-teal-400 dark:group-hover:border-teal-300'
                  ];
                  
                  const textColors = [
                    'group-hover:text-blue-600 dark:group-hover:text-blue-400',
                    'group-hover:text-purple-600 dark:group-hover:text-purple-400',
                    'group-hover:text-pink-600 dark:group-hover:text-pink-400',
                    'group-hover:text-green-600 dark:group-hover:text-green-400',
                    'group-hover:text-orange-600 dark:group-hover:text-orange-400',
                    'group-hover:text-red-600 dark:group-hover:text-red-400',
                    'group-hover:text-yellow-600 dark:group-hover:text-yellow-400',
                    'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
                    'group-hover:text-teal-600 dark:group-hover:text-teal-400'
                  ];

                  return (
                    <div key={character.id} className="text-center group cursor-pointer" onClick={() => handleCharacterSelect(character.id)}>
                      <div className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-3 rounded-full overflow-hidden border-3 transition-transform duration-300 group-hover:scale-110 ${borderColors[index % borderColors.length]}`}>
                        <Image
                          src={character.avatar}
                          alt={character.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className={`text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 transition-colors ${textColors[index % textColors.length]}`}>
                        {character.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Button with hover effects */}
            <div className="animate-scale-in stagger-4">
              <button
                onClick={handleStartConsultation}
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-full shadow-2xl hover-lift hover-glow overflow-hidden"
              >
                <span className="relative z-10">Start Free Consultation</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white/20 rounded-full animate-bounce-gentle"></div>
              </button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Problem Identification Section */}
        <section 
          ref={problemsRef}
          id="problems" 
          className="section-transition relative py-20 px-4 bg-gradient-to-br from-white/90 via-blue-50/50 to-indigo-100/50 dark:from-gray-900/90 dark:via-blue-900/50 dark:to-indigo-900/50 backdrop-blur-sm"
        >
          {/* Animated background elements for this section */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="morphing-bg absolute top-10 left-10"></div>
            <div className="morphing-bg absolute bottom-10 right-10" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full animate-background-pulse"></div>
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            {/* Section header with enhanced animations */}
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-block p-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full mb-6 animate-pulse-glow hover-scale">
                <svg className="w-10 h-10 text-white animate-icon-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6 animate-text-reveal">
                <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  Problem Identification
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto animate-text-reveal stagger-1">
                Understanding the critical challenges that individuals face with online gambling addiction and the gaps in current support systems.
              </p>
            </div>

            {/* Problem cards with enhanced animations */}
            <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Problem 1 - Unstoppable Online Gambling */}
              <div className="problem-card scroll-trigger group bg-gradient-to-br from-red-50 via-red-100 to-red-200 dark:from-red-900/20 dark:via-red-800/20 dark:to-red-700/20 p-8 rounded-3xl border border-red-200 dark:border-red-800">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-icon-bounce">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-red-600 transition-colors animate-text-reveal">
                  Unstoppable Online Gambling Prevalence
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed animate-text-reveal stagger-1">
                  The widespread availability and accessibility of online gambling platforms make it extremely difficult for individuals to break free from addiction cycles.
                </p>
                {/* Floating particles */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-red-400 rounded-full animate-sparkle"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 bg-red-400 rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
              </div>

              {/* Problem 2 - Severe Consequences */}
              <div className="problem-card scroll-trigger group bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 dark:from-orange-900/20 dark:via-orange-800/20 dark:to-orange-700/20 p-8 rounded-3xl border border-orange-200 dark:border-orange-800" style={{animationDelay: '0.2s'}}>
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-icon-bounce">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-orange-600 transition-colors animate-text-reveal">
                  Severe Negative Consequences
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed animate-text-reveal stagger-1">
                  High rates of suicide, theft, and domestic violence (KDRT) cases directly linked to online gambling addiction, affecting individuals and families.
                </p>
                <div className="absolute top-4 right-4 w-2 h-2 bg-orange-400 rounded-full animate-sparkle"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 bg-orange-400 rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
              </div>

              {/* Problem 3 - Loss Chasing */}
              <div className="problem-card scroll-trigger group bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:via-yellow-800/20 dark:to-yellow-700/20 p-8 rounded-3xl border border-yellow-200 dark:border-yellow-800" style={{animationDelay: '0.4s'}}>
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-icon-bounce">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-yellow-600 transition-colors animate-text-reveal">
                  Loss Chasing Behavior
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed animate-text-reveal stagger-1">
                  Individuals with financial awareness continue gambling in hopes of recovering losses, a behavior recognized by the American Psychiatric Association as Gambling Disorder.
                </p>
                <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
              </div>

              {/* Problem 4 - Limited Tools */}
              <div className="problem-card scroll-trigger group bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900/20 dark:via-blue-800/20 dark:to-blue-700/20 p-8 rounded-3xl border border-blue-200 dark:border-blue-800" style={{animationDelay: '0.6s'}}>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-icon-bounce">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors animate-text-reveal">
                  Limited Digital Recovery Tools
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed animate-text-reveal stagger-1">
                  Lack of specialized digital tools designed specifically for financial and psychological recovery from gambling addiction.
                </p>
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-sparkle"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 bg-blue-400 rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
              </div>

              {/* Problem 5 - Stigma */}
              <div className="problem-card scroll-trigger group bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-900/20 dark:via-purple-800/20 dark:to-purple-700/20 p-8 rounded-3xl border border-purple-200 dark:border-purple-800" style={{animationDelay: '0.8s'}}>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-icon-bounce">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-purple-600 transition-colors animate-text-reveal">
                  Stigma and Lack of Safe Spaces
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed animate-text-reveal stagger-1">
                  Many victims feel ashamed and lack access to safe, judgment-free environments where they can seek help without fear of stigma.
                </p>
                <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-sparkle"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 bg-purple-400 rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
              </div>

              {/* Problem 6 - Psychological Recognition */}
              <div className="problem-card scroll-trigger group bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-900/20 dark:via-green-800/20 dark:to-green-700/20 p-8 rounded-3xl border border-green-200 dark:border-green-800" style={{animationDelay: '1s'}}>
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-icon-bounce">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-green-600 transition-colors animate-text-reveal">
                  Psychological Disorder Recognition
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed animate-text-reveal stagger-1">
                  The American Psychiatric Association officially recognizes gambling addiction as a psychological disorder, highlighting the need for professional intervention.
                </p>
                <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-sparkle"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 bg-green-400 rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full animate-float"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-400/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400/5 to-blue-400/5 rounded-full animate-background-pulse"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Section header */}
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-block p-3 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full mb-6 animate-pulse-glow">
                <svg className="w-10 h-10 text-white animate-icon-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6">
                <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Fitur yang Kami Tawarkan
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                Solusi komprehensif untuk pemulihan dari kecanduan judi online dengan pendekatan AI yang inovatif dan empatik.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" style={{minHeight: '200px'}}>
              {/* Feature 1 - AI Counseling */}
              <div className="feature-card group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full -translate-y-16 translate-x-16"></div>
                
                {/* Icon Container */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Konseling Gratis AI
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    Layanan konseling psikologis dan dukungan perubahan perilaku secara gratis melalui chatbot berbasis AI, dirancang khusus untuk membantu individu yang mengalami kecanduan judi online.
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Feature 2 - Financial Recovery */}
              <div className="feature-card group bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up stagger-1 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20"></div>
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
                
                {/* Icon Container */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 border border-white/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-100 transition-colors">
                    Pemulihan Finansial
                  </h3>
                  <p className="text-emerald-50 leading-relaxed text-sm">
                    Analisis keuangan terstruktur untuk mengidentifikasi pola konsumsi merugikan, menghitung dampak kerugian, dan memberikan strategi pemulihan finansial yang disesuaikan.
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Feature 3 - Multilingual */}
              <div className="feature-card group bg-gray-900 dark:bg-black p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up stagger-2 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30"></div>
                
                {/* Icon Container */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                    Pendekatan Multibahasa
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Komunikasi multibahasa termasuk bahasa daerah Indonesia untuk menjangkau berbagai latar belakang budaya dan menciptakan rasa aman dalam proses pemulihan.
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Feature 4 - Psychological Well-being */}
              <div className="feature-card group bg-gradient-to-br from-rose-400 to-pink-500 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up stagger-3 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-300/20 to-pink-400/20"></div>
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full"></div>
                
                {/* Icon Container */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/40">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-rose-100 transition-colors">
                    Dukungan Kesejahteraan Psikologis
                  </h3>
                  <p className="text-rose-50 leading-relaxed text-sm">
                    Dukungan preventif untuk mencegah gangguan kesehatan mental seperti kecemasan dan depresi, dengan fokus pada emotional awareness dan ketahanan mental.
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Feature 5 - Feedback System */}
              <div className="feature-card group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up stagger-4 relative overflow-hidden border-2 border-orange-200 dark:border-orange-700">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10"></div>
                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-200 dark:bg-orange-800 rounded-full"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 bg-amber-200 dark:bg-amber-800 rounded-full"></div>
                
                {/* Icon Container */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Sistem Umpan Balik
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    Fitur umpan balik langsung untuk partisipasi pengguna dan kontrol etika, memastikan continuous improvement berbasis masukan nyata dari pengguna.
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Feature 6 - Non-Judgmental Approach */}
              <div className="feature-card group bg-gradient-to-br from-cyan-500 to-teal-600 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up stagger-5 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-500/20"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30"></div>
                
                {/* Icon Container */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-100 transition-colors">
                    Pendekatan Tanpa Penghakiman
                  </h3>
                  <p className="text-cyan-50 leading-relaxed text-sm">
                    Pendekatan empatik dan tidak menghakimi, membangun kepercayaan melalui pemahaman dan pendampingan yang suportif, aman secara psikologis.
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Feature 7 - Recovered Character */}
              <div className="feature-card group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up stagger-6 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10"></div>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full"></div>
                
                {/* Icon Container */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Karakter Mantan Pelaku
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    Chatbot dengan karakter mantan pelaku judi yang telah pulih, memberikan inspirasi dan harapan melalui lived experience sebagai mentor pemulihan.
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Feature 8 - Financial Expert */}
              <div className="feature-card group bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up stagger-7 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-orange-400/20"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                {/* Icon Container */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 border border-white/40">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-100 transition-colors">
                    Karakter Ahli Finansial
                  </h3>
                  <p className="text-yellow-50 leading-relaxed text-sm">
                    Konsultan keuangan profesional untuk membantu pemulihan stabilitas ekonomi, memberikan bimbingan strategis dalam pengelolaan anggaran dan perencanaan keuangan.
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full animate-float"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-400/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Section header */}
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-block p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-6 animate-pulse-glow">
                <svg className="w-10 h-10 text-white animate-icon-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  How It Works
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                Simple steps to start your recovery journey with AI-powered support
              </p>
            </div>

            {/* How It Works Steps */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Steps List */}
              <div className="space-y-8">
                {/* Step 1 - Choose Character */}
                <div 
                  className={`step-item group cursor-pointer transition-all duration-300 p-6 rounded-2xl shadow-lg hover:shadow-xl ${
                    activeStep === 1 
                      ? 'bg-white dark:bg-gray-800 border-2 border-blue-500' 
                      : 'hover:bg-white dark:hover:bg-gray-800'
                  }`} 
                  onClick={() => handleStepClick(1)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                        activeStep === 1 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-2 transition-colors ${
                        activeStep === 1 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        Choose Your Companion
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Select from our diverse AI characters - each with unique expertise in psychological support, financial guidance, or recovery mentorship.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 - Start Chat */}
                <div 
                  className={`step-item group cursor-pointer transition-all duration-300 p-6 rounded-2xl shadow-lg hover:shadow-xl ${
                    activeStep === 2 
                      ? 'bg-white dark:bg-gray-800 border-2 border-green-500' 
                      : 'hover:bg-white dark:hover:bg-gray-800'
                  }`} 
                  onClick={() => handleStepClick(2)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                        activeStep === 2 
                          ? 'bg-gradient-to-br from-green-500 to-teal-600' 
                          : 'bg-gradient-to-br from-green-500 to-teal-600'
                      }`}>
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-2 transition-colors ${
                        activeStep === 2 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400'
                      }`}>
                        Start Free Consultation
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Begin your confidential conversation with AI-powered psychological counseling and behavioral change support, available 24/7.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 - Financial Analysis */}
                <div 
                  className={`step-item group cursor-pointer transition-all duration-300 p-6 rounded-2xl shadow-lg hover:shadow-xl ${
                    activeStep === 3 
                      ? 'bg-white dark:bg-gray-800 border-2 border-purple-500' 
                      : 'hover:bg-white dark:hover:bg-gray-800'
                  }`} 
                  onClick={() => handleStepClick(3)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                        activeStep === 3 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
                          : 'bg-gradient-to-br from-purple-500 to-pink-600'
                      }`}>
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-2 transition-colors ${
                        activeStep === 3 
                          ? 'text-purple-600 dark:text-purple-400' 
                          : 'text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400'
                      }`}>
                        Financial Recovery Plan
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Get structured financial analysis, identify harmful spending patterns, and receive personalized recovery strategies.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 - Ongoing Support */}
                <div 
                  className={`step-item group cursor-pointer transition-all duration-300 p-6 rounded-2xl shadow-lg hover:shadow-xl ${
                    activeStep === 4 
                      ? 'bg-white dark:bg-gray-800 border-2 border-orange-500' 
                      : 'hover:bg-white dark:hover:bg-gray-800'
                  }`} 
                  onClick={() => handleStepClick(4)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                        activeStep === 4 
                          ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                          : 'bg-gradient-to-br from-orange-500 to-red-600'
                      }`}>
                        <span className="text-white font-bold text-lg">4</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-2 transition-colors ${
                        activeStep === 4 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400'
                      }`}>
                        Continuous Support
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Receive ongoing psychological well-being support and long-term recovery guidance
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Visual Explanation */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  {renderStepContent(activeStep)}
                  
                  {/* Background Decorative Elements */}
                  <div className="absolute top-4 left-4 w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Author Section */}
        <section style={{ background: 'radial-gradient(ellipse at 40% 20%, #232946 0%, #181e29 100%)', padding: '80px 0', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          {/* Floating blurred circles for depth */}
          <div style={{ position: 'absolute', top: 40, left: 80, width: 160, height: 160, background: '#6366f1', opacity: 0.08, borderRadius: '50%', filter: 'blur(8px)', zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: 60, right: 120, width: 120, height: 120, background: '#a21caf', opacity: 0.10, borderRadius: '50%', filter: 'blur(12px)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 180, right: 60, width: 80, height: 80, background: '#f59e42', opacity: 0.07, borderRadius: '50%', filter: 'blur(10px)', zIndex: 0 }} />
          {/* Icon/avatar di atas judul */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a21caf 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px #6366f133' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V12L17 17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          {/* Judul gradient */}
          <h2 style={{
            fontSize: 54,
            fontWeight: 900,
            background: 'linear-gradient(90deg, #6366f1 0%, #a21caf 60%, #f59e42 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 4px 32px rgba(80,80,180,0.10)',
            marginBottom: 12,
            letterSpacing: 1,
            lineHeight: 1.1,
            display: 'inline-block',
            animation: 'gradientShift 3s ease-in-out infinite alternate'
          }}>Our Team</h2>
          {/* Subtitle */}
          <div style={{ fontSize: 22, color: '#e0e7ef', marginBottom: 48, fontWeight: 400 }}>
            Meet the creators behind this project
          </div>
          {/* Cards */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 48,
            flexWrap: 'wrap',
            maxWidth: 900,
            margin: '0 auto'
          }}>
            <div>
              {/* ...isi card Muhammad Haggy... */}
              <div style={{
                width: 180,
                height: 180,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #3b82f6',
                margin: '0 auto 24px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent'
              }}>
                <Image src="/images/author/hagi/hagi.png" alt="Muhammad Haggy" width={180} height={180} style={{ objectFit: 'cover' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4, color: '#fff' }}>
                Muhammad Haggy
              </div>
              <div style={{ color: '#cbd5e1', fontSize: 15 }}>
                Ilmu Komputer<br />
                @ Universitas Indonesia
              </div>
            </div>
            <div>
              {/* ...isi card Candra Kus Khoiri Wicaksono... */}
              <div style={{
                width: 180,
                height: 180,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #3b82f6',
                margin: '0 auto 24px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent'
              }}>
                <Image src="/images/author/image.png" alt="Candra Kus Khoiri Wicaksono" width={180} height={180} style={{ objectFit: 'cover' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4, color: '#fff' }}>
                Candra Kus Khoiri Wicaksono
              </div>
              <div style={{ color: '#cbd5e1', fontSize: 15 }}>
                Informatika<br />
                @ Universitas Telkom
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section style={{
          maxWidth: 1200,
          margin: '64px auto 0 auto',
          padding: '56px 24px',
          borderRadius: 32,
          background: 'linear-gradient(90deg, #232946 0%, #6366f1 100%)',
          boxShadow: '0 8px 48px 0 rgba(80, 80, 180, 0.10)',
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ fontWeight: 700, letterSpacing: 2, fontSize: 16, opacity: 0.85, marginBottom: 16 }}>
            CONTACT US
          </div>
          <div style={{ fontWeight: 900, fontSize: 40, marginBottom: 18, lineHeight: 1.15 }}>
            Ready to Start Your Recovery Journey?
          </div>
          <div style={{ fontSize: 20, opacity: 0.92, marginBottom: 40, fontWeight: 400 }}>
            Join the growing community using AntiGambling.AI to reclaim financial and mental well-being.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <a href="#" style={{
              background: '#fff',
              color: '#7c3aed',
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 999,
              padding: '16px 36px',
              textDecoration: 'none',
              boxShadow: '0 2px 12px 0 rgba(80, 80, 180, 0.08)',
              transition: 'background 0.2s, color 0.2s',
              border: 'none',
              display: 'inline-block'
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.color = '#6d28d9'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#7c3aed'; }}
            >
              Try the Demo
            </a>
            <a href="#" style={{
              background: 'transparent',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 999,
              padding: '16px 36px',
              textDecoration: 'none',
              border: '2px solid #fff',
              display: 'inline-block',
              transition: 'background 0.2s, color 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#7c3aed'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
            >
              Contact Our Team
            </a>
          </div>
          <div style={{
            position: 'absolute',
            top: -40,
            left: 0,
            right: 0,
            height: 80,
            background: 'linear-gradient(180deg, #181e29 0%, transparent 100%)',
            zIndex: 1,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            pointerEvents: 'none'
          }} />
        </section>
      </div>
      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
} 