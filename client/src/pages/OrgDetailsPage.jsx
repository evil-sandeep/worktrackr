import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import { useUI } from '../context/UIContext';

// Modular Components
import OrgHeader from '../components/OrgDetails/OrgHeader';
import OrgStatsSidebar from '../components/OrgDetails/OrgStatsSidebar';
import EmployeeFleetTable from '../components/OrgDetails/EmployeeFleetTable';
import AddEmployeeModal from '../components/Admin/AddEmployeeModal';
import EmployeeDetailModal from '../components/Admin/EmployeeDetailModal';

const OrgDetailsPage = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { showLoader, addToast } = useUI();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [orgDetails, setOrgDetails] = useState(null);

  const fetchData = async () => {
    showLoader(true);
    try {
      // Fetch employees for this specific organization
      const data = await adminService.getEmployeesByOrg(orgId);
      setEmployees(data);

      // Fetch organization details
      const orgs = await adminService.getOrganizations();
      const currentOrg = orgs.find(o => o._id === orgId);
      if (currentOrg) {
        setOrgDetails(currentOrg);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch data', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const handlePay = (emp) => {
    navigate(`/payment?userId=${emp._id}&userName=${encodeURIComponent(emp.name)}`);
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.empId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full space-y-6 p-6 bg-[#F3F2F1] overflow-y-auto animate-in fade-in duration-300">
      <OrgHeader 
        orgDetails={orgDetails}
        employeesCount={employees.length}
        onBack={() => navigate('/organizations')}
        onAddEmployee={() => setIsAddModalOpen(true)}
      />

      <div className="grid grid-cols-12 gap-8">
        <OrgStatsSidebar 
          employees={employees}
          orgName={orgDetails?.name}
        />

        <EmployeeFleetTable 
          employees={filteredEmployees}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectEmployee={setSelectedEmployee}
          onPay={handlePay}
        />
      </div>

      <AddEmployeeModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
        orgId={orgId}
      />

      {selectedEmployee && (
        <EmployeeDetailModal 
          employee={selectedEmployee}
          orgId={orgId}
          onClose={() => setSelectedEmployee(null)}
          onUpdate={fetchData}
          onDelete={fetchData}
        />
      )}
    </div>
  );
};

export default OrgDetailsPage;
