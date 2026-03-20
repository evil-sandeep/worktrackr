import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Content */}
        <main className="p-6 md:p-10 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-10 py-6 text-center text-slate-400 text-xs font-semibold uppercase tracking-widest bg-white/50 backdrop-blur-sm border-t border-slate-100">
            WorkTrackr &copy; {new Date().getFullYear()} &bull; Precise Workforce Management
        </footer>
      </div>
    </div>
  );
};

export default Layout;
