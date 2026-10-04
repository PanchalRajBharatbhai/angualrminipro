import { Injectable } from '@angular/core';
import { Student } from '../models/student.model';
import { Course } from '../models/course.model';
import { Enrollment } from '../models/enrollment.model';
import { User } from '../models/user.model';

const STORAGE_KEYS = {
  STUDENTS: 'ces_students_data_v1',
  COURSES: 'ces_courses_data_v1',
  ENROLLMENTS: 'ces_enrollments_data_v1',
  USER: 'ces_current_user_v1',
  THEME: 'ces_active_theme_v1',
};

const SEED_STUDENTS: Student[] = [
  {
    id: 'STU-1001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@university.edu',
    phone: '+91 98765 43210',
    gender: 'Male',
    dateOfBirth: '2002-05-14',
    address: '42 Lotus Enclave, MG Road, Bengaluru, Karnataka',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    createdAt: '2024-01-15T09:30:00Z',
  },
  {
    id: 'STU-1002',
    name: 'Ananya Verma',
    email: 'ananya.verma@university.edu',
    phone: '+91 98234 56789',
    gender: 'Female',
    dateOfBirth: '2003-08-22',
    address: '15 Orchid Heights, Park Street, Pune, Maharashtra',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    createdAt: '2024-01-18T10:15:00Z',
  },
  {
    id: 'STU-1003',
    name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@university.edu',
    phone: '+91 97112 34567',
    gender: 'Male',
    dateOfBirth: '2001-11-09',
    address: '88 Cyber City View, Gachibowli, Hyderabad, Telangana',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    createdAt: '2024-02-01T11:00:00Z',
  },
  {
    id: 'STU-1004',
    name: 'Priya Iyer',
    email: 'priya.iyer@university.edu',
    phone: '+91 96543 21098',
    gender: 'Female',
    dateOfBirth: '2002-03-30',
    address: '23 Marina Palms, Santhome, Chennai, Tamil Nadu',
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    createdAt: '2024-02-10T14:20:00Z',
  },
  {
    id: 'STU-1005',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@university.edu',
    phone: '+91 95432 10987',
    gender: 'Male',
    dateOfBirth: '2001-07-19',
    address: '104 Brigade Gateway, Malleshwaram, Bengaluru, Karnataka',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Inactive',
    createdAt: '2024-02-15T16:45:00Z',
  },
  {
    id: 'STU-1006',
    name: 'Meera Nambiar',
    email: 'meera.nambiar@university.edu',
    phone: '+91 94321 09876',
    gender: 'Female',
    dateOfBirth: '2003-01-12',
    address: '77 Marine Drive, Kochi, Kerala',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    createdAt: '2024-03-01T08:30:00Z',
  },
  {
    id: 'STU-1007',
    name: 'Kabir Mehta',
    email: 'kabir.mehta@university.edu',
    phone: '+91 93210 98765',
    gender: 'Male',
    dateOfBirth: '2002-12-05',
    address: '502 Skylark Tower, Worli, Mumbai, Maharashtra',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'Suspended',
    createdAt: '2024-03-05T13:10:00Z',
  },
  {
    id: 'STU-1008',
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@university.edu',
    phone: '+91 92109 87654',
    gender: 'Female',
    dateOfBirth: '2003-04-18',
    address: '19 Shivaji Park, Dadar, Mumbai, Maharashtra',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    createdAt: '2024-03-12T15:40:00Z',
  },
];

const SEED_COURSES: Course[] = [
  {
    id: 'CRS-201',
    name: 'Advanced Full Stack Web Engineering',
    code: 'CS401',
    description: 'Comprehensive study of modern single page architecture, Angular, reactive micro-frontends, REST APIs, and state management.',
    instructor: 'Dr. Aris Thorne',
    category: 'Computer Science',
    duration: '16 Weeks',
    startDate: '2025-01-10',
    endDate: '2025-05-15',
    capacity: 25,
    availableSeats: 22,
    fee: 14500,
    status: 'Active',
    createdAt: '2024-01-05T10:00:00Z',
  },
  {
    id: 'CRS-202',
    name: 'Data Structures & Algorithms in TypeScript',
    code: 'CS202',
    description: 'Rigorous algorithmic analysis, complexity theory, tree balancing, graph algorithms, and dynamic programming applications.',
    instructor: 'Prof. Evelyn Vance',
    category: 'Computer Science',
    duration: '12 Weeks',
    startDate: '2025-01-15',
    endDate: '2025-04-20',
    capacity: 30,
    availableSeats: 27,
    fee: 12000,
    status: 'Active',
    createdAt: '2024-01-06T11:00:00Z',
  },
  {
    id: 'CRS-203',
    name: 'Cloud Infrastructure & DevOps Pipelines',
    code: 'IT305',
    description: 'Continuous integration and deployment pipelines, containerization with Docker, Kubernetes clustering, and cloud automation.',
    instructor: 'Marcus Sterling',
    category: 'Information Technology',
    duration: '10 Weeks',
    startDate: '2025-02-01',
    endDate: '2025-04-25',
    capacity: 20,
    availableSeats: 18,
    fee: 16000,
    status: 'Active',
    createdAt: '2024-01-08T12:00:00Z',
  },
  {
    id: 'CRS-204',
    name: 'Applied Machine Learning & Predictive Modeling',
    code: 'DS310',
    description: 'Supervised and unsupervised statistical machine learning, neural networks, feature engineering, and model validation with Python.',
    instructor: 'Dr. Elena Rostova',
    category: 'Data Science',
    duration: '14 Weeks',
    startDate: '2025-02-15',
    endDate: '2025-06-01',
    capacity: 24,
    availableSeats: 22,
    fee: 18500,
    status: 'Active',
    createdAt: '2024-01-10T14:00:00Z',
  },
  {
    id: 'CRS-205',
    name: 'Enterprise UI/UX Design Systems',
    code: 'DSG102',
    description: 'Design tokens, accessibility standards (WCAG AAA), responsive grid mechanics, design-to-code parity, and interactive prototypes.',
    instructor: 'Sarah Jenkins',
    category: 'Design',
    duration: '8 Weeks',
    startDate: '2025-03-01',
    endDate: '2025-04-30',
    capacity: 18,
    availableSeats: 16,
    fee: 9500,
    status: 'Upcoming',
    createdAt: '2024-01-12T09:00:00Z',
  },
  {
    id: 'CRS-206',
    name: 'Cybersecurity Principles & Ethical Hacking',
    code: 'SEC415',
    description: 'Network vulnerability assessments, cryptographic protocols, penetration testing methodologies, and defensive security measures.',
    instructor: 'Capt. David Miller',
    category: 'Security',
    duration: '12 Weeks',
    startDate: '2024-08-01',
    endDate: '2024-11-15',
    capacity: 20,
    availableSeats: 0,
    fee: 15000,
    status: 'Completed',
    createdAt: '2024-01-02T10:00:00Z',
  },
];

const SEED_ENROLLMENTS: Enrollment[] = [
  {
    id: 'ENR-5001',
    studentId: 'STU-1001',
    courseId: 'CRS-201',
    enrollmentDate: '2025-01-12',
    status: 'Active',
    paymentStatus: 'Paid',
    grade: 'A+',
    notes: 'Merit scholarship recipient (20% fee concession).',
    createdAt: '2025-01-12T10:00:00Z',
  },
  {
    id: 'ENR-5002',
    studentId: 'STU-1002',
    courseId: 'CRS-201',
    enrollmentDate: '2025-01-13',
    status: 'Active',
    paymentStatus: 'Paid',
    grade: '94/100',
    notes: 'Elected class representative.',
    createdAt: '2025-01-13T11:20:00Z',
  },
  {
    id: 'ENR-5003',
    studentId: 'STU-1003',
    courseId: 'CRS-201',
    enrollmentDate: '2025-01-14',
    status: 'Active',
    paymentStatus: 'Pending',
    grade: 'In Progress',
    notes: 'Installment 1 paid; 2nd installment due in 15 days.',
    createdAt: '2025-01-14T15:00:00Z',
  },
  {
    id: 'ENR-5004',
    studentId: 'STU-1001',
    courseId: 'CRS-202',
    enrollmentDate: '2025-01-16',
    status: 'Active',
    paymentStatus: 'Paid',
    grade: 'A',
    notes: 'Concurrent enrollment alongside CS401.',
    createdAt: '2025-01-16T09:40:00Z',
  },
  {
    id: 'ENR-5005',
    studentId: 'STU-1004',
    courseId: 'CRS-202',
    enrollmentDate: '2025-01-18',
    status: 'Active',
    paymentStatus: 'Paid',
    grade: '88/100',
    notes: 'Passed prerequisite entrance test with distinction.',
    createdAt: '2025-01-18T14:10:00Z',
  },
  {
    id: 'ENR-5006',
    studentId: 'STU-1006',
    courseId: 'CRS-202',
    enrollmentDate: '2025-01-20',
    status: 'Active',
    paymentStatus: 'Paid',
    grade: 'B+',
    notes: 'Special academic permission granted.',
    createdAt: '2025-01-20T16:30:00Z',
  },
  {
    id: 'ENR-5007',
    studentId: 'STU-1002',
    courseId: 'CRS-203',
    enrollmentDate: '2025-02-02',
    status: 'Active',
    paymentStatus: 'Paid',
    grade: '91/100',
    notes: 'AWS cloud lab access provisioned.',
    createdAt: '2025-02-02T10:00:00Z',
  },
  {
    id: 'ENR-5008',
    studentId: 'STU-1008',
    courseId: 'CRS-203',
    enrollmentDate: '2025-02-03',
    status: 'Active',
    paymentStatus: 'Pending',
    grade: 'Pending Review',
    notes: 'Awaiting college subsidy approval.',
    createdAt: '2025-02-03T11:15:00Z',
  },
  {
    id: 'ENR-5009',
    studentId: 'STU-1004',
    courseId: 'CRS-204',
    enrollmentDate: '2025-02-16',
    status: 'Active',
    paymentStatus: 'Paid',
    grade: 'A-',
    notes: 'High performance computing cluster badge granted.',
    createdAt: '2025-02-16T12:00:00Z',
  },
  {
    id: 'ENR-5010',
    studentId: 'STU-1006',
    courseId: 'CRS-204',
    enrollmentDate: '2025-02-17',
    status: 'Active',
    paymentStatus: 'Waived',
    grade: 'A',
    notes: 'Research assistant fee waiver applied.',
    createdAt: '2025-02-17T13:45:00Z',
  },
  {
    id: 'ENR-5011',
    studentId: 'STU-1003',
    courseId: 'CRS-205',
    enrollmentDate: '2025-02-28',
    status: 'Active',
    paymentStatus: 'Paid',
    grade: '85/100',
    notes: 'Figma pro educational license activated.',
    createdAt: '2025-02-28T09:10:00Z',
  },
  {
    id: 'ENR-5012',
    studentId: 'STU-1008',
    courseId: 'CRS-205',
    enrollmentDate: '2025-03-01',
    status: 'Active',
    paymentStatus: 'Paid',
    grade: '96/100',
    notes: 'Enrolled via design department elective pool.',
    createdAt: '2025-03-01T10:30:00Z',
  },
  {
    id: 'ENR-5013',
    studentId: 'STU-1005',
    courseId: 'CRS-201',
    enrollmentDate: '2025-01-14',
    status: 'Cancelled',
    paymentStatus: 'Paid',
    notes: 'Cancelled due to medical leave request on Jan 22.',
    createdAt: '2025-01-14T09:00:00Z',
  },
];

const DEFAULT_USER: User = {
  id: 'USR-9001',
  email: 'rajpanchal3406@gmail.com',
  name: 'Raj Panchal',
  role: 'Administrator',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  token: 'mock-jwt-auth-token-sample',
};

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {
    this.initializeIfEmpty();
  }

  public initializeIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      this.saveStudents(SEED_STUDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      this.saveCourses(SEED_COURSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ENROLLMENTS)) {
      this.saveEnrollments(SEED_ENROLLMENTS);
    } else {
      // Gracefully backfill grades for existing enrollments if empty
      const existing = this.getEnrollments();
      let hasChanges = false;
      const updated = existing.map((enr) => {
        if (!enr.grade) {
          const matchedSeed = SEED_ENROLLMENTS.find((s) => s.id === enr.id);
          if (matchedSeed && matchedSeed.grade) {
            hasChanges = true;
            return { ...enr, grade: matchedSeed.grade };
          }
        }
        return enr;
      });
      if (hasChanges) {
        this.saveEnrollments(updated);
      }
    }
    this.recomputeAllAvailableSeats();
  }

  public resetToSeedData(): void {
    this.saveStudents(SEED_STUDENTS);
    this.saveCourses(SEED_COURSES);
    this.saveEnrollments(SEED_ENROLLMENTS);
    this.recomputeAllAvailableSeats();
  }

  // --- Students ---
  public getStudents(): Student[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public saveStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  // --- Courses ---
  public getCourses(): Course[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
    return raw ? JSON.parse(raw) : [];
  }

  public saveCourses(courses: Course[]): void {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }

  // --- Enrollments ---
  public getEnrollments(): Enrollment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public saveEnrollments(enrollments: Enrollment[]): void {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    this.recomputeAllAvailableSeats();
  }

  // --- Auth Session ---
  public getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    const user: User = JSON.parse(raw);
    if (user.email === 'admin@university.edu' || user.email !== 'rajpanchal3406@gmail.com') {
      user.email = 'rajpanchal3406@gmail.com';
      user.name = 'Raj Panchal';
      this.saveCurrentUser(user);
    }
    return user;
  }

  public saveCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  public getDefaultDemoUser(): User {
    return DEFAULT_USER;
  }

  // --- Theme ---
  public getSavedTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'dark' ? 'dark' : 'light';
  }

  public saveTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  /**
   * Recalculates availableSeats for every course based on capacity - activeEnrollments.
   * Maintains relational integrity automatically.
   */
  public recomputeAllAvailableSeats(): void {
    const courses = this.getCourses();
    const enrollments = this.getEnrollments();

    let changed = false;
    courses.forEach((course) => {
      const activeEnrollments = enrollments.filter(
        (e) => e.courseId === course.id && e.status === 'Active'
      ).length;
      const computedAvailable = Math.max(0, course.capacity - activeEnrollments);
      if (course.availableSeats !== computedAvailable) {
        course.availableSeats = computedAvailable;
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    }
  }
}
