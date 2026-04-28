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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-none animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-[95rem] max-h-[92vh] bg-white rounded-sm shadow-2xl border border-[#EDEBE9] flex flex-col xl:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button - Azure Style */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-[110] p-1.5 text-[#605E5C] hover:text-[#323130] hover:bg-[#F3F2F1] rounded-sm transition-all"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Left Sidebar: Profile (Modular) */}
        <div className="w-full xl:w-80 bg-[#FAF9F8] border-r border-[#EDEBE9] shrink-0">
          <ProfileSection 
            employee={employee}
            formData={formData}
            onFormChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            onUpdate={() => updateProfile(onUpdate)}
            onDelete={() => deleteProfile(onDelete)}
            onRefresh={onUpdate}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
          <div className="p-6 md:p-8 min-h-full flex flex-col">
            
            {/* Tab Navigation - Azure Design System Style */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-[#EDEBE9]">
               <div className="flex items-center">
                  {[
                    { id: 'attendance', label: 'Attendance Fleet', icon: History },
                    { id: 'tracking', label: 'Identity Pulse', icon: Activity },
                    { id: 'visits', label: 'Field Verification', icon: Store }
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)} 
                      className={`px-6 py-3 text-[13px] font-semibold flex items-center gap-2 transition-all border-b-2 ${
                        activeTab === tab.id 
                        ? 'text-[#0078D4] border-[#0078D4] bg-[#F3F2F1]/50' 
                        : 'text-[#605E5C] border-transparent hover:text-[#323130] hover:bg-[#F3F2F1]'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
               </div>
               <p className="text-[10px] font-bold text-[#0078D4] uppercase tracking-wider pr-4 pb-2 lg:pb-0">
                  {activeTab === 'attendance' ? `Region: ${viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : activeTab === 'tracking' ? `Snapshot: ${selectedDate}` : `Verified Visits`}
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
              <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                {activeTab === 'attendance' ? (
                  <AttendanceTab 
                    stats={stats}
                    attendanceMap={attendanceMap}
                    onViewDateChange={(date) => setViewDate(date)}
                    onDateSelect={(date) => setSelectedDate(formatDateISO(date))}
                  />
                ) : activeTab === 'tracking' ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                     <div className="md:col-span-4">
                       <TrackingCalendar selectedDate={selectedDate} onDateChange={(date) => setSelectedDate(date)} />
                     </div>
                     <div className="md:col-span-8">
                       <TrackingDataViewer data={trackingData} loading={trackingLoading} />
                     </div>
                  </div>
                ) : (
                  <AdminVisitView employeeId={employee._id} />
                )}
              </div>

              {/* Day Log Detail Sidebar (Modular) */}
              {activeTab === 'attendance' && (
                <div className="lg:col-span-12 xl:col-span-4">
                  <LogDetailSidebar 
                    selectedDate={selectedDate}
                    selectedRecord={selectedRecord}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
