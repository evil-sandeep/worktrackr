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
    <div className="h-screen overflow-hidden bg-[#F3F2F1] flex text-[#323130]">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} navLinks={getNavLinks()} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Content - Scrollable Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
