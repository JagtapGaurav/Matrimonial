import React, { useState, useEffect } from 'react';
import { User, Gender, EducationLevel, UserStatus } from '../types';
import { states, educationLevels } from '../data/locations';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface AdminUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (userData: Omit<User, 'id'> | Partial<User>, photo?: File) => void;
    userToEdit?: User | null;
}

const AdminUserModal: React.FC<AdminUserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const isEditMode = !!userToEdit;
    
    const getInitialFormData = () => ({
        profilePhoto: null as File | null,
        profilePhotoUrl: userToEdit?.profilePhotoUrl || '',
        fullName: userToEdit?.fullName || '',
        mobile: userToEdit?.mobile || '',
        email: userToEdit?.email || '',
        dob: userToEdit?.dob || '',
        gender: userToEdit?.gender || 'Male' as Gender,
        education: userToEdit?.education || 'Graduation' as EducationLevel,
        occupation: userToEdit?.occupation || '',
        address: {
            fullAddress: userToEdit?.address?.fullAddress || '',
            city: userToEdit?.address?.city || '',
            state: userToEdit?.address?.state || '',
        },
        password: '',
        isDivorced: userToEdit?.isDivorced || false,
        status: userToEdit?.status || 'Active' as UserStatus,
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [photoPreview, setPhotoPreview] = useState<string | null>(userToEdit?.profilePhotoUrl || null);
    const [cities, setCities] = useState<string[]>([]);
    
    useEffect(() => {
        if (isOpen) {
            const initialData = getInitialFormData();
            setFormData(initialData);
            setPhotoPreview(userToEdit?.profilePhotoUrl || null);
             if (initialData.address.state) {
                const selectedState = states.find(s => s.name === initialData.address.state);
                setCities(selectedState ? selectedState.cities : []);
            } else {
                setCities([]);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userToEdit, isOpen]);
    
    useEffect(() => {
        if (formData.address.state) {
            const selectedState = states.find(s => s.name === formData.address.state);
            setCities(selectedState ? selectedState.cities : []);
             if (!selectedState?.cities.includes(formData.address.city)) {
                setFormData(prev => ({...prev, address: {...prev.address, city: ''}}));
            }
        } else {
            setCities([]);
        }
    }, [formData.address.state]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({ ...prev, address: { ...prev.address, [addressField]: value }}));
        } else if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({...prev, profilePhoto: file}));
            setPhotoPreview(URL.createObjectURL(file));
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { profilePhoto, profilePhotoUrl, ...userData } = formData;
        
        if (isEditMode && userToEdit) {
            const updatePayload: Partial<User> = { ...userData };
            if (!updatePayload.password) {
                delete updatePayload.password;
            }
            onSave(updatePayload, profilePhoto || undefined);
        } else {
            if (!profilePhoto) {
                alert("Profile photo is required for new users.");
                return;
            }
            if (!userData.password) {
                alert("Password is required for new users.");
                return;
            }
            const newUserPayload: Omit<User, 'id' | 'profilePhotoUrl'> = {
                ...userData,
                status: formData.status,
            };
            onSave(newUserPayload, profilePhoto);
        }
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold">{isEditMode ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-800"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="fullName" value={formData.fullName} required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                        <div><label className="block text-sm font-medium text-gray-700">Mobile</label><input type="tel" name="mobile" value={formData.mobile} required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                        <div><label className="block text-sm font-medium text-gray-700">Email Address</label><input type="email" name="email" value={formData.email} required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                        <div><label className="block text-sm font-medium text-gray-700">Date of Birth (DD/MM/YYYY)</label><input type="text" name="dob" placeholder="DD/MM/YYYY" value={formData.dob} required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                        <div><label className="block text-sm font-medium text-gray-700">Gender</label><select name="gender" onChange={handleChange} value={formData.gender} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"><option>Male</option><option>Female</option><option>Other</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700">Education</label><select name="education" onChange={handleChange} value={formData.education} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">{educationLevels.map(e => <option key={e}>{e}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700">Occupation</label><input type="text" name="occupation" value={formData.occupation} required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Full Address</label><input type="text" name="address.fullAddress" value={formData.address.fullAddress} required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                        <div><label className="block text-sm font-medium text-gray-700">State</label><select name="address.state" required onChange={handleChange} value={formData.address.state} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"><option value="">Select State</option>{states.map(s => <option key={s.name}>{s.name}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700">City</label><select name="address.city" required onChange={handleChange} value={formData.address.city} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={!formData.address.state}><option value="">Select City</option>{cities.map(c => <option key={c}>{c}</option>)}</select></div>
                        
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                            <div className="mt-1 flex items-center space-x-4">
                                {photoPreview ? (
                                    <div className="relative">
                                        <img src={photoPreview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover"/>
                                        <label htmlFor="adminProfilePhoto" className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-100">
                                            <ArrowPathIcon className="h-5 w-5 text-primary"/>
                                            <input type="file" id="adminProfilePhoto" name="profilePhoto" onChange={handleFileChange} accept="image/*" className="sr-only"/>
                                        </label>
                                    </div>
                                ) : (
                                     <input type="file" name="profilePhoto" required={!isEditMode} onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-focus"/>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2 flex items-center">
                            <input type="checkbox" id="adminIsDivorced" name="isDivorced" checked={formData.isDivorced} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
                            <label htmlFor="adminIsDivorced" className="ml-2 block text-sm text-gray-900">Is divorced?</label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" onChange={handleChange} value={formData.status} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                <option>Active</option>
                                <option>Blocked</option>
                                <option>Deactivated</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" required={!isEditMode} onChange={handleChange} placeholder={isEditMode ? 'Leave blank to keep unchanged' : ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-2 -m-6 mt-6 sticky bottom-0 z-10">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm">Cancel</button>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminUserModal;