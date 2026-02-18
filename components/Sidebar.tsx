"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { IoLogOut, IoMenu, IoClose } from "react-icons/io5";

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  links: SidebarLink[];
  logout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ links, logout, isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    // Initial check
    checkScreenSize();
    
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [setIsOpen]);

  const sidebarWidth = isHovered && !isMobile ? "w-64" : "w-20";
  const mobileClasses = isMobile 
    ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`
    : `fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-40 ${sidebarWidth}`;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`${mobileClasses} bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shadow-xl overflow-hidden`}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <div className="flex items-center justify-center h-20 border-b border-zinc-100 dark:border-zinc-800 relative">
          <div className={`flex items-center justify-center transition-all duration-300 ${isHovered || isMobile ? 'w-full px-4' : 'w-full px-2'}`}>
             <Link href="/">
                <img 
                  src="/VBONDTALENT.png" 
                  alt="VBond" 
                  className={`transition-all duration-300 object-contain ${
                    isHovered || isMobile ? 'h-12 w-auto' : 'h-8 w-auto'
                  }`}
                />
             </Link>
          </div>
          {isMobile && (
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 text-zinc-500 dark:text-zinc-400 hover:text-[var(--primary1)]"
            >
              <IoClose size={24} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <ul className="space-y-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => isMobile && setIsOpen(false)}
                    className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? "bg-gradient-to-r from-[var(--primary1)] to-[var(--primary1)]/80 text-white shadow-lg shadow-[var(--primary1)]/20"
                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-[var(--primary1)] dark:hover:text-[var(--primary1)]"
                    }`}
                  >
                    <div className="flex items-center justify-center min-w-[24px]">
                        <link.icon className={`text-xl ${isActive ? 'animate-pulse' : ''}`} />
                    </div>
                    <span
                      className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                        isHovered || isMobile ? "opacity-100 w-auto" : "opacity-0 w-0"
                      }`}
                    >
                      {link.label}
                    </span>
                    {!isHovered && !isMobile && (
                        <div className="absolute left-16 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
                            {link.label}
                        </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group overflow-hidden"
          >
            <div className="flex items-center justify-center min-w-[24px]">
                <IoLogOut size={24} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <span
              className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isHovered || isMobile ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
