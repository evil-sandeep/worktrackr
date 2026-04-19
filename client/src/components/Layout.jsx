import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] flex text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col h-screen overflow-hidden bg-slate-50/50">
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Content - Zero Scroll Main */}
        <main className="p-4 md:p-6 flex-1 overflow-hidden">
          <div className="max-w-[1600px] mx-auto h-full overflow-hidden flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
