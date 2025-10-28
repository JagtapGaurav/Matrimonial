
import React from 'react';
import { User } from '../types';
import { calculateAge } from '../utils/helpers';
import { MapPinIcon, AcademicCapIcon, BriefcaseIcon, StarIcon, FlagIcon, EyeIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface ProfileCardProps {
  user: User;
  onViewDetails: (user: User) => void;
  isShortlisted: boolean;
  onShortlistToggle: (userId: string) => void;
  onReport: (user: User) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onViewDetails, isShortlisted, onShortlistToggle, onReport }) => {
  const age = calculateAge(user.dob);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
      <div className="flex p-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 relative">
          <img className="w-full h-full object-cover rounded-lg" src={user.profilePhotoUrl} alt={user.fullName} />
          {user.isDivorced && (
              <div className="absolute top-1 -right-8 transform rotate-45 bg-red-800 text-white text-[10px] font-bold px-8 py-0.5">
                  Divorced
              </div>
          )}
        </div>
        <div className="pl-4 flex-grow">
          <h3 className="text-lg font-bold text-gray-800 truncate">{user.fullName}</h3>
          <p className="text-sm text-gray-500">{age} years</p>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
             <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                <span className="truncate">{user.address.city}, {user.address.state}</span>
            </div>
            <div className="flex items-center">
                <BriefcaseIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                <span className="truncate">{user.occupation}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-2 flex justify-between items-center border-t border-gray-100 mt-auto">
          <button onClick={() => onShortlistToggle(user.id)} className={`flex items-center space-x-1 transition-colors text-sm font-medium ${isShortlisted ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-600 hover:text-yellow-500'}`}>
              {isShortlisted ? <StarSolidIcon className="h-5 w-5"/> : <StarIcon className="h-5 w-5"/>}
              <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
          </button>
          <button onClick={() => onReport(user)} className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium">
              <FlagIcon className="h-5 w-5"/>
              <span>Report</span>
          </button>
      </div>
      <div className="p-2 bg-gray-50">
        <button
          onClick={() => onViewDetails(user)}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-focus transition duration-300 text-sm font-semibold flex items-center justify-center space-x-2"
        >
          <EyeIcon className="h-5 w-5" />
          <span>View Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;