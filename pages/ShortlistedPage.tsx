
import React, { useState, useEffect, useCallback } from 'react';
import { getShortlistedProfiles, toggleShortlist } from '@/services/api';
import { User } from '../types';
import Header from '../components/Header';
import ProfileCard from '../components/ProfileCard';
import ProfileModal from '../components/ProfileModal';
import ReportModal from '../components/ReportModal';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const ShortlistedPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [shortlistedUsers, setShortlistedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToReport, setUserToReport] = useState<User | null>(null);

    const fetchShortlisted = useCallback(async () => {
        if (!currentUser) return;
        try {
            setLoading(true);
            const profiles = await getShortlistedProfiles(currentUser.id);
            setShortlistedUsers(profiles);
        } catch (error) {
            console.error("Failed to fetch shortlisted profiles:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchShortlisted();
    }, [fetchShortlisted]);
    
    const handleToggleShortlist = async (targetUserId: string) => {
        if (!currentUser) return;
        await toggleShortlist(currentUser.id, targetUserId);
        // Refetch to update the list after a profile is removed
        fetchShortlisted();
    };
    
    const handleReport = (user: User) => {
        setUserToReport(user);
    }

    const handleReportSubmit = (reason: string) => {
        if (userToReport) {
            console.log(`Reporting user ${userToReport.fullName} for reason: ${reason}`);
            alert(`Thank you for your feedback. Profile for ${userToReport.fullName} has been reported.`);
            setUserToReport(null);
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading your shortlist...</div>;
    }

    return (
        <>
            <Header />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Your Shortlisted Profiles</h1>
                     <Link to="/dashboard" className="text-sm font-medium text-primary hover:text-primary-focus">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                {shortlistedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {shortlistedUsers.map(user => (
                            <ProfileCard
                                key={user.id}
                                user={user}
                                onViewDetails={setSelectedUser}
                                isShortlisted={true} // Always true on this page
                                onShortlistToggle={handleToggleShortlist}
                                onReport={handleReport}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500 text-xl mb-4">You haven't shortlisted any profiles yet.</p>
                        <Link to="/dashboard" className="bg-primary text-white py-2 px-6 rounded-full hover:bg-primary-focus transition duration-300 font-semibold">
                            Start Browsing
                        </Link>
                    </div>
                )}
            </main>
            <ProfileModal 
                user={selectedUser} 
                onClose={() => setSelectedUser(null)}
                isShortlisted={true}
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

export default ShortlistedPage;
