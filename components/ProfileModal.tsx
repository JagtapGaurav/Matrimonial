
import React from 'react';
import { User } from '../types';
import { calculateAge } from '../utils/helpers';
import { XMarkIcon, MapPinIcon, AcademicCapIcon, BriefcaseIcon, CakeIcon, EnvelopeIcon, PhoneIcon, UserIcon, PhoneArrowUpRightIcon, StarIcon, FlagIcon } from '@heroicons/react/24/solid';

interface ProfileModalProps {
  user: User | null;
  onClose: () => void;
  isShortlisted: boolean;
  onShortlistToggle: (userId: string) => void;
  onReport: (user: User) => void;
  isMyProfile: boolean;
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.451 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.29 4.721 4.764-1.241z m7.571-7.28l-2.09-1.023-.333.202c-.322.195-.515.311-.643.439-.128.128-.242.257-.34.346s-.176.165-.24.165c-.063 0-.153-.02-.216-.041s-.528-.196-1.002-.62a6.435 6.435 0 01-1.38-1.53c-.121-.21-.203-.36-.203-.495s.013-.23.083-.331c.07-.102.158-.203.256-.307.099-.104.163-.18.228-.288.064-.109.113-.208.163-.339s.083-.257.058-.384c-.025-.128-.333-.795-.46-.995s-.242-.176-.356-.176c-.114 0-.242.013-.356.013s-.299.041-.448.202c-.15.162-.529.512-.529 1.243s.529 1.449.601 1.551c.072.102 1.023 1.564 2.51 2.203.362.152.64.242.845.331.206.089.397.136.53.136.206 0 .495-.083.659-.331.164-.249.689-1.01.838-1.244.149-.234.298-.202.431-.202.108 0 .242.013.34.02.102.007.249.013.298.257.05.242.05.405-.025.617z"/>
  </svg>
);


const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, isShortlisted, onShortlistToggle, onReport, isMyProfile }) => {
  if (!user) return null;

  const age = calculateAge(user.dob);

  const detailItems = [
    { icon: <UserIcon className="h-5 w-5 text-primary" />, label: 'Gender', value: user.gender },
    { icon: <CakeIcon className="h-5 w-5 text-primary" />, label: 'Age / D.O.B', value: `${age} years (${user.dob})` },
    { 
        icon: <PhoneIcon className="h-5 w-5 text-primary" />, 
        label: 'Mobile', 
        value: (
            <div className="flex items-center space-x-4">
                <span className="text-md text-gray-800">{user.mobile}</span>
                <a href={`tel:${user.mobile}`} title="Call" className="text-gray-500 hover:text-primary transition-colors">
                    <PhoneArrowUpRightIcon className="h-5 w-5" />
                </a>
                <a href={`https://wa.me/${user.mobile.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="text-gray-500 hover:text-green-600 transition-colors">
                    <WhatsAppIcon />
                </a>
            </div>
        )
    },
    { icon: <EnvelopeIcon className="h-5 w-5 text-primary" />, label: 'Email', value: user.email },
    { icon: <AcademicCapIcon className="h-5 w-5 text-primary" />, label: 'Education', value: user.education },
    { icon: <BriefcaseIcon className="h-5 w-5 text-primary" />, label: 'Occupation', value: user.occupation },
    { icon: <MapPinIcon className="h-5 w-5 text-primary" />, label: 'Address', value: `${user.address.fullAddress}, ${user.address.city}, ${user.address.state}` },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10 bg-white/50 rounded-full p-1">
          <XMarkIcon className="h-8 w-8" />
        </button>
        
        <div className="grid md:grid-cols-3">
            <div className="md:col-span-2 p-6 md:p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.fullName}</h2>
                <p className="text-lg text-gray-500 mb-6">{user.occupation} from {user.address.city}</p>
                
                <div className="space-y-4">
                    {detailItems.map((item, index) => (
                        <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 pt-1">{item.icon}</div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                                 {typeof item.value === 'string' ? <p className="text-md text-gray-800">{item.value}</p> : item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             <div className="md:col-span-1 p-6 flex flex-col items-center justify-start bg-gray-50 rounded-r-xl">
                 <img src={user.profilePhotoUrl} alt={user.fullName} className="w-48 h-48 object-cover rounded-full shadow-lg mb-6" />
                 {!isMyProfile && (
                    <div className="w-full space-y-3">
                         <button onClick={() => onShortlistToggle(user.id)} className={`w-full flex items-center justify-center space-x-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${isShortlisted ? 'bg-yellow-400 border-yellow-400 text-white hover:bg-yellow-500' : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                             <StarIcon className="h-5 w-5"/>
                             <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                         </button>
                         <button onClick={() => onReport(user)} className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">
                            <FlagIcon className="h-5 w-5"/>
                            <span>Report Profile</span>
                         </button>
                    </div>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;