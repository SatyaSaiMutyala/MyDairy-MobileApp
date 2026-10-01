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


export const seesAllDepartments = () => currentUser.sysRole !== 'user';

// Turns the API's user into the profile shape the screens still read.
export const profileFrom = (u: {
  name: string;
  initials: string;
  email: string;
  designation: string | null;
  dept: string;
  dept_name: string;
  role: 'user' | 'admin' | 'super_admin';
  role_label: string;
  location: string | null;
}): Profile => ({
  name: u.name,
  initials: u.initials,
  email: u.email,
  role: u.designation ?? u.role_label,
  sysRole: u.role === 'super_admin' ? 'ceo' : u.role,
  roleLabel: u.role_label,
  deptKey: u.dept,
  deptName: u.dept_name,
  department: u.dept_name,
  unit: u.location && u.location !== 'ALL' ? `TrustLab · ${u.location}` : 'TrustLab · All locations',
});
