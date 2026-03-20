import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { LogOut, Home, User, Activity } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">WorkTrackr</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/dashboard' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-4">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <User className="h-5 w-5 mr-1 text-gray-400" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
