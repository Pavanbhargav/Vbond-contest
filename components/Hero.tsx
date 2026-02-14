'use client';

import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const TypewriterText = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    const startTyping = () => {
      setDisplayText('');
      let currentIndex = 0;
      
      interval = setInterval(() => {
        if (currentIndex < text.length) {
          // Use slice to be deterministic about what is displayed
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
          // Wait 10 seconds after completion, then restart
          timeout = setTimeout(startTyping, 10000);
        }
      }, 100); 
    };

    // Initial start delay
    const initialTimeout = setTimeout(startTyping, delay * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse text-primary1 font-light ml-1 inline-block transform scale-x-150 relative -bottom-0.5">_</span>
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32 lg:pt-32">
      {/* Background Elements */}
      <div className="absolute inset-0 z-[-1]">
         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary1/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary2/10 rounded-full blur-[120px] animate-pulse animation-delay-2000"></div>
         {/* Grid Pattern */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="container px-4 mx-auto sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl mb-8 leading-tight">
            Find the perfect <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary1 to-primary2 relative inline-block whitespace-normal min-h-[1.2em]">
              <TypewriterText text="freelance services for your business" delay={0.5} />
            </span>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }} 
            className="mt-6 text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-12"
          >
            Connect with top-tier talent. Accelerate your projects with our secure, efficient, and premium freelancing platform.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              href="/auth/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-zinc-900 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full -mt-10 transition-all duration-700 ease-out -translate-y-full bg-gradient-to-b from-primary1 to-primary2 group-hover:mt-0 group-hover:translate-y-0"></span>
              <span className="relative flex items-center">
                Get Started <FaArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="#how-it-works"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-zinc-900 dark:text-white transition-all duration-200 bg-transparent border border-zinc-200 dark:border-zinc-800 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              How it works
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
