export interface DepartmentCounter {
  id: string;
  name: string;
  fullName: string;
  value: number;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export const DEPARTMENTS = [
  { id: 'EE', name: 'EE', fullName: 'Electrical Engineering' },
  { id: 'CIS', name: 'CIS', fullName: 'Computer & Information Sciences' },
  { id: 'ME', name: 'ME', fullName: 'Mechanical Engineering' },
  { id: 'MME', name: 'MME', fullName: 'Materials & Metallurgical Engineering' },
  { id: 'CHE', name: 'CHE', fullName: 'Chemical Engineering' },
  { id: 'DPAM', name: 'DPAM', fullName: 'Department of Physics & Applied Math' },
] as const;
