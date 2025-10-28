
import React, { useState } from 'react';
import { User } from '../types';
import { calculateAge } from '../utils/helpers';
import { XMarkIcon, MapPinIcon, AcademicCapIcon, BriefcaseIcon, CakeIcon, EnvelopeIcon, PhoneIcon as PhoneOutline, UserIcon, StarIcon, FlagIcon, PhoneIcon } from '@heroicons/react/24/solid';

interface ProfileModalProps {
  user: User | null;
  onClose: () => void;
  isShortlisted: boolean;
  onShortlistToggle: (userId: string) => void;
  onReport: (user: User) => void;
  isMyProfile: boolean;
}

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
    </svg>
);


const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, isShortlisted, onShortlistToggle, onReport, isMyProfile }) => {
  const [isImageOpen, setIsImageOpen] = useState(false);
    
  if (!user) return null;

  const age = calculateAge(user.dob);

  const detailItems = [
    { icon: <UserIcon className="h-5 w-5 text-primary" />, label: 'Gender', value: user.gender },
    { icon: <CakeIcon className="h-5 w-5 text-primary" />, label: 'Age / D.O.B', value: `${age} years (${user.dob})` },
    { 
        icon: <PhoneOutline className="h-5 w-5 text-primary" />, 
        label: 'Mobile', 
        value: (
           <div>
            <p className="text-md text-gray-800">{user.mobile}</p>
            <div className="flex items-center space-x-4 mt-2">
                 <a href={`tel:${user.mobile}`} title="Call" className="flex items-center space-x-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                    <PhoneIcon className="h-5 w-5" />
                    <span>Call</span>
                </a>
                <a href={`https://wa.me/${user.mobile.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="flex items-center space-x-1.5 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
                    <WhatsAppIcon />
                    <span>WhatsApp</span>
                </a>
            </div>
           </div>
        )
    },
    { icon: <EnvelopeIcon className="h-5 w-5 text-primary" />, label: 'Email', value: user.email },
    { icon: <AcademicCapIcon className="h-5 w-5 text-primary" />, label: 'Education', value: user.education },
    { icon: <BriefcaseIcon className="h-5 w-5 text-primary" />, label: 'Occupation', value: user.occupation },
    { icon: <MapPinIcon className="h-5 w-5 text-primary" />, label: 'Address', value: `${user.address.fullAddress}, ${user.address.city}, ${user.address.state}` },
  ];

  return (
    <>
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
                 <img 
                    src={user.profilePhotoUrl} 
                    alt={user.fullName} 
                    className="w-48 h-48 object-cover rounded-lg shadow-lg mb-6 cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={() => setIsImageOpen(true)}
                 />
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
    
    {isImageOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-[60]" onClick={() => setIsImageOpen(false)}>
            <img src={user.profilePhotoUrl} alt={user.fullName} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"/>
            <button onClick={() => setIsImageOpen(false)} className="absolute top-5 right-5 text-white bg-black/50 rounded-full p-2">
                <XMarkIcon className="h-8 w-8" />
            </button>
        </div>
    )}
    </>
  );
};

export default ProfileModal;