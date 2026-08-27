import { FieldValue, Timestamp } from 'firebase/firestore';

export interface DepartmentCounter {
  id: string;
  name: string;
  fullName: string;
  value: number;
  updatedAt?: Timestamp | FieldValue;
  updatedBy?: string;
}

export interface DepartmentMeta {
  id: string;
  name: string;
  fullName: string;
}

export const ALL_DEPARTMENTS: readonly DepartmentMeta[] = [
  { id: 'EE', name: 'EE', fullName: 'Electrical Engineering' },
  { id: 'CIS', name: 'CIS', fullName: 'Computer & Information Systems' },
  { id: 'ME', name: 'ME', fullName: 'Mechanical Engineering' },
  { id: 'MME', name: 'MME', fullName: 'Materials & Metallurgical Engineering' },
  { id: 'CHE', name: 'CHE', fullName: 'Chemical Engineering' },
  { id: 'DPAM', name: 'DPAM', fullName: 'Department of Physics & Applied Math' },
] as const;
