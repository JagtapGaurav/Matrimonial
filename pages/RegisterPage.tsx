import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRegister } from '@/services/api';
import { HeartIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { User, Gender, EducationLevel } from '../types';
import { states, educationLevels } from '../data/locations';
import { calculateAge } from '../utils/helpers';


const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profilePhoto: null as File | null,
    fullName: '',
    mobile: '',
    email: '',
    dob: '',
    gender: 'Male' as Gender,
    education: 'Graduation' as EducationLevel,
    occupation: '',
    address: { fullAddress: '', city: '', state: '' },
    password: '',
    confirmPassword: '',
    isDivorced: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    if (formData.address.state) {
      const selectedState = states.find(s => s.name === formData.address.state);
      setCities(selectedState ? selectedState.cities : []);
      setFormData(prev => ({...prev, address: {...prev.address, city: ''}}));
    } else {
      setCities([]);
    }
  }, [formData.address.state]);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dob = e.target.value;
      setFormData(prev => ({ ...prev, dob }));
      try {
          const calculatedAge = calculateAge(dob);
          setAge(calculatedAge);
          if (calculatedAge < 18) {
              setError("You must be at least 18 years old to register.");
          } else {
              setError("");
          }
      } catch {
          setAge(null);
      }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('address.')) {
        const addressField = name.split('.')[1];
        setFormData(prev => ({ ...prev, address: { ...prev.address, [addressField]: value }}));
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
        setFormData(prev => ({...prev, profilePhoto: file}));
        setPhotoPreview(URL.createObjectURL(file));
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.profilePhoto) {
      setError("Profile photo is required.");
      return;
    }
    if (age !== null && age < 18) {
      setError("You must be at least 18 years old to register.");
      return;
    }

    try {
        const { confirmPassword, ...userData } = formData;
        const newUser: Omit<User, 'id' | 'profilePhotoUrl' | 'status'> = userData;

      await apiRegister(newUser, formData.profilePhoto);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login', { state: { message: 'Registration successful! Please log in.' } }), 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 p-10 bg-white shadow-xl rounded-2xl">
        <div>
          <HeartIcon className="mx-auto h-12 w-auto text-secondary" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
            {success && <p className="text-center text-green-500 bg-green-100 p-3 rounded-lg">{success}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="fullName" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Mobile</label><input type="tel" name="mobile" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Email Address</label><input type="email" name="email" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth (DD/MM/YYYY)</label>
                    <input type="text" name="dob" placeholder="DD/MM/YYYY" required onChange={handleDobChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
                    {age !== null && <span className="text-xs text-gray-500">Your age: {age}</span>}
                </div>
                <div><label className="block text-sm font-medium text-gray-700">Gender</label><select name="gender" onChange={handleChange} value={formData.gender} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700">Education</label><select name="education" onChange={handleChange} value={formData.education} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">{educationLevels.map(e => <option key={e}>{e}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700">Occupation</label><input type="text" name="occupation" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Full Address</label><input type="text" name="address.fullAddress" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                <div><label className="block text-sm font-medium text-gray-700">State</label><select name="address.state" required onChange={handleChange} value={formData.address.state} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"><option value="">Select State</option>{states.map(s => <option key={s.name}>{s.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700">City</label><select name="address.city" required onChange={handleChange} value={formData.address.city} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={!formData.address.state}><option value="">Select City</option>{cities.map(c => <option key={c}>{c}</option>)}</select></div>
                
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                    <div className="mt-1 flex items-center space-x-4">
                        {photoPreview ? (
                            <div className="relative">
                                <img src={photoPreview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover"/>
                                <label htmlFor="profilePhoto" className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-100">
                                    <ArrowPathIcon className="h-5 w-5 text-primary"/>
                                    <input type="file" id="profilePhoto" name="profilePhoto" onChange={handleFileChange} accept="image/*" className="sr-only"/>
                                </label>
                            </div>
                        ) : (
                             <input type="file" name="profilePhoto" required onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-focus"/>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 flex items-center">
                    <input type="checkbox" id="isDivorced" name="isDivorced" checked={formData.isDivorced} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
                    <label htmlFor="isDivorced" className="ml-2 block text-sm text-gray-900">Are you divorced?</label>
                </div>

                <div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" name="password" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Confirm Password</label><input type="password" name="confirmPassword" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
                 {formData.confirmPassword && <span className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>}
                </div>
            </div>
            <div><button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Register</button></div>
        </form>
        <div className="text-sm text-center">
            <p className="text-gray-600">Already have an account? <Link to="/login" className="font-medium text-primary hover:text-primary-focus">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;