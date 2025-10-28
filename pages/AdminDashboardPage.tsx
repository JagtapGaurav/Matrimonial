
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getUsageReportByCity,
  getActivityLog,
  getReports,
  apiAdminResetUserPassword,
  apiChangeOwnPassword,
  apiAdminUpdateUser,
} from '@/services/api';
import { User, UserStatus, ReportData, ActivityLog, Report } from '../types';
import Header from '../components/Header';
import {
  UsersIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  PaperAirplaneIcon,
  KeyIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';

type AdminTab = 'users' | 'reports' | 'usage' | 'logs' | 'settings';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const AdminDashboardPage: React.FC = () => {
  const { user: adminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isBulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [bulkActionType, setBulkActionType] = useState<'newsletter' | 'whatsapp' | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedReports, fetchedUsage, fetchedLogs] = await Promise.all([
        getAllUsers(),
        getReports(),
        getUsageReportByCity(),
        getActivityLog(),
      ]);
      setUsers(fetchedUsers);
      setReports(fetchedReports);
      setReportData(fetchedUsage);
      setActivityLogs(fetchedLogs);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (userId: string, status: UserStatus) => {
    if (window.confirm(`Are you sure you want to set status to ${status} for this user?`)) {
      await updateUserStatus(userId, status);
      fetchData(); // Refresh data
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      await deleteUser(userId);
      fetchData(); // Refresh data
    }
  };

  const handleResetPassword = async (userId: string) => {
      const newPassword = prompt("Enter new password for the user:");
      if (newPassword) {
          try {
            await apiAdminResetUserPassword(userId, newPassword);
            alert("Password reset successfully.");
          } catch(e: any) {
            alert("Error: " + e.message);
          }
      }
  }

  const handleEditUser = (user: User) => {
      setSelectedUser(user);
      setEditModalOpen(true);
  }
  
  const handleAdminPasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!adminUser) return;
      const formData = new FormData(e.currentTarget);
      const oldPassword = formData.get('oldPassword') as string;
      const newPassword = formData.get('newPassword') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (newPassword !== confirmPassword) {
          alert("New passwords do not match.");
          return;
      }
      try {
          await apiChangeOwnPassword(adminUser.id, oldPassword, newPassword);
          alert("Password changed successfully!");
          e.currentTarget.reset();
      } catch(e: any) {
          alert("Error: " + e.message);
      }
  }

  const openBulkActionModal = (type: 'newsletter' | 'whatsapp') => {
      setBulkActionType(type);
      setBulkActionModalOpen(true);
  }

  const filteredUsers = useMemo(() => {
      return users.filter(user => 
          !user.isAdmin && (
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.mobile.includes(searchTerm)
      ));
  }, [users, searchTerm]);
  
  const nonAdminUsers = users.filter(u => !u.isAdmin);

  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-grow max-w-xs">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2"/>
              <input 
                type="text" 
                placeholder="Search by name, email, mobile..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              />
          </div>
          <div className="flex items-center space-x-2">
              <button onClick={() => openBulkActionModal('newsletter')} className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                  <PaperAirplaneIcon className="h-5 w-5"/><span>Newsletter</span>
              </button>
               <button onClick={() => openBulkActionModal('whatsapp')} className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>
                  <span>WhatsApp</span>
              </button>
              <button onClick={() => setAddModalOpen(true)} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-focus transition-colors text-sm font-medium">
                  <UserPlusIcon className="h-5 w-5"/><span>Add User</span>
              </button>
          </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Profile', 'Name', 'Email & Mobile', 'City', 'Status', 'Actions'].map(header => (
                   <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img className="h-10 w-10 rounded-full" src={user.profilePhotoUrl} alt="" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{user.email}</div>
                    <div>{user.mobile}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.address.city}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : user.status === 'Blocked' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                   <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900" title="Edit"><PencilIcon className="h-5 w-5"/></button>
                   <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900" title="Delete"><TrashIcon className="h-5 w-5"/></button>
                   {user.status === 'Active' ? 
                     <button onClick={() => handleUpdateStatus(user.id, 'Deactivated')} className="text-gray-600 hover:text-gray-900" title="Deactivate"><NoSymbolIcon className="h-5 w-5"/></button>
                     :
                     <button onClick={() => handleUpdateStatus(user.id, 'Active')} className="text-green-600 hover:text-green-900" title="Activate"><CheckCircleIcon className="h-5 w-5"/></button>
                   }
                   <button onClick={() => handleResetPassword(user.id)} className="text-purple-600 hover:text-purple-900" title="Reset Password"><KeyIcon className="h-5 w-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
     <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
             {['Timestamp', 'Reported User', 'Reason', 'Reported By'].map(header => (
                 <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {reports.map(report => (
                <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.reportedUserName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reporterName}</td>
                </tr>
            ))}
        </tbody>
      </table>
     </div>
  );

  const renderUsage = () => (
    <div className="bg-white p-6 rounded-lg shadow h-96">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution by City</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={reportData} margin={{ top: 5, right: 30, left: 20, bottom: 5, }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="users" fill="#8c1c13" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderLogs = () => (
     <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
             {['Timestamp', 'User', 'Action'].map(header => (
                 <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {activityLogs.map(log => (
                <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.action}</td>
                </tr>
            ))}
        </tbody>
      </table>
     </div>
  );
  
  const renderSettings = () => (
    <div className="bg-white p-8 rounded-lg shadow max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Change Your Password</h3>
        <form onSubmit={handleAdminPasswordChange} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" name="oldPassword" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" name="newPassword" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" name="confirmPassword" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
            </div>
            <div className="text-right">
                <button type="submit" className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-focus">Update Password</button>
            </div>
        </form>
    </div>
  );

  const tabContent = {
    users: renderUsers,
    reports: renderReports,
    usage: renderUsage,
    logs: renderLogs,
    settings: renderSettings,
  };
  
  const TabButton: React.FC<{tab: AdminTab, icon: React.ReactNode, label: string}> = ({tab, icon, label}) => (
      <button onClick={() => setActiveTab(tab)} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}>
        {icon}
        <span>{label}</span>
      </button>
  );

  return (
    <>
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Users" value={nonAdminUsers.length} icon={<UsersIcon className="h-6 w-6 text-primary"/>} />
            <StatCard title="Active Users" value={nonAdminUsers.filter(u=>u.status === 'Active').length} icon={<CheckCircleIcon className="h-6 w-6 text-primary"/>} />
            <StatCard title="Deactivated" value={nonAdminUsers.filter(u=>u.status !== 'Active').length} icon={<NoSymbolIcon className="h-6 w-6 text-primary"/>} />
            <StatCard title="Profiles Reported" value={reports.length} icon={<ExclamationTriangleIcon className="h-6 w-6 text-primary"/>} />
        </div>

        <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <TabButton tab="users" icon={<UsersIcon className="h-5 w-5"/>} label="User Management"/>
            <TabButton tab="reports" icon={<ExclamationTriangleIcon className="h-5 w-5"/>} label="Reported Profiles"/>
            <TabButton tab="usage" icon={<ChartBarIcon className="h-5 w-5"/>} label="Usage Reports"/>
            <TabButton tab="logs" icon={<ClipboardDocumentListIcon className="h-5 w-5"/>} label="Activity Log"/>
            <TabButton tab="settings" icon={<Cog6ToothIcon className="h-5 w-5"/>} label="Settings"/>
        </div>
        <div>{loading ? <p>Loading...</p> : tabContent[activeTab]()}</div>
      </main>

       {isBulkActionModalOpen && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                   <div className="p-6">
                        <h3 className="text-lg font-bold">Send Bulk {bulkActionType === 'newsletter' ? 'Newsletter' : 'WhatsApp'}</h3>
                        <p className="text-sm text-gray-500">This message will be sent to all {filteredUsers.length} users in the current view. (This is a simulation).</p>
                        <textarea className="w-full h-40 border rounded-lg mt-4 p-2 focus:ring-primary focus:border-primary" placeholder="Compose your message..."></textarea>
                   </div>
                   <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-2">
                       <button onClick={() => setBulkActionModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm">Cancel</button>
                       <button onClick={() => {alert('Message sent! (simulation)'); setBulkActionModalOpen(false);}} className="bg-primary text-white px-4 py-2 rounded-lg text-sm">Send Message</button>
                   </div>
               </div>
           </div>
       )}
    </>
  );
};

export default AdminDashboardPage;