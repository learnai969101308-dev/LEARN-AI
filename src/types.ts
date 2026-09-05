export interface Student {
  id: string; // Auto ID e.g. STU-2026-001
  name: string;
  gender: 'ប្រុស' | 'ស្រី';
  dob: string;
  grade: string; // e.g. "ថ្នាក់ទី ៧ក", "ថ្នាក់ទី ៩ខ"
  motherName: string;
  fatherName: string;
  address: string;
  phoneNumber: string;
  image?: string;
  status: 'កំពុងរៀន' | 'ផ្អាកការសិក្សា' | 'បោះបង់' | 'ផ្ទេរចេញ' | 'បញ្ចប់ការសិក្សា';
  createdAt?: string;
}

export interface Teacher {
  id: string; // Column A: អត្តលេខមន្ត្រី
  name: string; // Column B: គោត្តនាមនាម
  gender: 'ប្រុស' | 'ស្រី'; // Column C: ភេទ
  dob: string; // Column D: ថ្ងៃខែឆ្នាំកំណើត
  specialty: string; // Column E: មុខវិជ្ជាឯកទេស
  currentRole: string; // Column F: តួនាទីបច្ចុប្បន្ន
  entryDate: string; // Column G: ថ្ងៃខែឆ្នាំចូលបម្រើការ
  seniority: string; // Column H: អតីតភាពការងារ (e.g. "១២ ឆ្នាំ")
  address: string; // Column I: ទីលំនៅបច្ចុប្បន្ន
  phoneNumber: string; // Column J: លេខទូរស័ព្ទ
  image?: string; // Column K: រូបថត
  assignedClass?: string; // គ្រូបន្ទុកថ្នាក់
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "ថ្នាក់ទី ៧ក"
  level: number; // 1 to 9 (1-8 or 9)
  academicYear: string;
  roomNumber: string;
  homeroomTeacherId?: string;
  studentIds: string[]; // List of student IDs
  description?: string;
}

export interface SubjectScore {
  subjectName: string;
  score: number; // 0-100 or 0-50 depending on scale
  maxScore: number;
}

export type AcademicMonth =
  | 'តេស្តដើមឆ្នាំ'
  | 'ខែវិច្ឆិកា'
  | 'ខែធ្នូ'
  | 'ខែមករា'
  | 'ខែកុម្ភៈ'
  | 'ខែមីនា'
  | 'ខែមេសា'
  | 'ខែឧសភា'
  | 'ខែមិថុនា'
  | 'ខែកក្កដា'
  | 'ខែសីហា'
  | 'ខែកញ្ញា'
  | 'ខែតុលា';

export interface StudentGradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  month: AcademicMonth;
  academicYear: string;
  subjects: {
    [subjectName: string]: number;
  };
  totalScore: number;
  averageScore: number;
  gradeRank?: number;
  gradeLetter?: string; // និទ្ទេស (ល្អប្រសើរ A, ល្អណាស់ B, ល្អ C, មធ្យម D, ខ្សោយ E, ខ្សោយខ្លាំង F)
  updatedAt: string;
}

export type StudentAttendanceStatus = 'ចូលរៀន' | 'មិនចូល' | 'ច្បាប់' | 'អត់ច្បាប់' | 'អវត្តមាន';

export interface StudentAttendanceRecord {
  id: string;
  date: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  subject: string;
  teacherName: string;
  teacherId: string;
  status: StudentAttendanceStatus;
  note?: string;
}

export type TeacherAttendanceStatus = 'យឺត' | 'ទាន់ម៉ោង' | 'ច្បាប់' | 'អត់ច្បាប់' | 'មិនជ្រើស';

export interface TeacherAttendanceRecord {
  id: string;
  date: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  checkInTime: string;
  checkOutTime: string;
  status: TeacherAttendanceStatus;
  note?: string;
}

export interface SubjectDefinition {
  id: string;
  name: string;
  coefficient: number;
  gradeLevel: '1-8' | '9' | 'all';
}
