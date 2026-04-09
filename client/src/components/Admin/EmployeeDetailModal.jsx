import React, { useState, useEffect, useMemo } from 'react';
import { X, History, Activity, Store } from 'lucide-react';

// Hooks
import useEmployeeProfile from '../../hooks/useEmployeeProfile';
import useEmployeeAttendance from '../../hooks/useEmployeeAttendance';
import { useUI } from '../../context/UIContext';

// Components
import TrackingCalendar from './EmployeeTracking/TrackingCalendar';
import TrackingDataViewer from './EmployeeTracking/TrackingDataViewer';
import AdminVisitView from './AdminVisitView';
import ProfileSection from './EmployeeDetail/ProfileSection';
import AttendanceTab from './EmployeeDetail/AttendanceTab';
import LogDetailSidebar from './EmployeeDetail/LogDetailSidebar';

// Services/Utils
import adminService from '../../services/adminService';
import { formatDateISO } from '../../utils/employeeUtils';

const EmployeeDetailModal = ({ employee: initialEmployee, onClose, onUpdate, onDelete }) => {
  // 1. Business Logic State
  const [activeTab, setActiveTab] = useState('attendance'); 
  const [selectedDate, setSelectedDate] = useState(formatDateISO(new Date()));
  const [viewDate, setViewDate] = useState(new Date());
  
  // 2. Custom Hooks (Clean Architecture)
  const { 
    employee, 
    formData, 
    setFormData, 
    updateProfile, 
    deleteProfile 
  } = useEmployeeProfile(initialEmployee._id, initialEmployee);

  const { 
    attendanceRecords, 
    attendanceMap, 
    stats 
  } = useEmployeeAttendance(initialEmployee._id, viewDate);

  // 3. Tracking Logic (Specific to current day view)
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const { addToast } = useUI();

  const fetchTrackingData = async (date) => {
    setTrackingLoading(true);
    try {
      const response = await adminService.getDailyTracking(initialEmployee._id, date);
      setTrackingData(response.data);
    } catch (error) {
      addToast('Failed to fetch tracking data', 'error');
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tracking') fetchTrackingData(selectedDate);
  }, [selectedDate, activeTab]);

  // 4. Derived State
  const selectedRecord = useMemo(() => {
    return attendanceRecords.find(r => r.date === selectedDate);
  }, [attendanceRecords, selectedDate]);

  // 5. Lifecycle for Scroll Lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative w-full max-w-[90rem] max-h-[95vh] bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col xl:flex-row overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-8 right-8 z-[110] p-3 bg-white/80 backdrop-blur-md text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl shadow-lg border border-slate-100 transition-all active:scale-95 group">
          <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
        </button>
        
        {/* Left Sidebar: Profile (Modular) */}
        <ProfileSection 
          employee={employee}
          formData={formData}
          onFormChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          onUpdate={() => updateProfile(onUpdate)}
          onDelete={() => deleteProfile(onDelete)}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
          <div className="p-6 md:p-10 min-h-full flex flex-col">
            
            {/* Tab Navigation */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
               <div className="flex items-center gap-6">
                  <button onClick={() => setActiveTab('attendance')} className={`text-2xl font-black tracking-tighter flex items-center gap-2 transition-all ${activeTab === 'attendance' ? 'text-slate-900 border-b-4 border-blue-600 pb-1' : 'text-slate-300'}`}><History className="h-6 w-6" />Attendance</button>
                  <button onClick={() => setActiveTab('tracking')} className={`text-2xl font-black tracking-tighter flex items-center gap-2 transition-all ${activeTab === 'tracking' ? 'text-slate-900 border-b-4 border-blue-600 pb-1' : 'text-slate-300'}`}><Activity className="h-6 w-6" />Pulse</button>
                  <button onClick={() => setActiveTab('visits')} className={`text-2xl font-black tracking-tighter flex items-center gap-2 transition-all ${activeTab === 'visits' ? 'text-slate-900 border-b-4 border-blue-600 pb-1' : 'text-slate-300'}`}><Store className="h-6 w-6" />Visits</button>
               </div>
               <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest text-right">
                  {activeTab === 'attendance' ? `Summary: ${viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : activeTab === 'tracking' ? `Audit: ${selectedDate}` : `Field Verification`}
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
              <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                {activeTab === 'attendance' ? (
                  <AttendanceTab 
                    stats={stats}
                    attendanceMap={attendanceMap}
                    onViewDateChange={(date) => setViewDate(date)}
                    onDateSelect={(date) => setSelectedDate(formatDateISO(date))}
                  />
                ) : activeTab === 'tracking' ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                     <div className="md:col-span-4"><TrackingCalendar selectedDate={selectedDate} onDateChange={(date) => setSelectedDate(date)} /></div>
                     <div className="md:col-span-8"><TrackingDataViewer data={trackingData} loading={trackingLoading} /></div>
                  </div>
                ) : (
                  <AdminVisitView employeeId={employee._id} />
                )}
              </div>

              {/* Day Log Detail Sidebar (Modular) */}
              {activeTab === 'attendance' && (
                <LogDetailSidebar 
                  selectedDate={selectedDate}
                  selectedRecord={selectedRecord}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
