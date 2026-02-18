'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl transition-all duration-300`}
      >
        <div 
           className={`rounded-full px-6 py-3 transition-all duration-300 ${
             scrolled 
               ? "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg border border-zinc-200/50 dark:border-zinc-800/50" 
               : "bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-transparent shadow-sm"
           }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <img src="/VBONDTALENT.png" alt="VBond Talent" className="h-10 w-auto" />
              </Link>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-full px-2 py-1.5 border border-zinc-200/50 dark:border-zinc-700/50">
              {navLinks.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:text-primary1"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {hoveredIndex === index && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-full shadow-sm z-[-1]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 mix-blend-multiply dark:mix-blend-screen">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary1 transition-colors px-4 py-2"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden text-sm font-medium text-white transition-all duration-300 bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-full hover:scale-105 hover:shadow-lg focus:outline-none"
              >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary1 to-primary2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
                  <span className="relative">Sign up</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-full text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 rounded-xl text-base font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-primary1 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col space-y-3">
                  <Link
                    href="/auth/login"
                    className="block w-full px-4 py-3 text-center rounded-xl text-base font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full px-4 py-3 text-center rounded-xl text-base font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:shadow-lg transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
