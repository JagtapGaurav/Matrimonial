
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getUsers, getShortlistedIds, toggleShortlist, apiReportUser } from '@/services/api';
import { User, EducationLevel } from '../types';
import Header from '../components/Header';
import ProfileCard from '../components/ProfileCard';
import ProfileModal from '../components/ProfileModal';
import ReportModal from '../components/ReportModal';
import { calculateAge } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import { states, educationLevels } from '../data/locations';

const PROFILES_PER_PAGE = 12;

const UserDashboardPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToReport, setUserToReport] = useState<User | null>(null);
  const [visibleCount, setVisibleCount] = useState(PROFILES_PER_PAGE);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);

  const [ageFilter, setAgeFilter] = useState<{ min: number; max: number }>({ min: 18, max: 70 });
  const [stateFilter, setStateFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [educationFilter, setEducationFilter] = useState<string>('');
  
  const citiesForFilter = useMemo(() => {
    if (!stateFilter) return [];
    const selectedState = states.find(s => s.name === stateFilter);
    return selectedState ? selectedState.cities : [];
  }, [stateFilter]);

  const fetchUsersAndShortlist = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [allUsers, sIds] = await Promise.all([
        getUsers(),
        getShortlistedIds(currentUser.id)
      ]);
      
      let displayUsers = allUsers.filter(u => u.id !== currentUser.id && !u.isAdmin);

      if (currentUser?.gender === 'Male') {
          displayUsers = displayUsers.filter(u => u.gender === 'Female');
      } else if (currentUser?.gender === 'Female') {
          displayUsers = displayUsers.filter(u => u.gender === 'Male');
      }
      
      setUsers(displayUsers);
      setShortlistedIds(sIds);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);


  useEffect(() => {
    fetchUsersAndShortlist();
  }, [fetchUsersAndShortlist]);
  
  useEffect(() => {
    setCityFilter('');
  }, [stateFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const age = calculateAge(user.dob);
      const isAgeMatch = age >= ageFilter.min && age <= ageFilter.max;
      const isStateMatch = stateFilter ? user.address.state === stateFilter : true;
      const isCityMatch = cityFilter ? user.address.city === cityFilter : true;
      const isEducationMatch = educationFilter ? user.education === educationFilter : true;
      return isAgeMatch && isStateMatch && isCityMatch && isEducationMatch;
    });
  }, [users, ageFilter, stateFilter, cityFilter, educationFilter]);
  
  const paginatedUsers = useMemo(() => {
      return filteredUsers.slice(0, visibleCount);
  }, [filteredUsers, visibleCount]);

  const handleMaxAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = parseInt(e.target.value);
      if (!isNaN(newMax) && newMax >= ageFilter.min) {
          setAgeFilter({...ageFilter, max: newMax});
      }
  }
  
  const resetFilters = () => {
      setAgeFilter({min: 18, max: 70});
      setStateFilter('');
      setCityFilter('');
      setEducationFilter('');
  }

  const handleViewMyProfile = () => {
      if (currentUser) {
          setSelectedUser(currentUser);
      }
  };
  
  const handleToggleShortlist = async (targetUserId: string) => {
      if(!currentUser) return;
      const newShortlist = await toggleShortlist(currentUser.id, targetUserId);
      setShortlistedIds(newShortlist);
  };

  const handleReport = (user: User) => {
      setUserToReport(user);
  }

  const handleReportSubmit = (reason: string) => {
      if(userToReport && currentUser) {
          apiReportUser(currentUser, userToReport, reason);
          alert(`Thank you for your feedback. Profile for ${userToReport.fullName} has been reported.`);
          setUserToReport(null);
      }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading profiles...</div>;
  }

  return (
    <>
      <Header onViewMyProfile={handleViewMyProfile} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-4 rounded-lg shadow-md mb-8 sticky top-[65px] z-40">
          <div className="flex flex-wrap items-end gap-4">
              <div className="flex-grow">
                 <label className="block text-sm font-medium text-gray-700">Age Range</label>
                 <div className="flex items-center mt-1 space-x-2">
                     <input type="number" value={ageFilter.min} disabled className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"/>
                     <span className="text-gray-500 font-bold">-</span>
                     <input type="number" min="18" max="70" value={ageFilter.max} onChange={handleMaxAgeChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
                 </div>
              </div>
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700">State</label>
                <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                  <option value="">All States</option>
                  {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md" disabled={!stateFilter}>
                  <option value="">All Cities</option>
                  {citiesForFilter.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-grow">
                 <label className="block text-sm font-medium text-gray-700">Education</label>
                 <select value={educationFilter} onChange={(e) => setEducationFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                  <option value="">All Levels</option>
                  {educationLevels.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="flex-shrink-0">
                  <button onClick={resetFilters} className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300">
                      Reset
                  </button>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedUsers.map(user => (
            <ProfileCard 
                key={user.id} 
                user={user} 
                onViewDetails={setSelectedUser}
                isShortlisted={shortlistedIds.includes(user.id)}
                onShortlistToggle={handleToggleShortlist}
                onReport={handleReport}
             />
          ))}
        </div>
        
        {filteredUsers.length === 0 && !loading && (
            <div className="text-center col-span-full py-16">
                <p className="text-gray-500 text-xl">No profiles match your criteria.</p>
            </div>
        )}
        
        {visibleCount < filteredUsers.length && (
            <div className="text-center mt-12">
                <button 
                    onClick={() => setVisibleCount(prev => prev + PROFILES_PER_PAGE)}
                    className="bg-primary text-white py-2 px-8 rounded-full hover:bg-primary-focus transition duration-300 font-semibold"
                >
                    Load More
                </button>
            </div>
        )}
      </main>
      <ProfileModal 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)}
        isShortlisted={selectedUser ? shortlistedIds.includes(selectedUser.id) : false}
        onShortlistToggle={handleToggleShortlist}
        onReport={handleReport}
        isMyProfile={selectedUser?.id === currentUser?.id}
       />
       <ReportModal 
        user={userToReport}
        onClose={() => setUserToReport(null)}
        onSubmit={handleReportSubmit}
       />
    </>
  );
};

export default UserDashboardPage;