import Calendar from '../Calendar/Calendar';
import TrackingCalendar from './EmployeeTracking/TrackingCalendar';
import TrackingDataViewer from './EmployeeTracking/TrackingDataViewer';
import adminService from '../../services/adminService';
import { useUI } from '../../context/UIContext';

import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  IdCard, 
  Shield, 
  Trash2, 
  Save, 
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  Map,
  Image as ImageIcon,
  Camera,
  History,
  Navigation,
  Activity
} from 'lucide-react';

const EmployeeDetailModal = ({ employee, onClose, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    phone: employee?.phone || '',
    address: employee?.address || '',
    designation: employee?.designation || '',
    role: employee?.role || 'employee',
    salary: employee?.salary || 0
  });
  const [fullEmployeeData, setFullEmployeeData] = useState(employee);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'tracking'
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const { showLoader, addToast } = useUI();

  const fetchTrackingData = async (date) => {
    setTrackingLoading(true);
    try {
      const response = await adminService.getDailyTracking(employee._id, date);
      setTrackingData(response.data);
    } catch (error) {
      addToast('Failed to fetch tracking data', 'error');
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tracking') {
      fetchTrackingData(selectedDate);
    }
  }, [selectedDate, activeTab]);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        showLoader(true);
        const fullData = await adminService.getEmployeeById(employee._id);
        setFullEmployeeData(fullData);
        setFormData({
          name: fullData.name,
          phone: fullData.phone,
          address: fullData.address || '',
          designation: fullData.designation || '',
          role: fullData.role,
          salary: fullData.salary || 0
        });
      } catch (error) {
        console.error('Failed to fetch full employee data:', error);
      } finally {
        showLoader(false);
      }
    };

    const fetchAttendance = async () => {
      try {
        const response = await adminService.getEmployeeAttendance(employee._id);
        setAttendanceRecords(response.data);
      } catch (error) {
        console.error('Failed to fetch employee attendance:', error);
      }
    };

    fetchEmployeeDetails();
    fetchAttendance();
  }, [employee._id, showLoader]);

  // Real-time Status Logic: 70 min threshold for OFFLINE
  const getStatus = (emp) => {
    if (!emp) return { label: 'OFFLINE', color: 'bg-slate-400', bg: 'bg-slate-50 border-slate-100' };
    
    const lastSeen = new Date(emp.lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSeen) / 60000);

    if (diffInMinutes > 70) {
      return { label: 'OFFLINE', color: 'bg-slate-400', bg: 'bg-slate-50 border-slate-100 transition-all' };
    }

    if (emp.trackingStatus === 'GPS OFF') {
      return { label: 'GPS OFF', color: 'bg-amber-500', bg: 'bg-amber-50 border-amber-100 transition-all' };
    }

    return { label: 'ONLINE', color: 'bg-green-500', bg: 'bg-green-50 border-green-100 transition-all' };
  };

  // Derive attendance map for the Calendar checkmarks
  const attendanceMap = useMemo(() => {
    const map = {};
    attendanceRecords.forEach(record => {
      map[record.date] = record.status || 'present';
    });
    return map;
  }, [attendanceRecords]);

  // Stats calculation (Filtered by viewed month)
  const stats = useMemo(() => {
    let present = 0;
    let totalEarning = 0;
    let totalMinutes = 0;

    const viewMonth = viewDate.getMonth();
    const viewYear = viewDate.getFullYear();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // 1. Calculate Present, Earnings, and Hours from existing records
    attendanceRecords.forEach(record => {
      const recordDate = new Date(record.date);
      
      // Filter by visible month
      if (recordDate.getMonth() !== viewMonth || recordDate.getFullYear() !== viewYear) {
        return;
      }

      if (record.status === 'present' || !record.status) {
        present++;
        totalEarning += (record.earning || 0);
        
        // Parse "HH:MM" work hours if available
        if (record.totalHours && record.totalHours.includes(':')) {
            const [h, m] = record.totalHours.split(':').map(Number);
            totalMinutes += (h * 60) + m;
        }
      }
    });

    // 2. Calculate Absent based on logic: (Days Elapsed in Month) - (Days Present)
    let daysToCount = 0;
    if (viewYear < currentYear || (viewYear === currentYear && viewMonth < currentMonth)) {
      // Past month: All days in month
      daysToCount = new Date(viewYear, viewMonth + 1, 0).getDate();
    } else if (viewYear === currentYear && viewMonth === currentMonth) {
      // Current month: Days elapsed up to today
      daysToCount = today.getDate();
    } else {
      // Future month: Not yet applicable
      daysToCount = 0;
    }

    const absent = Math.max(0, daysToCount - present);

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return { 
        present, 
        absent, 
        totalEarning, 
        totalHoursStr: `${hours}h ${mins}m`
    };
  }, [attendanceRecords, viewDate]);

  // Selected date record
  const selectedRecord = useMemo(() => {
    return attendanceRecords.find(r => r.date === selectedDate);
  }, [attendanceRecords, selectedDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    showLoader(true);
    try {
      const updated = await adminService.updateEmployee(employee._id, formData);
      addToast('Employee updated successfully', 'success');
      onUpdate(updated);
    } catch (error) {
      addToast(error.response?.data?.message || 'Update failed', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
      showLoader(true);
      try {
        await adminService.deleteEmployee(employee._id);
        addToast('Employee deleted successfully', 'success');
        onDelete(employee._id);
        onClose();
      } catch (error) {
        addToast(error.response?.data?.message || 'Delete failed', 'error');
      } finally {
        showLoader(false);
      }
    }
  };

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[90rem] max-h-[95vh] bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col xl:flex-row overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Global Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-[110] p-3 bg-white/80 backdrop-blur-md text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl shadow-lg border border-slate-100 transition-all active:scale-95 group"
        >
          <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
        </button>
        
        {/* Left Side: Profile & Edit Form */}
        <div className="w-full xl:w-80 p-6 md:p-8 border-b xl:border-b-0 xl:border-r border-slate-100 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Profile</h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Employee Management</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
               <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400 shadow-inner overflow-hidden ring-4 ring-slate-50 relative">
                  {fullEmployeeData.profileImg ? (
                    <img src={fullEmployeeData.profileImg} alt={fullEmployeeData.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    fullEmployeeData.name?.charAt(0) || 'U'
                  )}
                  {/* Real-time Status Mini Indicator */}
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${getStatus(fullEmployeeData).color.replace('bg-', 'bg-').split(' ')[0]}`}></div>
               </div>
               <div className="space-y-0.5 truncate">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emp ID</p>
                  <p className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                    <IdCard className="h-3.5 w-3.5 text-blue-500" />
                    {fullEmployeeData.empId}
                  </p>
               </div>
            </div>

            {/* Status Connectivity Insight */}
            <div className={`p-4 rounded-[1.5rem] border ${getStatus(fullEmployeeData).bg} space-y-2 animate-in slide-in-from-top-2 duration-500`}>
               <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white ${getStatus(fullEmployeeData).color}`}>
                    {getStatus(fullEmployeeData).label}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">{new Date(fullEmployeeData.lastSeen).toLocaleTimeString()}</span>
               </div>
               <p className="text-[10px] font-bold text-slate-600 leading-tight">
                 Last active pulse: <br/>
                 <span className="text-slate-400 font-medium">{new Date(fullEmployeeData.lastSeen).toLocaleString()}</span>
               </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm text-slate-900 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role & Designation</label>
                <div className="grid grid-cols-2 gap-2">
                    <select 
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="px-3 py-3 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-900 shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="employee">Staff</option>
                        <option value="admin">Admin</option>
                    </select>
                    <input 
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="Title"
                        className="px-3 py-3 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary (₹)</label>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input 
                        name="salary"
                        type="number"
                        value={formData.salary}
                        onChange={handleChange}
                        className="w-full pl-9 pr-4 py-3 bg-white border border-slate-100 rounded-xl outline-none font-bold text-sm text-slate-900 shadow-sm"
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact & Address</label>
                <input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone"
                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold text-sm text-slate-900 shadow-sm mb-2"
                />
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Street Address"
                  className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl outline-none font-bold text-sm text-slate-900 shadow-sm resize-none text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={handleUpdate}
                className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <Save className="h-3.5 w-3.5" />
                Update Profile
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 w-full py-4 text-rose-500 bg-white border border-rose-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Middle & Right Content: Stats, Calendar, and Detail View */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
          <div className="p-6 md:p-10 min-h-full flex flex-col">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
            {/* Calendar and Main Stats (8 Cols) */}
            <div className="lg:col-span-12 xl:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-6 mb-2">
                       <button 
                         onClick={() => setActiveTab('attendance')}
                         className={`text-2xl font-black tracking-tighter flex items-center gap-3 transition-all ${activeTab === 'attendance' ? 'text-slate-900 border-b-4 border-blue-600 pb-1' : 'text-slate-300 hover:text-slate-400'}`}
                       >
                          <History className="h-6 w-6" />
                          Attendance
                       </button>
                       <button 
                         onClick={() => setActiveTab('tracking')}
                         className={`text-2xl font-black tracking-tighter flex items-center gap-3 transition-all ${activeTab === 'tracking' ? 'text-slate-900 border-b-4 border-blue-600 pb-1' : 'text-slate-300 hover:text-slate-400'}`}
                       >
                          <Activity className="h-6 w-6" />
                          Pulse Log
                       </button>
                    </div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                        {activeTab === 'attendance' ? `Monthly Summary: ${viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : `Daily Audit: ${selectedDate}`}
                    </p>
                  </div>
              </div>              {activeTab === 'attendance' ? (
                <>
                  {/* Stat Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present</p>
                            <p className="text-xl font-black text-slate-900">{stats.present}</p>
                        </div>
                    </div>
                    <div className="p-5 bg-rose-50/50 rounded-3xl border border-rose-100 flex flex-col gap-2">
                        <AlertCircle className="h-5 w-5 text-rose-600" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</p>
                            <p className="text-xl font-black text-slate-900">{stats.absent}</p>
                        </div>
                    </div>
                    <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex flex-col gap-2">
                        <IndianRupee className="h-5 w-5 text-emerald-600" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Earnings</p>
                            <p className="text-xl font-black text-slate-900">₹{stats.totalEarning}</p>
                        </div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-2">
                        <Clock className="h-5 w-5 text-slate-600" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Hours</p>
                            <p className="text-xl font-black text-slate-900">{stats.totalHoursStr}</p>
                        </div>
                    </div>
                  </div>

                  <div className="bg-white p-2 border border-slate-100 rounded-[2.5rem]">
                    <Calendar 
                      attendanceData={attendanceMap}
                      onViewDateChange={(date) => setViewDate(date)}
                      onDateSelect={(date) => {
                        const dateObj = new Date(date);
                        const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
                        setSelectedDate(formattedDate);
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     <div className="lg:col-span-4">
                        <TrackingCalendar 
                          selectedDate={selectedDate}
                          onDateChange={(date) => setSelectedDate(date)}
                        />
                     </div>
                     <div className="lg:col-span-8">
                        <TrackingDataViewer 
                          data={trackingData}
                          loading={trackingLoading}
                        />
                     </div>
                   </div>
                </div>
              )}
            </div>

            {/* Selected Day Detailed View - Only show in Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="lg:col-span-12 xl:col-span-4">
                <div className="sticky top-0 space-y-6">
                    <div className="space-y-1">
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">Day Log Detail</h4>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Selected: {selectedDate}</p>
                    </div>

                    {selectedRecord ? (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                          {/* Status Card */}
                          <div className={`p-6 rounded-[2rem] border transition-all ${selectedRecord.status === 'absent' ? 'bg-rose-50 border-rose-100' : 'bg-green-50 border-green-100'}`}>
                              <div className="flex items-center justify-between mb-4">
                                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                      selectedRecord.status === 'absent' 
                                      ? 'bg-rose-500 text-white border-rose-600' 
                                      : 'bg-green-600 text-white border-green-700'
                                  }`}>
                                      {selectedRecord.status || 'Present'}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-slate-900">
                                      <IndianRupee className="h-4 w-4" />
                                      <span className="font-black text-lg">₹{selectedRecord.earning || 0}</span>
                                  </div>
                              </div>
                              
                              {selectedRecord.status !== 'absent' && (
                                  <div className="flex items-center gap-3 text-slate-600">
                                      <Clock className="h-4 w-4" />
                                      <span className="text-sm font-bold uppercase tracking-widest leading-none">
                                          Worked {selectedRecord.totalHours || '--:--'}
                                      </span>
                                  </div>
                              )}
                          </div>

                          {/* Image Evidence */}
                          {selectedRecord.status !== 'absent' && (
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                          <Camera className="h-3 w-3" /> Check-In
                                      </p>
                                      <div className="aspect-[3/4] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                                          {selectedRecord.checkIn?.imageUrl ? (
                                              <img src={selectedRecord.checkIn.imageUrl} alt="In" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                          ) : (
                                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                  <ImageIcon className="h-8 w-8" />
                                              </div>
                                          )}
                                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                              <p className="text-[10px] font-black text-white">{selectedRecord.checkIn?.time || 'N/A'}</p>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="space-y-3">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                          <Clock className="h-3 w-3" /> Check-Out
                                      </p>
                                      <div className="aspect-[3/4] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                                            {selectedRecord.checkOut?.imageUrl ? (
                                              <img src={selectedRecord.checkOut.imageUrl} alt="Out" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                          ) : (
                                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                  <ImageIcon className="h-8 w-8" />
                                              </div>
                                          )}
                                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                              <p className="text-[10px] font-black text-white">{selectedRecord.checkOut?.time || 'N/A'}</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* Location Context */}
                          {selectedRecord.status !== 'absent' && (
                              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                  <div className="flex items-start gap-3">
                                      <MapPin className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                                      <div className="min-w-0">
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-In Location</p>
                                          <p className="text-xs font-bold text-slate-900 truncate">{selectedRecord.checkIn?.location || 'Not Recorded'}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                      <Map className="h-4 w-4 text-indigo-600 mt-1 flex-shrink-0" />
                                      <div className="min-w-0">
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-Out Location</p>
                                          <p className="text-xs font-bold text-slate-900 truncate">{selectedRecord.checkOut?.location || 'Not Recorded'}</p>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                    ) : (
                      <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 animate-in fade-in duration-700">
                          <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-400 font-bold text-sm">No record for this date.</p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Status: Absent / Off-Duty</p>
                      </div>
                    )}
                </div>
              </div>
            )}
/div>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
};

export default EmployeeDetailModal;
