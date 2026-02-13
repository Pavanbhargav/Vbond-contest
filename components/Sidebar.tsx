import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IoArrowBack, IoLogOut, IoSettingsOutline } from "react-icons/io5";


interface SidebarLink {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  links: SidebarLink[];
  logout: () => void;
}

export default function Sidebar({ links, logout }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>

    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out z-50 flex flex-col shadow-lg overflow-hidden ${
        isHovered ? "w-64" : "w-20"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center h-20 border-b border-gray-100 dark:border-gray-800">
          <span className={`text-2xl font-bold text-[var(--primary1)] transition-opacity duration-300 ${isHovered ? 'w-auto opacity-100': 'w-0 opacity-0 overflow-hidden'}`}>VBond</span>
          <span className={`text-2xl font-bold text-[var(--primary1)] absolute transition-opacity duration-300 ${isHovered ? 'opacity-0': 'opacity-100'}`}>V</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? "bg-[var(--primary1)] text-white shadow-md"
                      : "text-gray-500 dark:text-gray-400 hover:bg-[var(--primary2)] hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center min-w-[24px]">
                      <link.icon className="text-xl" />
                  </div>
                  <span
                    className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
                    }`}
                  >
                    {link.label}
                  </span>
                   {!isHovered && isActive && (
                      <div className="absolute left-14 bg-[var(--primary1)] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          {link.label}
                      </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group overflow-hidden"
        >
          <div className="flex items-center justify-center min-w-[24px]">
              <IoLogOut size={28} />
          </div>
          <span
            className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
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
