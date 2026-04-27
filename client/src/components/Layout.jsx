import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { ShieldAlert, Users, UserCircle, LayoutDashboard, Briefcase, Activity, MapPin } from 'lucide-react';

const Layout = ({ children, user = { role: 'employee' } }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getNavLinks = () => {
    if (user.role === 'superadmin') {
      return [
        { name: 'Dashboard', icon: ShieldAlert, path: '/superadmindashboard' },
        { name: 'Global Directory', icon: Users, path: '/employee' },
        { name: 'Profile Settings', icon: UserCircle, path: '/profile' }
      ];
    }
    if (user.role === 'orgadmin' || user.role === 'admin') {
      return [
        { name: 'Admin Console', icon: LayoutDashboard, path: '/admindashboard' },
        { name: 'Staff Directory', icon: Users, path: '/employee' },
        { name: 'Profile Settings', icon: UserCircle, path: '/profile' }
      ];
    }
    return [
      { name: 'Attendance Hub', icon: MapPin, path: '/employeedashboard' },
      { name: 'Store Visit', icon: Briefcase, path: '/storevisit' },
      { name: 'My Performance', icon: Activity, path: '/calendar' },
      { name: 'My Profile', icon: UserCircle, path: '/profile' }
    ];
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] flex text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} navLinks={getNavLinks()} />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col h-screen overflow-hidden bg-slate-50/50">
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Content - Scrollable Main */}
        <main className="p-4 md:p-6 flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
