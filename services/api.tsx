
import { User, UserStatus, ReportData, ActivityLog } from '../types';

// --- Helper Functions ---
const USERS_KEY = 'matrimonial_users';
const LOGS_KEY = 'matrimonial_logs';
const SESSION_KEY = 'matrimonial_session';
const SHORTLIST_KEY_PREFIX = 'matrimonial_shortlist_';


const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const logActivity = (action: string, userName: string) => {
    const logs: ActivityLog[] = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    const sessionUser = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    const newLog: ActivityLog = {
        id: new Date().toISOString() + Math.random(),
        userId: sessionUser.userId || 'N/A',
        userName,
        timestamp: new Date().toISOString(),
        action,
    };
    logs.unshift(newLog); // Add to the beginning
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 100))); // Keep last 100 logs
};

// --- Initial Data Setup ---
const initialDataSetup = () => {
    if (!localStorage.getItem(USERS_KEY)) {
        const dummyUsers: User[] = [
            {
                id: 'admin-1',
                profilePhotoUrl: 'https://i.pravatar.cc/150?u=admin@example.com',
                fullName: 'Admin User',
                mobile: '1234567890',
                email: 'admin@example.com',
                dob: '01/01/1990',
                gender: 'Male',
                education: 'PHD',
                occupation: 'System Administrator',
                address: { fullAddress: '123 Admin Way', city: 'Mumbai', state: 'Maharashtra' },
                password: 'admin',
                status: 'Active',
                isAdmin: true,
                isDivorced: false,
            },
            {
                id: 'user-1',
                profilePhotoUrl: 'https://i.pravatar.cc/150?u=jane.doe@example.com',
                fullName: 'Jane Doe',
                mobile: '9876543210',
                email: 'jane.doe@example.com',
                dob: '15/05/1992',
                gender: 'Female',
                education: 'Post Graduation',
                occupation: 'Graphic Designer',
                address: { fullAddress: '456 Creative Ave', city: 'Pune', state: 'Maharashtra' },
                password: 'password123',
                status: 'Active',
                isDivorced: true,
            },
             {
                id: 'user-2',
                profilePhotoUrl: 'https://i.pravatar.cc/150?u=john.smith@example.com',
                fullName: 'John Smith',
                mobile: '5551234567',
                email: 'john.smith@example.com',
                dob: '22/08/1988',
                gender: 'Male',
                education: 'Engineer',
                occupation: 'Software Engineer',
                address: { fullAddress: '789 Code St', city: 'Bengaluru', state: 'Karnataka' },
                password: 'password123',
                status: 'Active',
                isDivorced: false,
            },
            {
                id: 'user-3',
                profilePhotoUrl: 'https://i.pravatar.cc/150?u=emily.jones@example.com',
                fullName: 'Emily Jones',
                mobile: '5559876543',
                email: 'emily.jones@example.com',
                dob: '10/11/1995',
                gender: 'Female',
                education: 'MBA',
                occupation: 'Marketing Manager',
                address: { fullAddress: '101 Market Blvd', city: 'Delhi', state: 'Delhi' },
                password: 'password123',
                status: 'Active',
                isDivorced: false,
            },
            {
                id: 'user-4',
                profilePhotoUrl: 'https://i.pravatar.cc/150?u=michael.brown@example.com',
                fullName: 'Michael Brown',
                mobile: '5555551234',
                email: 'michael.brown@example.com',
                dob: '03/03/1985',
                gender: 'Male',
                education: 'Doctor',
                occupation: 'Physician',
                address: { fullAddress: '21 Health Rd', city: 'Chennai', state: 'Tamil Nadu' },
                password: 'password123',
                status: 'Blocked',
                isDivorced: true,
            },
            {
                id: 'user-5',
                profilePhotoUrl: 'https://i.pravatar.cc/150?u=sarah.davis@example.com',
                fullName: 'Sarah Davis',
                mobile: '5555555678',
                email: 'sarah.davis@example.com',
                dob: '28/02/1993',
                gender: 'Female',
                education: 'Graduation',
                occupation: 'Data Scientist',
                address: { fullAddress: '33 Algorithm Aly', city: 'Hyderabad', state: 'Telangana' },
                password: 'password123',
                status: 'Active',
                isDivorced: false,
            },
            {
                id: 'user-6',
                profilePhotoUrl: 'https://i.pravatar.cc/150?u=priya.sharma@example.com',
                fullName: 'Priya Sharma',
                mobile: '5551112233',
                email: 'priya.sharma@example.com',
                dob: '12/07/1994',
                gender: 'Female',
                education: 'Engineer',
                occupation: 'AI Specialist',
                address: { fullAddress: '55 Tech Park', city: 'Pune', state: 'Maharashtra' },
                password: 'password123',
                status: 'Active',
                isDivorced: true,
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(dummyUsers));
    }
};

initialDataSetup();

// --- API Functions ---

export const apiLogin = (email: string, pass: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
            const user = users.find(u => u.email === email && u.password === pass);
            if (user) {
                if(user.status !== 'Active') {
                    return reject(new Error(`Your account is currently ${user.status}. Please contact an administrator.`))
                }
                sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
                logActivity('User logged in', user.fullName);
                resolve(user);
            } else {
                reject(new Error('Invalid email or password.'));
            }
        }, 500);
    });
};

export const getLoggedInUser = (): Promise<User> => {
    return new Promise((resolve, reject) => {
         const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
         if (!session || !session.userId) {
             return reject(new Error("No user logged in"));
         }
         const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
         const user = users.find(u => u.id === session.userId);
         if (user) {
             resolve(user);
         } else {
            sessionStorage.removeItem(SESSION_KEY);
            reject(new Error("Logged in user not found"));
         }
    });
};

export const apiLogout = () => {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (session && session.userId) {
        const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const user = users.find(u => u.id === session.userId);
        if (user) {
            logActivity('User logged out', user.fullName);
        }
    }
    sessionStorage.removeItem(SESSION_KEY);
};

export const apiRegister = async (newUser: Omit<User, 'id' | 'status' | 'profilePhotoUrl'>, profilePhoto: File): Promise<User> => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.some(u => u.email === newUser.email)) {
        throw new Error('An account with this email already exists.');
    }
    
    const photoUrl = await fileToBase64(profilePhoto);
    
    const userToSave: User = {
        ...newUser,
        id: `user-${new Date().getTime()}`,
        status: 'Active',
        profilePhotoUrl: photoUrl
    };

    users.push(userToSave);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    logActivity('New user registered', userToSave.fullName);
    return userToSave;
};

export const updateUserProfile = async (userId: string, data: Partial<Omit<User, 'id' | 'fullName' | 'dob' | 'email'>>, newProfilePhoto?: File): Promise<User> => {
    let users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("User not found");
    }

    let updatedUser = { ...users[userIndex], ...data };

    if (newProfilePhoto) {
        const photoUrl = await fileToBase64(newProfilePhoto);
        updatedUser.profilePhotoUrl = photoUrl;
    }
    
    users[userIndex] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    logActivity(`Profile updated for ${updatedUser.fullName}`, updatedUser.fullName);
    return updatedUser;
}

export const getUsers = (): Promise<User[]> => {
    return new Promise((resolve) => {
        const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        // Regular users only see other active, non-admin users
        resolve(users.filter(u => !u.isAdmin && u.status === 'Active'));
    });
};

export const getAllUsers = (): Promise<User[]> => {
     return new Promise((resolve) => {
        const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        resolve(users);
    });
};

export const updateUserStatus = (userId: string, status: UserStatus): Promise<void> => {
    return new Promise((resolve, reject) => {
        let users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return reject(new Error("User not found"));
        }
        users[userIndex].status = status;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        logActivity(`Updated ${users[userIndex].fullName}'s status to ${status}`, 'Admin/System');
        resolve();
    });
};

export const deleteUser = (userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        let users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) {
             return reject(new Error("User not found"));
        }
        const updatedUsers = users.filter(u => u.id !== userId);
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        logActivity(`Deleted user ${userToDelete.fullName}`, 'Admin');
        resolve();
    });
};

export const getUsageReportByCity = (): Promise<ReportData[]> => {
    return new Promise((resolve) => {
        const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const cityCounts = users.reduce((acc, user) => {
            const city = user.address.city;
            if(!user.isAdmin) {
                acc[city] = (acc[city] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const report: ReportData[] = Object.entries(cityCounts).map(([name, userCount]) => ({
            name,
            users: userCount,
        }));
        resolve(report);
    });
};

export const getActivityLog = (): Promise<ActivityLog[]> => {
    return new Promise((resolve) => {
        const logs: ActivityLog[] = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
        resolve(logs);
    });
};

// --- Shortlist Functions ---
export const toggleShortlist = (currentUserId: string, targetUserId: string): Promise<string[]> => {
    return new Promise((resolve) => {
        const key = `${SHORTLIST_KEY_PREFIX}${currentUserId}`;
        let shortlist: string[] = JSON.parse(localStorage.getItem(key) || '[]');
        
        if (shortlist.includes(targetUserId)) {
            shortlist = shortlist.filter(id => id !== targetUserId);
        } else {
            shortlist.push(targetUserId);
        }
        
        localStorage.setItem(key, JSON.stringify(shortlist));
        resolve(shortlist);
    });
};

export const getShortlistedIds = (currentUserId: string): Promise<string[]> => {
     return new Promise((resolve) => {
        const key = `${SHORTLIST_KEY_PREFIX}${currentUserId}`;
        const shortlist: string[] = JSON.parse(localStorage.getItem(key) || '[]');
        resolve(shortlist);
    });
}

export const getShortlistedProfiles = async (currentUserId: string): Promise<User[]> => {
    const shortlistedIds = await getShortlistedIds(currentUserId);
    const allUsers: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return allUsers.filter(user => shortlistedIds.includes(user.id));
};
