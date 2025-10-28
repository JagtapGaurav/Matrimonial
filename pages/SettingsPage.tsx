
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import { User, Gender, EducationLevel } from '../types';
import { states, educationLevels } from '../data/locations';
import { updateUserProfile, updateUserStatus } from '../services/api';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

const SettingsPage: React.FC = () => {
    const { user, refreshUser, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Partial<User>>({});
    const [newProfilePhoto, setNewProfilePhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [cities, setCities] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deactivationReason, setDeactivationReason] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                ...user
            });
            setPhotoPreview(user.profilePhotoUrl);
        }
    }, [user]);

    useEffect(() => {
        if (formData.address?.state) {
            const selectedState = states.find(s => s.name === formData.address?.state);
            setCities(selectedState ? selectedState.cities : []);
        }
    }, [formData.address?.state]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({ ...prev, address: { ...prev.address!, [addressField]: value } }));
        } else if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setNewProfilePhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
      }
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!user) return;
        
        try {
            const { fullName, dob, email, id, status, profilePhotoUrl, isAdmin, password, ...updatableData } = formData;
            await updateUserProfile(user.id, updatableData, newProfilePhoto || undefined);
            await refreshUser();
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        // FIX: Correctly handle error object in the catch block.
        } catch (err: any) {
            setError(err.message || 'Failed to update profile.');
        }
    };

    const handleDeactivation = async () => {
        if (!deactivationReason) {
            alert('Please select a reason for deactivation.');
            return;
        }
        if (user && window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
            try {
                await updateUserStatus(user.id, 'Deactivated');
                alert('Account deactivated successfully.');
                logout();
                navigate('/login');
            // FIX: Corrected the catch block to properly handle errors and resolve cascading scope issues.
            } catch (err) {
                alert('Failed to deactivate account. Please try again.');
            }
        }
    };

    if (!user || !formData.address) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Header />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                        <Link to="/dashboard" className="text-sm font-medium text-primary hover:text-primary-focus">
                            &larr; Back to Dashboard
                        </Link>
                    </div>
                    
                    {/* Edit Profile Section */}
                    <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                         <h2 className="text-2xl font-bold mb-6 text-gray-700">Edit Profile</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                                <div className="mt-1 flex items-center space-x-4">
                                    {photoPreview && (
                                        <div className="relative">
                                            <img src={photoPreview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover"/>
                                            <label htmlFor="profilePhoto" className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-100">
                                                <ArrowPathIcon className="h-5 w-5 text-primary"/>
                                                <input type="file" id="profilePhoto" name="profilePhoto" onChange={handleFileChange} accept="image/*" className="sr-only"/>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                <div><label className="block text-sm font-medium text-gray-700">Full Name (cannot be changed)</label><input type="text" value={formData.fullName} disabled className="mt-1 bg-gray-100 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"/></div>
                                <div><label className="block text-sm font-medium text-gray-700">Date of Birth (cannot be changed)</label><input type="text" value={formData.dob} disabled className="mt-1 bg-gray-100 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"/></div>
                                
                                <div><label className="block text-sm font-medium text-gray-700">Mobile</label><input type="tel" name="mobile" value={formData.mobile} required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                                <div><label className="block text-sm font-medium text-gray-700">Gender</label><select name="gender" onChange={handleChange} value={formData.gender} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"><option>Male</option><option>Female</option><option>Other</option></select></div>
                                <div><label className="block text-sm font-medium text-gray-700">Education</label><select name="education" onChange={handleChange} value={formData.education} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">{educationLevels.map(e => <option key={e}>{e}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700">Occupation</label><input type="text" name="occupation" value={formData.occupation} required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Full Address</label><input type="text" name="address.fullAddress" value={formData.address.fullAddress} required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                                <div><label className="block text-sm font-medium text-gray-700">State</label><select name="address.state" required onChange={handleChange} value={formData.address.state} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"><option value="">Select State</option>{states.map(s => <option key={s.name}>{s.name}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700">City</label><select name="address.city" required onChange={handleChange} value={formData.address.city} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={!formData.address.state}><option value="">Select City</option>{cities.map(c => <option key={c}>{c}</option>)}</select></div>
                                
                                <div className="md:col-span-2 flex items-center">
                                    <input type="checkbox" id="isDivorced" name="isDivorced" checked={formData.isDivorced} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
                                    <label htmlFor="isDivorced" className="ml-2 block text-sm text-gray-900">Are you divorced?</label>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
                                {success && <p className="text-center text-green-500 bg-green-100 p-3 rounded-lg">{success}</p>}
                                <div className="text-right">
                                    <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Save Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Deactivate Account Section */}
                    <div className="bg-white p-8 rounded-lg shadow-md">
                         <h2 className="text-2xl font-bold mb-4 text-red-700">Deactivate Account</h2>
                         <p className="text-gray-600 mb-4">If you deactivate your account, your profile will no longer be visible to other users. You can contact an administrator to reactivate it in the future.</p>
                         <div className="flex flex-col sm:flex-row items-center gap-4">
                             <select value={deactivationReason} onChange={e => setDeactivationReason(e.target.value)} className="block w-full sm:w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                <option value="">Select a reason</option>
                                <option value="Married">Married</option>
                                <option value="Partner Not Found">Partner Not Found</option>
                                <option value="cancelled my wedding plan">Cancelled my wedding plan</option>
                                <option value="other">Other</option>
                             </select>
                            <button onClick={handleDeactivation} className="w-full sm:w-auto bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 disabled:bg-red-300" disabled={!deactivationReason}>
                                Deactivate My Account
                            </button>
                         </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default SettingsPage;
