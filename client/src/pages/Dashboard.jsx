import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BiometricTerminal from '../components/BiometricTerminal';
import AttendanceDetailModal from '../components/AttendanceDetailModal';
import attendanceService from '../services/attendanceService';
import authService from '../services/authService';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck,
  LayoutGrid,
  List
} from 'lucide-react';
import Calendar from '../components/Calendar/Calendar';
import AttendanceTable from '../components/Calendar/AttendanceTable';
import { formatDateKey } from '../components/Calendar/useCalendar';
import useLocationTracker from '../hooks/useLocationTracker';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedLogDate, setSelectedLogDate] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [filterDate, setFilterDate] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString()
  });
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const fetchAttendance = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      const { month, year } = filterDate;
      const response = await attendanceService.getAttendanceByUserId(
        currentUser._id, 
        { month, year }
      );
      if (response.success && response.data) {
        setAttendanceMap(response.data.reduce((acc, curr) => ({ ...acc, [curr.date]: curr }), {}));
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
    }
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      fetchAttendance();
    }
  }, [navigate, filterDate]);

  const todayKey = formatDateKey(new Date());
  const todayLog = attendanceMap[todayKey];
  const isCheckedIn = !!todayLog;
  const isCheckedOut = !!(todayLog?.checkOut?.time || todayLog?.checkoutTime);

  useLocationTracker(isCheckedIn, isCheckedOut);

  const handleDateSelect = (date) => {
    if (new Date(date) > new Date()) return;
    setSelectedLogDate(formatDateKey(date));
    setIsLogModalOpen(true);
  };

  if (!user) return null;

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden animate-in fade-in duration-500">
      
      {/* Viewport Locked Grid */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0">
        
        {/* Main Hub Area (Flex: 2) */}
        <div className="flex-[2] h-full flex flex-col justify-center min-h-0">
          {/* Security Hub - Vertically Centered Core */}
          <div className="bg-white border border-[#EDEBE9] rounded-sm shadow-sm overflow-hidden group flex flex-col h-full max-h-[85vh]">
             <div className="px-6 py-4 border-b border-[#EDEBE9] bg-[#FAF9F8] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-[#0078D4] text-white rounded-sm flex items-center justify-center shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#323130] tracking-tight text-sm">Security Hub</h3>
                    <p className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider leading-none mt-0.5">Biometric Protocol Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#DFF6DD] rounded-sm border border-[#107C10]/20">
                  <div className="w-1.5 h-1.5 bg-[#107C10] rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-bold text-[#107C10] uppercase tracking-wider">Ready for Auth</span>
                </div>
             </div>
             
             {/* Centered Action Center */}
             <div className="flex-1 flex flex-col items-stretch justify-center p-6 bg-[#FAF9F8]/30 overflow-hidden w-full">
                {!isCheckedIn ? (
                  <BiometricTerminal mode="checkin" onSuccess={fetchAttendance} />
                ) : !isCheckedOut ? (
                  <BiometricTerminal mode="checkout" onSuccess={fetchAttendance} />
                ) : (
                  <div className="flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-[#DFF6DD] rounded-sm flex items-center justify-center relative border border-[#107C10]/20">
                       <CheckCircle className="h-8 w-8 text-[#107C10] relative z-10" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-[#323130] tracking-tight uppercase">Session Secured</h2>
                      <p className="text-[#605E5C] text-[10px] font-bold uppercase tracking-wider max-w-[240px]">Cryptographically synchronized with Tenant Edge.</p>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Stats Column (Flex: 1) */}
        <div className="flex-1 h-full flex flex-col gap-3 min-h-0">
           {/* Monthly Yield Card */}
           <div className="bg-white border border-[#EDEBE9] rounded-sm shadow-sm p-5 flex-1 min-h-0 flex flex-col justify-between group transition-all hover:border-[#0078D4]">
               <div className="flex items-center justify-between shrink-0">
                <span className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider">Monthly Yield</span>
                <span className="text-[9px] font-bold text-[#107C10] bg-[#DFF6DD] px-2 py-0.5 rounded-sm">+12% Utilization</span>
              </div>
              <div className="py-2">
                <p className="text-3xl font-bold text-[#323130] tracking-tighter tabular-nums leading-none mb-3">
                   ₹{Object.values(attendanceMap).reduce((acc, curr) => acc + (curr.earning || 0), 0)}
                </p>
                <div className="space-y-1.5">
                   <div className="flex justify-between items-center text-[9px] font-bold text-[#605E5C] uppercase">
                      <span>Target Quota</span>
                      <span>65%</span>
                   </div>
                   <div className="h-1.5 bg-[#F3F2F1] rounded-sm overflow-hidden">
                      <div className="h-full bg-[#0078D4] w-[65%]" style={{ boxShadow: '0 0 10px rgba(0, 120, 212, 0.2)' }}></div>
                   </div>
                </div>
              </div>
           </div>

           {/* Active Hours Card */}
           <div className="bg-white border border-[#EDEBE9] rounded-sm shadow-sm p-4 flex-1 min-h-0 flex items-center justify-between group hover:border-[#0078D4] transition-all">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-[#F3F2F1] text-[#605E5C] rounded-sm flex items-center justify-center group-hover:bg-[#0078D4] group-hover:text-white transition-colors border border-[#EDEBE9]">
                    <Clock size={14} />
                 </div>
                 <div>
                    <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-wider leading-none mb-1">Compute Time</p>
                    <p className="text-base font-bold text-[#323130] tracking-tight tabular-nums">{todayLog?.totalHours || '0h 0m'}</p>
                 </div>
              </div>
              <div className="w-1.5 h-1.5 bg-[#107C10] rounded-full animate-pulse"></div>
           </div>

           {/* Daily Accrued Card */}
           <div className="bg-white border border-[#EDEBE9] rounded-sm shadow-sm p-4 flex-1 min-h-0 flex items-center justify-between group hover:border-[#0078D4] transition-all">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-[#323130] text-white rounded-sm flex items-center justify-center group-hover:bg-[#0078D4] transition-colors font-bold text-xs shadow-sm">₹</div>
                 <div>
                    <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-wider leading-none mb-1">Daily Accrued</p>
                    <p className="text-base font-bold text-[#323130] tracking-tight tabular-nums">₹{todayLog?.earning || 0}</p>
                 </div>
              </div>
           </div>

           {/* Protocol Status Bar */}
           <div className="p-4 bg-white border border-[#EDEBE9] rounded-sm space-y-3 shadow-sm flex-1 min-h-0 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-[#0078D4]" />
                    <span className="text-[8px] font-bold text-[#605E5C] uppercase tracking-widest">Protocol Integrity</span>
                 </div>
                 <span className="text-[8px] font-bold text-[#0078D4] uppercase tracking-widest">Verified</span>
              </div>
              <div className="flex gap-1">
                 {Array.from({length: 12}).map((_, i) => (
                   <div key={i} className={`h-1.5 flex-1 rounded-sm ${i < 9 ? 'bg-[#0078D4]' : 'bg-[#F3F2F1]'}`}></div>
                 ))}
              </div>
           </div>
        </div>
      </div>
      <AttendanceDetailModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        date={selectedLogDate} 
        record={attendanceMap[selectedLogDate]} 
      />
    </div>
  );
};

export default Dashboard;
