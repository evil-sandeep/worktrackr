import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import adminService from '../services/adminService';
import { useUI } from '../context/UIContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    recentActivity: [],
    joinCode: 'N/A'
  });
  const { showLoader, addToast } = useUI();

  const fetchStats = async () => {
    showLoader(true);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch dashboard stats', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, label }) => (
    <div className="bg-white p-4 border border-[#EDEBE9] rounded-sm shadow-sm flex flex-col justify-between hover:border-[#0078D4] transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">{title}</span>
        <div className={`p-1.5 ${colorClass} bg-opacity-10 rounded-sm`}>
          <Icon className={`h-4 w-4 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-[#323130] tracking-tight">{value}</p>
        <span className="text-[10px] font-medium text-[#605E5C] bg-[#F3F2F1] px-1.5 py-0.5 rounded-sm">{label}</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-[#F3F2F1] min-h-full">
      {/* Page Title Area */}
      <div className="flex items-center justify-between border-b border-[#EDEBE9] pb-4 bg-white -mx-6 -mt-6 px-6 py-4">
        <div>
          <h1 className="text-[20px] font-semibold text-[#323130]">Organization Overview</h1>
          <p className="text-[12px] text-[#605E5C]">Real-time operations and personnel metrics</p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#F3F2F1] text-[#323130] border border-[#8A8886] rounded-sm text-[12px] font-semibold hover:bg-[#EDEBE9] transition-all"
        >
          <Activity className="h-4 w-4 text-[#0078D4]" />
          Refresh Metrics
        </button>
      </div>

      {/* Secret Code Banner */}
      <div className="bg-[#FAF9F8] border border-[#EDEBE9] px-6 py-3 flex items-center justify-between rounded-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0078D4] bg-opacity-10 rounded-sm">
            <Activity className="h-4 w-4 text-[#0078D4]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider">Organization Secret Code</p>
            <p className="text-[14px] font-mono font-bold text-[#323130]">{stats.joinCode}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#605E5C] italic text-right">Share this code with employees to join your organization during registration.</p>
        </div>
      </div>

      {/* Primary Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Personnel" 
          value={stats.totalEmployees} 
          icon={Users} 
          colorClass="bg-[#0078D4]" 
          label="Total Identity"
        />
        <StatCard 
          title="Active Status" 
          value={stats.presentToday} 
          icon={UserCheck} 
          colorClass="bg-[#107C10]" 
          label="Online"
        />
        <StatCard 
          title="Absence Log" 
          value={stats.absentToday} 
          icon={Clock} 
          colorClass="bg-[#D83B01]" 
          label="Inactive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Activity Feed */}
        <div className="lg:col-span-8 bg-white border border-[#EDEBE9] rounded-sm shadow-sm">
          <div className="px-4 py-3 border-b border-[#EDEBE9] bg-[#FAF9F8] flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-[#323130]">Recent Operational Activity</h3>
            <span className="text-[10px] text-[#605E5C] font-medium uppercase">Live Stream</span>
          </div>
          <div className="p-0">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="divide-y divide-[#EDEBE9]">
                {stats.recentActivity.map((activity) => (
                  <div key={activity._id} className="px-4 py-3 flex items-center justify-between hover:bg-[#F3F2F1] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0078D4] text-white rounded-sm flex items-center justify-center font-bold text-xs">
                        {activity.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#323130]">{activity.user?.name || 'Unknown User'}</p>
                        <p className="text-[11px] text-[#605E5C]">{activity.user?.empId || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-bold text-[#323130]">{activity.checkIn?.time || 'N/A'}</p>
                      <span className="text-[10px] font-semibold text-[#107C10] uppercase">Check-in Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-[#605E5C]">
                <Activity className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p className="text-[13px]">No operational activity recorded for this period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0078D4] p-5 text-white rounded-sm shadow-sm relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2 opacity-80">Quick Actions</h4>
               <p className="text-[16px] font-semibold mb-4 leading-tight">Identity & Resource Management</p>
               <Link 
                 to="/admin/employee"
                 className="block w-full py-2 bg-white text-[#0078D4] text-center rounded-sm font-bold text-[12px] hover:bg-[#F3F2F1] transition-all"
               >
                 Go to Employee Directory
               </Link>
             </div>
             <Users className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
          </div>

          <div className="bg-white border border-[#EDEBE9] p-4 rounded-sm shadow-sm">
            <h4 className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider mb-3">System Health</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#323130]">API Status</span>
                <span className="text-[#107C10] font-bold">Operational</span>
              </div>
              <div className="h-1.5 bg-[#F3F2F1] rounded-full overflow-hidden">
                <div className="h-full bg-[#107C10] w-[98%]"></div>
              </div>
              <p className="text-[10px] text-[#605E5C]">All organizational endpoints are responding within normal parameters.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
