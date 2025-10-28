
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { HeartIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, UserCircleIcon, StarIcon } from '@heroicons/react/24/solid';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
    onViewMyProfile?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onViewMyProfile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <HeartIcon className="h-8 w-8 text-secondary" />
            <span className="ml-2 text-2xl font-bold text-gray-800">Matrimonial App</span>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-gray-600">Welcome, <span className="font-semibold">{user.fullName}</span></span>
              {!user.isAdmin && (
                <>
                  {isDashboard && onViewMyProfile && (
                     <button onClick={onViewMyProfile} className="text-gray-600 hover:text-primary" title="My Profile">
                        <UserCircleIcon className="h-6 w-6"/>
                     </button>
                  )}
                  <Link to="/shortlisted" className="text-gray-600 hover:text-primary" title="Shortlisted Profiles">
                    <StarIcon className="h-6 w-6"/>
                  </Link>
                  <Link to="/settings" className="text-gray-600 hover:text-primary" title="Settings">
                    <Cog6ToothIcon className="h-6 w-6"/>
                  </Link>
                </>
              )}
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-150 ease-in-out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;