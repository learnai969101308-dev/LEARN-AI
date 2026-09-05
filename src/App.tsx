import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { StudentManagement } from './components/students/StudentManagement';
import { TeacherManagement } from './components/teachers/TeacherManagement';
import { ClassManagement } from './components/classes/ClassManagement';
import { GradeManagement } from './components/grades/GradeManagement';
import { StudentAttendance } from './components/attendance/StudentAttendance';
import { TeacherAttendance } from './components/attendance/TeacherAttendance';
import { ResultsManagement } from './components/results/ResultsManagement';
import { CodeGsGuide } from './components/CodeGsGuide';

import {
  Student,
  Teacher,
  SchoolClass,
  StudentGradeRecord,
  StudentAttendanceRecord,
  TeacherAttendanceRecord,
} from './types';

import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_GRADES,
  INITIAL_STUDENT_ATTENDANCE,
  INITIAL_TEACHER_ATTENDANCE,
} from './services/sampleData';

import {
  signInWithGooglePopup,
  signOutFirebase,
  getStoredAccessToken,
  subscribeToAuthChanges,
} from './services/auth';

import {
  loadLocalSchoolData,
  saveLocalSchoolData,
  getSavedSpreadsheetId,
  createSchoolSpreadsheet,
  syncAllDataToGoogleSheet,
  SchoolDatabaseState,
} from './services/sheetsService';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('students');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth & Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getStoredAccessToken());
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(getSavedSpreadsheetId());
  const [isSyncing, setIsSyncing] = useState(false);

  // Core School Database State (loaded from LocalStorage or seed data)
  const [dbState, setDbState] = useState<SchoolDatabaseState>(() => {
    return loadLocalSchoolData({
      students: INITIAL_STUDENTS,
      teachers: INITIAL_TEACHERS,
      classes: INITIAL_CLASSES,
      grades: INITIAL_GRADES,
      studentAttendance: INITIAL_STUDENT_ATTENDANCE,
      teacherAttendance: INITIAL_TEACHER_ATTENDANCE,
    });
  });

  // Save to LocalStorage whenever database state updates
  useEffect(() => {
    saveLocalSchoolData(dbState);
  }, [dbState]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      const token = getStoredAccessToken();
      setAccessToken(token);
    });
    return () => unsubscribe();
  }, []);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      const { user, accessToken: token } = await signInWithGooglePopup();
      setCurrentUser(user);
      setAccessToken(token);

      // If no spreadsheet ID exists yet, automatically create one!
      if (!spreadsheetId && token) {
        try {
          const created = await createSchoolSpreadsheet(token);
          setSpreadsheetId(created.spreadsheetId);
          alert(`បានភ្ជាប់ Google Sheet ដោយជោគជ័យ! Spreadsheet ID: ${created.spreadsheetId}`);
        } catch (sheetErr) {
          console.error('Error creating initial sheet:', sheetErr);
        }
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      alert(`មិនអាចចូលគណនី Google បានទេ: ${err.message || err}`);
    }
  };

  const handleSignOut = async () => {
    await signOutFirebase();
    setCurrentUser(null);
    setAccessToken(null);
  };

  // Google Sheets Synchronization Handler
  const handleSyncGoogleSheets = async () => {
    if (!accessToken) {
      alert('សូមចូលគណនី Google ជាមុនសិន!');
      return;
    }

    setIsSyncing(true);
    try {
      let sheetId = spreadsheetId;
      if (!sheetId) {
        const created = await createSchoolSpreadsheet(accessToken);
        sheetId = created.spreadsheetId;
        setSpreadsheetId(sheetId);
      }

      await syncAllDataToGoogleSheet(accessToken, sheetId, dbState);
      alert('បានធ្វើសមកាលកម្មទិន្នន័យទាំងអស់ទៅកាន់ Google Sheets ដោយជោគជ័យ!');
    } catch (err: any) {
      console.error('Sync Error:', err);
      alert(`ការធ្វើសមកាលកម្មមានបញ្ហា៖ ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // ----------------------------------------------------
  // STUDENT ACTIONS
  // ----------------------------------------------------
  const handleAddStudent = (newStudent: Student) => {
    setDbState((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students],
    }));
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setDbState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)),
    }));
  };

  const handleDeleteStudent = (studentId: string) => {
    setDbState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
    }));
  };

  const handleBatchAddStudents = (newStudents: Student[]) => {
    setDbState((prev) => ({
      ...prev,
      students: [...newStudents, ...prev.students],
    }));
  };

  // ----------------------------------------------------
  // TEACHER ACTIONS
  // ----------------------------------------------------
  const handleAddTeacher = (newTeacher: Teacher) => {
    setDbState((prev) => ({
      ...prev,
      teachers: [newTeacher, ...prev.teachers],
    }));
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setDbState((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t)),
    }));
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setDbState((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== teacherId),
    }));
  };

  const handleBatchAddTeachers = (newTeachers: Teacher[]) => {
    setDbState((prev) => ({
      ...prev,
      teachers: [...newTeachers, ...prev.teachers],
    }));
  };

  // ----------------------------------------------------
  // CLASS ACTIONS
  // ----------------------------------------------------
  const handleAddClass = (newClass: SchoolClass) => {
    setDbState((prev) => ({
      ...prev,
      classes: [...prev.classes, newClass],
    }));
  };

  const handleUpdateClass = (updatedClass: SchoolClass) => {
    setDbState((prev) => ({
      ...prev,
      classes: prev.classes.map((c) => (c.id === updatedClass.id ? updatedClass : c)),
    }));
  };

  const handleDeleteClass = (classId: string) => {
    setDbState((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c.id !== classId),
    }));
  };

  const handleEnrollStudentToClass = (studentId: string, classId: string) => {
    const targetClass = dbState.classes.find((c) => c.id === classId);
    if (!targetClass) return;

    setDbState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, grade: targetClass.name } : s
      ),
      classes: prev.classes.map((c) => {
        if (c.id === classId) {
          const updatedIds = Array.from(new Set([...(c.studentIds || []), studentId]));
          return { ...c, studentIds: updatedIds };
        }
        return c;
      }),
    }));
  };

  const handleRemoveStudentFromClass = (studentId: string, classId: string) => {
    setDbState((prev) => ({
      ...prev,
      classes: prev.classes.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            studentIds: (c.studentIds || []).filter((id) => id !== studentId),
          };
        }
        return c;
      }),
    }));
  };

  const handleTransferStudent = (
    studentId: string,
    fromClassId: string,
    toClassId: string
  ) => {
    const targetClass = dbState.classes.find((c) => c.id === toClassId);
    if (!targetClass) return;

    setDbState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, grade: targetClass.name } : s
      ),
      classes: prev.classes.map((c) => {
        if (c.id === fromClassId) {
          return {
            ...c,
            studentIds: (c.studentIds || []).filter((id) => id !== studentId),
          };
        }
        if (c.id === toClassId) {
          return {
            ...c,
            studentIds: Array.from(new Set([...(c.studentIds || []), studentId])),
          };
        }
        return c;
      }),
    }));
  };

  // ----------------------------------------------------
  // GRADE ACTIONS
  // ----------------------------------------------------
  const handleSaveGradeRecord = (record: StudentGradeRecord) => {
    setDbState((prev) => {
      const idx = prev.grades.findIndex((g) => g.id === record.id);
      if (idx >= 0) {
        const next = [...prev.grades];
        next[idx] = record;
        return { ...prev, grades: next };
      }
      return { ...prev, grades: [record, ...prev.grades] };
    });
  };

  const handleBatchSaveGrades = (records: StudentGradeRecord[]) => {
    setDbState((prev) => {
      const map = new Map(prev.grades.map((g) => [g.id, g]));
      records.forEach((r) => map.set(r.id, r));
      return { ...prev, grades: Array.from(map.values()) };
    });
  };

  // ----------------------------------------------------
  // ATTENDANCE ACTIONS
  // ----------------------------------------------------
  const handleSaveStudentAttendance = (records: StudentAttendanceRecord[]) => {
    setDbState((prev) => {
      // replace or add matching
      const filtered = prev.studentAttendance.filter(
        (a) => !records.some((r) => r.id === a.id || (r.date === a.date && r.studentId === a.studentId && r.subject === a.subject))
      );
      return {
        ...prev,
        studentAttendance: [...records, ...filtered],
      };
    });
  };

  const handleSaveTeacherAttendance = (records: TeacherAttendanceRecord[]) => {
    setDbState((prev) => {
      const filtered = prev.teacherAttendance.filter(
        (a) => !records.some((r) => r.id === a.id || (r.date === a.date && r.teacherId === a.teacherId))
      );
      return {
        ...prev,
        teacherAttendance: [...records, ...filtered],
      };
    });
  };

  // Page titles and subtitles
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    students: {
      title: '១. ព័ត៌មានសិស្ស (Student Management)',
      subtitle: 'គ្រប់គ្រងព័ត៌មានសិស្ស CRUD (ID អូតូ, រូបថត, អាសយដ្ឋាន) និង Upload បញ្ជីសិស្សពី Excel',
    },
    teachers: {
      title: '២. ព័ត៌មានគ្រូ (Teacher Management)',
      subtitle: 'គ្រប់គ្រងព័ត៌មានគ្រូ CRUD ពីកាឡោន A ដល់ K (អត្តលេខ, ឯកទេស, ចូលបម្រើការ, អតីតភាព, ទូរស័ព្ទ, រូបថត)',
    },
    classes: {
      title: '៣. គ្រប់គ្រងថ្នាក់រៀន (Class Management)',
      subtitle: 'ជ្រើសរើសថ្នាក់, ទាញសិស្សចូលតាមថ្នាក់, និងផ្ទេរសិស្សចេញ',
    },
    grades: {
      title: '៤. គ្រប់គ្រងពិន្ទុសិស្ស (Grade Management)',
      subtitle: 'ជ្រើសរើសខែ, ជ្រើសរើសថ្នាក់, ជ្រើសរើសសិស្ស (ថ្នាក់ទី៩ មាន ១០ មុខវិជ្ជា, ថ្នាក់ទី១-៨ មាន ១៣ មុខវិជ្ជា)',
    },
    student_attendance: {
      title: '៥. គ្រប់គ្រងវត្តមានសិស្ស (Student Attendance)',
      subtitle: 'ជ្រើសថ្នាក់, ឈ្មោះសិស្សអូតូ, ជ្រើសមុខវិជ្ជា, គ្រូអូតូ, ជ្រើស (ចូលរៀន, មិនចូល, ច្បាប់, អត់ច្បាប់, អវត្តមាន)',
    },
    teacher_attendance: {
      title: '៦. គ្រប់គ្រងវត្តមានគ្រូ (Teacher Attendance)',
      subtitle: 'គ្រូអូតូ, ជ្រើសមុខវិជ្ជា, ម៉ោងចូល-ចេញ, ជ្រើស (យឺត, ទាន់ម៉ោង, ច្បាប់, អត់ច្បាប់, មិនជ្រើស)',
    },
    results: {
      title: '៧. គ្រប់គ្រងលទ្ធផលសិក្សា (Academic Results)',
      subtitle: 'តារាងមធ្យមភាគប្រចាំខែ និងតារាងមធ្យមភាគប្រចាំឆមាស (ចំណាត់ថ្នាក់ និងនិទ្ទេស)',
    },
    code_gs_guide: {
      title: 'Backend Google Sheets (Code.gs Guide)',
      subtitle: 'ការណែនាំដំឡើង Apps Script, បង្កើត Tabs ទាំង ៦ អូតូ និងភ្ជាប់ Google Sheet',
    },
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        studentCount={dbState.students.length}
        teacherCount={dbState.teachers.length}
        classCount={dbState.classes.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title={titles[currentTab].title}
          subtitle={titles[currentTab].subtitle}
          currentUser={currentUser}
          accessToken={accessToken}
          onGoogleSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
          onSyncGoogleSheets={handleSyncGoogleSheets}
          isSyncing={isSyncing}
          spreadsheetId={spreadsheetId}
          onOpenCodeGsGuide={() => setCurrentTab('code_gs_guide')}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* 1. ព័ត៌មានសិស្ស CRUD & Upload Excel */}
            {currentTab === 'students' && (
              <StudentManagement
                students={dbState.students}
                classes={dbState.classes}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onBatchAddStudents={handleBatchAddStudents}
              />
            )}

            {/* 2. ព័ត៌មានគ្រូ CRUD ពីកាឡោន A ដល់ K */}
            {currentTab === 'teachers' && (
              <TeacherManagement
                teachers={dbState.teachers}
                onAddTeacher={handleAddTeacher}
                onUpdateTeacher={handleUpdateTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                onBatchAddTeachers={handleBatchAddTeachers}
              />
            )}

            {/* 3. គ្រប់ថ្នាក់រៀន CRUD (ជ្រើសថ្នាក់, ទាញសិស្សចូល, ផ្ទេរសិស្សចេញ) */}
            {currentTab === 'classes' && (
              <ClassManagement
                classes={dbState.classes}
                students={dbState.students}
                teachers={dbState.teachers}
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onTransferStudent={handleTransferStudent}
                onEnrollStudentToClass={handleEnrollStudentToClass}
                onRemoveStudentFromClass={handleRemoveStudentFromClass}
              />
            )}

            {/* 4. គ្រប់គ្រងពិន្ទុសិស្ស CRUD (ខែ, ថ្នាក់, សិស្ស, ១០ ឬ ១៣ មុខ) */}
            {currentTab === 'grades' && (
              <GradeManagement
                students={dbState.students}
                classes={dbState.classes}
                grades={dbState.grades}
                onSaveGradeRecord={handleSaveGradeRecord}
                onBatchSaveGrades={handleBatchSaveGrades}
              />
            )}

            {/* 5. គ្រប់គ្រងវត្តមានសិស្ស CRUD (ថ្នាក់, សិស្សអូតូ, មុខវិជ្ជា, គ្រូអូតូ, ស្ថានភាព) */}
            {currentTab === 'student_attendance' && (
              <StudentAttendance
                students={dbState.students}
                teachers={dbState.teachers}
                classes={dbState.classes}
                attendanceRecords={dbState.studentAttendance}
                onSaveBatchAttendance={handleSaveStudentAttendance}
              />
            )}

            {/* 6. គ្រប់គ្រងវត្តមានគ្រូ CRUD (គ្រូអូតូ, មុខវិជ្ជា, ម៉ោងចូល-ចេញ, ស្ថានភាព) */}
            {currentTab === 'teacher_attendance' && (
              <TeacherAttendance
                teachers={dbState.teachers}
                attendanceRecords={dbState.teacherAttendance}
                onSaveBatchAttendance={handleSaveTeacherAttendance}
              />
            )}

            {/* 7. គ្រប់គ្រងលទ្ធផលសិក្សា (តារាងមធ្យមភាគប្រចាំខែ & ប្រចាំឆមាស) */}
            {currentTab === 'results' && (
              <ResultsManagement
                students={dbState.students}
                classes={dbState.classes}
                grades={dbState.grades}
              />
            )}

            {/* Guide: Backend Google Sheets Code.gs */}
            {currentTab === 'code_gs_guide' && (
              <CodeGsGuide
                spreadsheetId={spreadsheetId}
                onOpenSpreadsheet={() => {
                  if (spreadsheetId) {
                    window.open(
                      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
                      '_blank'
                    );
                  }
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
