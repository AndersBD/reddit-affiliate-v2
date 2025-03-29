import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar isMobileOpen={isMobileSidebarOpen} />
      
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-600 bg-opacity-75 transition-opacity ease-linear duration-300 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}
      
      {/* Main content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <TopNavigation onMobileMenuClick={toggleMobileSidebar} />
        {children}
      </div>
    </div>
  );
}
