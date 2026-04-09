import { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { useUI } from '../context/UIContext';

/**
 * Hook for managing employee profile data and actions
 */
const useEmployeeProfile = (employeeId, initialEmployee) => {
  const [employee, setEmployee] = useState(initialEmployee);
  const [formData, setFormData] = useState({
    name: initialEmployee?.name || '',
    phone: initialEmployee?.phone || '',
    address: initialEmployee?.address || '',
    designation: initialEmployee?.designation || '',
    role: initialEmployee?.role || 'employee',
    salary: initialEmployee?.salary || 0
  });
  
  const { showLoader, addToast } = useUI();

  // Fetch full details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      if (!employeeId) return;
      try {
        showLoader(true);
        const data = await adminService.getEmployeeById(employeeId);
        setEmployee(data);
        setFormData({
          name: data.name,
          phone: data.phone,
          address: data.address || '',
          designation: data.designation || '',
          role: data.role,
          salary: data.salary || 0
        });
      } catch (err) {
        addToast('Failed to fetch profile details', 'error');
      } finally {
        showLoader(false);
      }
    };
    fetchDetails();
  }, [employeeId, showLoader, addToast]);

  const updateProfile = async (onUpdateCallback) => {
    showLoader(true);
    try {
      const updated = await adminService.updateEmployee(employeeId, formData);
      setEmployee(updated);
      addToast('Profile updated successfully', 'success');
      if (onUpdateCallback) onUpdateCallback(updated);
      return updated;
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
      throw err;
    } finally {
      showLoader(false);
    }
  };

  const deleteProfile = async (onDeleteCallback) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.name}?`)) return;
    
    showLoader(true);
    try {
      await adminService.deleteEmployee(employeeId);
      addToast('Employee deleted successfully', 'success');
      if (onDeleteCallback) onDeleteCallback(employeeId);
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      showLoader(false);
    }
  };

  return {
    employee,
    formData,
    setFormData,
    updateProfile,
    deleteProfile
  };
};

export default useEmployeeProfile;
