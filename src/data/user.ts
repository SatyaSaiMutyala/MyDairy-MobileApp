// Who is signed in. In the UI round this is picked from a few demo accounts;
// with the APIs it comes from the login response.

export type Role = 'user' | 'admin' | 'ceo';

export type Profile = {
  name: string;
  initials: string;
  email: string;
  role: string; // designation shown to people
  sysRole: Role;
  roleLabel: string;
  deptKey: string;
  deptName: string;
  department: string;
  unit: string;
};

export const demoAccounts: Profile[] = [
  {
    name: 'Ravi Kumar',
    initials: 'RK',
    email: 'ravi.kumar@trustlab.in',
    role: 'Senior Lab Technologist',
    sysRole: 'user',
    roleLabel: 'User',
    deptKey: 'quality',
    deptName: 'Quality',
    department: 'Quality',
    unit: 'NRL · Begumpet, Hyderabad',
  },
  {
    name: 'Meera Nair',
    initials: 'MN',
    email: 'admin@trustlab.in',
    role: 'Operations Admin',
    sysRole: 'admin',
    roleLabel: 'Admin',
    deptKey: 'quality',
    deptName: 'All departments',
    department: 'Administration',
    unit: 'NRL · Begumpet, Hyderabad',
  },
  {
    name: 'Dr. Venkat Rao',
    initials: 'VR',
    email: 'cmd@trustlab.in',
    role: 'Chairman & Managing Director',
    sysRole: 'ceo',
    roleLabel: 'Super Admin',
    deptKey: 'quality',
    deptName: 'All departments',
    department: 'CMD Office',
    unit: 'NRL · Begumpet, Hyderabad',
  },
];

// The signed-in profile. Screens read it while they draw, so it is replaced
// before the signed-in screens appear.
export const currentUser: Profile = { ...demoAccounts[0] };

export const setCurrentUser = (profile: Profile) => {
  Object.assign(currentUser, profile);
};

export const accountFor = (email: string) =>
  demoAccounts.find(a => a.email === email.trim().toLowerCase());

export const seesAllDepartments = () => currentUser.sysRole !== 'user';
