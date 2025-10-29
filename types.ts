
export type UserStatus = 'Active' | 'Blocked' | 'Deactivated' | 'Deleted';
export type Gender = 'Male' | 'Female' | 'Other';
export type EducationLevel = 'Not Educated' | '10th' | '12th' | 'Graduation' | 'Post Graduation' | 'Engineer' | 'MBA' | 'PHD' | 'Doctor';


export interface User {
  id: string;
  profilePhotoUrl: string;
  fullName: string;
  mobile: string;
  email: string;
  dob: string; 
  gender: Gender;
  education: EducationLevel;
  occupation: string;
  address: {
    fullAddress: string;
    city: string;
    state: string;
  };
  password?: string;
  status: UserStatus;
  isAdmin?: boolean;
  isDivorced?: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  action: string;
}

export interface ReportData {
  name: string;
  users: number;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: string;
  timestamp: string;
}