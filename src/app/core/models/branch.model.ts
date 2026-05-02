export interface Branch {
  id?: number;
  name: string;
  location: string;
  staffCount?: number;
  studentCount?: number;
  revenue?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  managerId?: number;
  manager?: {
    id: number;
    name: string;
    email: string;
  };
  userCounts?: {
    totalStaffs: number;
    totalStudents: number;
  };
}
