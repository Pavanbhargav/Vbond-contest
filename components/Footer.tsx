"use client";

import Link from 'next/link';
import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaPaperPlane } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary1/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
               <img src="/VBONDTALENT.png" alt="VBond Talent" className="h-10 w-auto" />
            </Link>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              Connecting talented freelancers with ambitious businesses. Build your dream project or find your next big opportunity with us.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={FaFacebook} label="Facebook" />
              <SocialLink href="#" icon={FaTwitter} label="Twitter" />
              <SocialLink href="#" icon={FaInstagram} label="Instagram" />
              <SocialLink href="#" icon={FaLinkedin} label="LinkedIn" />
              <SocialLink href="#" icon={FaGithub} label="GitHub" />
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider mb-6">Platform</h3>
            <ul className="space-y-4">
              <FooterLink href="/#how-it-works">How it Works</FooterLink>
              <FooterLink href="/#features">Features</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/about">About Us</FooterLink>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider mb-6">Support</h3>
            <ul className="space-y-4">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider mb-6">Stay Updated</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary1/50 focus:border-primary1 transition-all text-sm dark:text-white"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary1 text-white rounded-lg hover:bg-primary2 transition-colors shadow-lg shadow-primary1/20"
                >
                  <FaPaperPlane size={12} />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} FreeLance, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
  return (
    <a 
      href={href} 
      className="text-zinc-400 hover:text-primary1 transition-colors transform hover:scale-110"
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href} 
        className="text-zinc-500 dark:text-zinc-400 hover:text-primary1 dark:hover:text-primary1 transition-colors text-sm"
      >
        {children}
      </Link>
    </li>
  );
}
