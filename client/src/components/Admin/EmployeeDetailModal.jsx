import React, { useState, useEffect } from 'react';
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
  IndianRupee
} from 'lucide-react';
import Calendar from '../Calendar/Calendar';
import adminService from '../../services/adminService';
import { useUI } from '../../context/UIContext';

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
  const [attendanceData, setAttendanceData] = useState({});
  const [stats, setStats] = useState({ present: 0, absent: 0 });
  const { setLoading, showToast } = useUI();

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        // Fetch specific individual data from API
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
        setLoading(false);
      }
    };

    const fetchAttendance = async () => {
      try {
        const response = await adminService.getEmployeeAttendance(employee._id);
        const data = response.data;
        
        // Transform attendance array to map for Calendar component
        const attendanceMap = {};
        let presentCount = 0;
        data.forEach(record => {
          attendanceMap[record.date] = record.status || 'present';
          if (record.status === 'present' || !record.status) presentCount++;
        });
        
        setAttendanceData(attendanceMap);
        setStats({
          present: presentCount,
          absent: 0 // Will be calculated by calendar or logic if needed
        });
      } catch (error) {
        console.error('Failed to fetch employee attendance:', error);
      }
    };

    fetchEmployeeDetails();
    fetchAttendance();
  }, [employee._id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updated = await adminService.updateEmployee(employee._id, formData);
      showToast('Employee updated successfully', 'success');
      onUpdate(updated);
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
      setLoading(true);
      try {
        await adminService.deleteEmployee(employee._id);
        showToast('Employee deleted successfully', 'success');
        onDelete(employee._id);
        onClose();
      } catch (error) {
        showToast(error.response?.data?.message || 'Delete failed', 'error');
      } finally {
        setLoading(false);
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
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Left Side: Profile & Edit Form */}
        <div className="w-full md:w-2/5 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto custom-scrollbar bg-slate-50/30">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Profile Details</h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Employee Management</p>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Profile Avatar Section */}
            <div className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
               <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-400 shadow-inner overflow-hidden ring-4 ring-slate-50">
                  {fullEmployeeData.profileImg ? (
                    <img src={fullEmployeeData.profileImg} alt={fullEmployeeData.name} className="w-full h-full object-cover" />
                  ) : (
                    fullEmployeeData.name?.charAt(0) || 'U'
                  )}
               </div>
               <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Employee ID</p>
                  <p className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-blue-500" />
                    {fullEmployeeData.empId}
                  </p>
               </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Shield className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                   </div>
                   <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 shadow-sm"
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone</label>
                  <div className="relative group">
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Role</label>
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Designation</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                   </div>
                   <input 
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Senior Developer"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 shadow-sm"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Address</label>
                <div className="relative group">
                   <div className="absolute top-4 left-4 pointer-events-none">
                      <MapPin className="h-4 w-4 text-slate-400" />
                   </div>
                   <textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 shadow-sm resize-none"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Monthly Salary (₹)</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <IndianRupee className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                   </div>
                   <input 
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 50000"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 shadow-sm"
                   />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={handleUpdate}
                className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 group"
              >
                <Save className="h-4 w-4 transition-transform group-hover:scale-125" />
                Update Profile
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 w-full py-4 text-rose-500 bg-white border border-rose-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 group"
              >
                <Trash2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
                Delete Employee
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Attendance & Calendar */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar relative">
          <button 
            onClick={onClose}
            className="hidden md:flex absolute top-12 right-12 p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-12">
            {/* Attendance Quick Stats */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Attendance History</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Performance Overview</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 bg-green-50 rounded-3xl border border-green-100 flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-green-500">
                      <CheckCircle2 className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Days Present</p>
                      <p className="text-2xl font-black text-slate-900">{stats.present}</p>
                   </div>
                </div>
                <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-rose-500">
                      <AlertCircle className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Days Absent</p>
                      <p className="text-2xl font-black text-slate-900">{stats.absent}</p>
                   </div>
                </div>
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-500">
                      <Clock className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Work Hours</p>
                      <p className="text-2xl font-black text-slate-900">--</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Calendar Component */}
            <div className="bg-white p-2 rounded-[2.5rem]">
              <Calendar 
                attendanceData={attendanceData}
                onDateSelect={(date) => {
                  // Optional: Show specific day logs in another modal/view
                  console.log('Selected date for employee:', date);
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDetailModal;
