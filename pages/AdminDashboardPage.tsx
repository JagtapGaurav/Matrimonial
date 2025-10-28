import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getUsageReportByCity,
  getActivityLog,
} from '@/services/api';
import { User, UserStatus, ReportData, ActivityLog } from '../types';
import Header from '../components/Header';
import {
  UsersIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type AdminTab = 'users' | 'reports' | 'logs';

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedReports, fetchedLogs] = await Promise.all([
        getAllUsers(),
        getUsageReportByCity(),
        getActivityLog(),
      ]);
      setUsers(fetchedUsers.filter(u => !u.isAdmin));
      setReportData(fetchedReports);
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

  const renderUsers = () => (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Profile', 'Name', 'Email', 'City', 'Status', 'Actions'].map(header => (
                 <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <img className="h-10 w-10 rounded-full" src={user.profilePhotoUrl} alt="" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.address.city}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : user.status === 'Blocked' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                 <button className="text-blue-600 hover:text-blue-900" title="Edit"><PencilIcon className="h-5 w-5"/></button>
                 <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900" title="Delete"><TrashIcon className="h-5 w-5"/></button>
                 <button onClick={() => handleUpdateStatus(user.id, 'Blocked')} className="text-yellow-600 hover:text-yellow-900" title="Block"><LockClosedIcon className="h-5 w-5"/></button>
                 <button onClick={() => handleUpdateStatus(user.id, 'Deactivated')} className="text-gray-600 hover:text-gray-900" title="Deactivate"><NoSymbolIcon className="h-5 w-5"/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderReports = () => (
    <div className="bg-white p-6 rounded-lg shadow h-96">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution by City</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={reportData} margin={{ top: 5, right: 30, left: 20, bottom: 5, }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="users" fill="#0F766E" />
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

  const tabContent = {
    users: renderUsers,
    reports: renderReports,
    logs: renderLogs,
  };
  
  const TabButton: React.FC<{tab: AdminTab, icon: React.ReactNode, label: string}> = ({tab, icon, label}) => (
      <button onClick={() => setActiveTab(tab)} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
        {icon}
        <span>{label}</span>
      </button>
  );

  return (
    <>
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <TabButton tab="users" icon={<UsersIcon className="h-5 w-5"/>} label="User Management"/>
            <TabButton tab="reports" icon={<ChartBarIcon className="h-5 w-5"/>} label="Reports"/>
            <TabButton tab="logs" icon={<ClipboardDocumentListIcon className="h-5 w-5"/>} label="Activity Log"/>
        </div>
        <div>{loading ? <p>Loading...</p> : tabContent[activeTab]()}</div>
      </main>
    </>
  );
};

export default AdminDashboardPage;