
import React, { useState } from 'react';
import { User } from '../types';
import { XMarkIcon, FlagIcon } from '@heroicons/react/24/solid';

interface ReportModalProps {
  user: User | null;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const reportReasons = [
    'Married',
    'Spam profile',
    'Incorrect details',
    'Inappropriate photos or content',
    'Other',
]

const ReportModal: React.FC<ReportModalProps> = ({ user, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  if (!user) return null;

  const handleSubmit = () => {
      if (reason) {
          onSubmit(reason);
      } else {
          alert('Please select a reason for reporting.');
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
                 <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FlagIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                 </div>
                 <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Report {user.fullName}</h3>
                    <p className="text-sm text-gray-500">Please select a reason for your report.</p>
                 </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-6 space-y-4">
              <label htmlFor="reason" className="sr-only">Report Reason</label>
              <select 
                id="reason" 
                name="reason" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                  <option value="">-- Select a reason --</option>
                  {reportReasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border border-gray-300 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 border border-transparent rounded-md disabled:bg-red-300"
            onClick={handleSubmit}
            disabled={!reason}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;