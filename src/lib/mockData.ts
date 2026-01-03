export type UserRole = 'faculty' | 'hod' | 'registrar';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export interface Lecture {
  id: string;
  subject: string;
  time: string;
  room: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  semester: string;
}

export interface LectureReport {
  id: string;
  facultyId: string;
  facultyName: string;
  subject: string;
  date: string;
  topic: string;
  duration: number;
  status: 'completed' | 'cancelled' | 'rescheduled';
  remarks: string;
  department: string;
  submittedAt: string;
}

export const mockUsers: Record<string, User> = {
  faculty: {
    id: '1',
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@college.edu',
    role: 'faculty',
    department: 'Computer Science',
  },
  hod: {
    id: '2',
    name: 'Prof. James Wilson',
    email: 'james.wilson@college.edu',
    role: 'hod',
    department: 'Computer Science',
  },
  registrar: {
    id: '3',
    name: 'Dr. Emily Carter',
    email: 'emily.carter@college.edu',
    role: 'registrar',
    department: 'Administration',
  },
};

export const todayLectures: Lecture[] = [
  {
    id: '1',
    subject: 'Data Structures',
    time: '09:00 AM - 10:00 AM',
    room: 'Room 201',
    status: 'completed',
    semester: 'Semester 3',
  },
  {
    id: '2',
    subject: 'Algorithm Design',
    time: '11:00 AM - 12:00 PM',
    room: 'Room 305',
    status: 'scheduled',
    semester: 'Semester 5',
  },
  {
    id: '3',
    subject: 'Database Systems',
    time: '02:00 PM - 03:00 PM',
    room: 'Lab 102',
    status: 'scheduled',
    semester: 'Semester 4',
  },
  {
    id: '4',
    subject: 'Computer Networks',
    time: '04:00 PM - 05:00 PM',
    room: 'Room 401',
    status: 'cancelled',
    semester: 'Semester 6',
  },
];

export const lectureReports: LectureReport[] = [
  {
    id: '1',
    facultyId: '1',
    facultyName: 'Dr. Sarah Mitchell',
    subject: 'Data Structures',
    date: '2024-01-15',
    topic: 'Binary Trees and Traversal',
    duration: 60,
    status: 'completed',
    remarks: 'Students showed good understanding of tree concepts',
    department: 'Computer Science',
    submittedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    facultyId: '4',
    facultyName: 'Dr. Michael Chen',
    subject: 'Machine Learning',
    date: '2024-01-15',
    topic: 'Neural Networks Introduction',
    duration: 90,
    status: 'completed',
    remarks: 'Lab session included hands-on TensorFlow practice',
    department: 'Computer Science',
    submittedAt: '2024-01-15T14:00:00Z',
  },
  {
    id: '3',
    facultyId: '5',
    facultyName: 'Prof. Lisa Anderson',
    subject: 'Digital Electronics',
    date: '2024-01-14',
    topic: 'Flip-Flops and Registers',
    duration: 60,
    status: 'completed',
    remarks: 'Practical demonstration with circuit boards',
    department: 'Electronics',
    submittedAt: '2024-01-14T11:00:00Z',
  },
  {
    id: '4',
    facultyId: '6',
    facultyName: 'Dr. Robert Taylor',
    subject: 'Thermodynamics',
    date: '2024-01-14',
    topic: 'Second Law of Thermodynamics',
    duration: 60,
    status: 'cancelled',
    remarks: 'Faculty on medical leave',
    department: 'Mechanical',
    submittedAt: '2024-01-14T09:00:00Z',
  },
  {
    id: '5',
    facultyId: '7',
    facultyName: 'Dr. Amanda White',
    subject: 'Operating Systems',
    date: '2024-01-13',
    topic: 'Process Scheduling Algorithms',
    duration: 75,
    status: 'completed',
    remarks: 'Covered Round Robin and Priority Scheduling',
    department: 'Computer Science',
    submittedAt: '2024-01-13T16:00:00Z',
  },
  {
    id: '6',
    facultyId: '8',
    facultyName: 'Prof. David Brown',
    subject: 'Control Systems',
    date: '2024-01-13',
    topic: 'PID Controllers',
    duration: 60,
    status: 'rescheduled',
    remarks: 'Moved to next week due to equipment maintenance',
    department: 'Electronics',
    submittedAt: '2024-01-13T10:30:00Z',
  },
];

export const departmentStats = [
  { department: 'Computer Science', totalLectures: 45, completed: 40, cancelled: 3, rescheduled: 2 },
  { department: 'Electronics', totalLectures: 38, completed: 35, cancelled: 2, rescheduled: 1 },
  { department: 'Mechanical', totalLectures: 32, completed: 28, cancelled: 3, rescheduled: 1 },
  { department: 'Civil', totalLectures: 28, completed: 25, cancelled: 2, rescheduled: 1 },
];

export const subjects = [
  'Data Structures',
  'Algorithm Design',
  'Database Systems',
  'Computer Networks',
  'Operating Systems',
  'Machine Learning',
  'Digital Electronics',
  'Control Systems',
  'Thermodynamics',
  'Fluid Mechanics',
];
