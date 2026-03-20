import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import attendanceService from '../services/attendanceService';
import { Camera, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }

    // Get location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setStatus({ type: 'error', message: 'Please enable location access to mark attendance.' });
        }
      );
    }
  }, [navigate]);

  const handleMarkAttendance = async () => {
    if (!location) {
      setStatus({ type: 'error', message: 'Location not available. Please enable GPS.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const now = new Date();
      const attendanceData = {
        image: 'https://via.placeholder.com/150', // Placeholder for actual camera integration
        latitude: location.latitude,
        longitude: location.longitude,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString(),
      };

      await attendanceService.markAttendance(attendanceData);
      setStatus({ type: 'success', message: 'Attendance marked successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to mark attendance.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
            <p className="text-gray-500">Employee ID: {user.empId}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-4">
             <span className={`px-4 py-1 rounded-full text-sm font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
               {user.role.toUpperCase()}
             </span>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Camera className="h-8 w-8 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold">Mark Attendance</h2>
              </div>

              {status.message && (
                <div className={`p-4 rounded-lg mb-6 flex items-center ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {status.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                  {status.message}
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                  <span>
                    {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Fetching location...'}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>

                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                   <p className="text-gray-500">Camera Preview Placeholder</p>
                </div>

                <button
                  onClick={handleMarkAttendance}
                  disabled={loading || !location}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${loading || !location ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
                >
                  {loading ? 'Processing...' : 'Punch In Now'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
               {/* This would ideally list previous attendance records from API */}
               <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 italic text-gray-400 text-center">
                 No recent attendance logs found.
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
