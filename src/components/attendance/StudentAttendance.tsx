import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Calendar,
  Save,
  CheckCheck,
  Download,
  Filter,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Student,
  Teacher,
  SchoolClass,
  StudentAttendanceRecord,
  StudentAttendanceStatus,
} from '../../types';
import { GRADE_9_SUBJECTS, GRADE_1_8_SUBJECTS } from '../../services/sampleData';

interface StudentAttendanceProps {
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  attendanceRecords: StudentAttendanceRecord[];
  onSaveBatchAttendance: (records: StudentAttendanceRecord[]) => void;
}

export const StudentAttendance: React.FC<StudentAttendanceProps> = ({
  students,
  teachers,
  classes,
  attendanceRecords,
  onSaveBatchAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState<string>('គណិតវិទ្យា');

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const isGrade9 = activeClass?.level === 9 || activeClass?.name?.includes('៩');
  const subjects = isGrade9 ? GRADE_9_SUBJECTS : GRADE_1_8_SUBJECTS;

  // គ្រូអូតូ: Find teacher who specializes in selectedSubject or homeroom teacher
  const autoTeacher = useMemo(() => {
    const matchedSpecialist = teachers.find((t) => t.specialty?.includes(selectedSubject));
    if (matchedSpecialist) return matchedSpecialist;
    const homeroom = teachers.find((t) => t.id === activeClass?.homeroomTeacherId);
    return homeroom || teachers[0];
  }, [selectedSubject, teachers, activeClass]);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(autoTeacher?.id || '');

  // Keep selected teacher synced when autoTeacher updates
  React.useEffect(() => {
    if (autoTeacher) {
      setSelectedTeacherId(autoTeacher.id);
    }
  }, [autoTeacher]);

  const activeTeacher = teachers.find((t) => t.id === selectedTeacherId) || autoTeacher;

  // ឈ្មោះសិស្សអូតូ: Students in activeClass
  const classStudents = useMemo(() => {
    return students.filter(
      (s) => s.grade === activeClass?.name || activeClass?.studentIds?.includes(s.id)
    );
  }, [students, activeClass]);

  // Attendance states for each student in table
  const [statuses, setStatuses] = useState<{ [studentId: string]: StudentAttendanceStatus }>({});
  const [notes, setNotes] = useState<{ [studentId: string]: string }>({});

  // Populate from existing records on date/class/subject change
  React.useEffect(() => {
    const newStatuses: { [studentId: string]: StudentAttendanceStatus } = {};
    const newNotes: { [studentId: string]: string } = {};

    classStudents.forEach((student) => {
      const match = attendanceRecords.find(
        (r) =>
          r.date === selectedDate &&
          r.studentId === student.id &&
          r.subject === selectedSubject &&
          r.classId === activeClass?.id
      );

      if (match) {
        newStatuses[student.id] = match.status;
        newNotes[student.id] = match.note || '';
      } else {
        newStatuses[student.id] = 'ចូលរៀន'; // default present
        newNotes[student.id] = '';
      }
    });

    setStatuses(newStatuses);
    setNotes(newNotes);
  }, [selectedDate, activeClass?.id, selectedSubject, classStudents, attendanceRecords]);

  const handleStatusChange = (studentId: string, status: StudentAttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [studentId]: note }));
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const allPresent: { [studentId: string]: StudentAttendanceStatus } = {};
    classStudents.forEach((s) => {
      allPresent[s.id] = 'ចូលរៀន';
    });
    setStatuses(allPresent);
  };

  // Save batch attendance
  const handleSaveAttendance = () => {
    if (!activeClass || !activeTeacher) return;

    const recordsToSave: StudentAttendanceRecord[] = classStudents.map((student) => {
      const existing = attendanceRecords.find(
        (r) =>
          r.date === selectedDate &&
          r.studentId === student.id &&
          r.subject === selectedSubject &&
          r.classId === activeClass.id
      );

      return {
        id: existing?.id || `ATT-S-${Date.now().toString().slice(-6)}-${student.id.slice(-3)}`,
        date: selectedDate,
        classId: activeClass.id,
        className: activeClass.name,
        studentId: student.id,
        studentName: student.name,
        subject: selectedSubject,
        teacherName: activeTeacher.name,
        teacherId: activeTeacher.id,
        status: statuses[student.id] || 'ចូលរៀន',
        note: notes[student.id] || '',
      };
    });

    onSaveBatchAttendance(recordsToSave);
    alert(`បានកត់ត្រាវត្តមានសិស្សថ្នាក់ ${activeClass.name} កាលបរិច្ឆេទ ${selectedDate} បានជោគជ័យ!`);
  };

  // Stats for this session
  const stats = useMemo(() => {
    const present = Object.values(statuses).filter((s) => s === 'ចូលរៀន').length;
    const absentPerm = Object.values(statuses).filter((s) => s === 'ច្បាប់').length;
    const absentNoPerm = Object.values(statuses).filter((s) => s === 'អត់ច្បាប់').length;
    const generalAbsent = Object.values(statuses).filter((s) => s === 'អវត្តមាន' || s === 'មិនចូល').length;
    return { present, absentPerm, absentNoPerm, generalAbsent };
  }, [statuses]);

  // Export attendance to Excel
  const handleExportAttendance = () => {
    const exportRows = classStudents.map((s, idx) => ({
      'ល.រ': idx + 1,
      'កាលបរិច្ឆេទ': selectedDate,
      'ថ្នាក់រៀន': activeClass.name,
      'អត្តលេខ': s.id,
      'ឈ្មោះសិស្ស': s.name,
      'ភេទ': s.gender,
      'មុខវិជ្ជា': selectedSubject,
      'គ្រូបង្រៀន': activeTeacher?.name,
      'ស្ថានភាពវត្តមាន': statuses[s.id] || 'ចូលរៀន',
      'ចំណាំ': notes[s.id] || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'វត្តមានសិស្ស');
    XLSX.writeFile(wb, `វត្តមានសិស្ស_${activeClass.name}_${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Selectors: Class, Subject, Date, Auto Teacher */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ១. ជ្រើសថ្នាក់ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ១. ជ្រើសថ្នាក់រៀន
            </label>
            <select
              id="student-att-class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* ២. ជ្រើសមុខវិជ្ជា */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ២. ជ្រើសមុខវិជ្ជា
            </label>
            <select
              id="student-att-subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* ៣. គ្រូអូតូ (Auto Teacher) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>៣. គ្រូបង្រៀន (គ្រូអូតូ)</span>
              <span className="text-[10px] text-cyan-600 bg-cyan-50 px-1.5 rounded">អូតូតាមឯកទេស</span>
            </label>
            <select
              id="student-att-teacher-select"
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialty})
                </option>
              ))}
            </select>
          </div>

          {/* ៤. កាលបរិច្ឆេទ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-600" />
              <span>៤. កាលបរិច្ឆេទ</span>
            </label>
            <input
              id="student-att-date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Attendance Stats & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
            ចូលរៀន៖ {stats.present} នាក់
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-100">
            ច្បាប់៖ {stats.absentPerm} នាក់
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold border border-amber-100">
            អត់ច្បាប់៖ {stats.absentNoPerm} នាក់
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-100">
            អវត្តមាន/មិនចូល៖ {stats.generalAbsent} នាក់
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>ចូលរៀនទាំងអស់</span>
          </button>

          <button
            onClick={handleExportAttendance}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Excel</span>
          </button>

          <button
            id="save-student-att-btn"
            onClick={handleSaveAttendance}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>រក្សាទុកវត្តមាន</span>
          </button>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              បញ្ជីសិស្សអូតូក្នុង {activeClass.name} (ចំនួន {classStudents.length} នាក់)
            </h3>
            <p className="text-xs text-slate-500">
              មុខវិជ្ជា៖ <span className="font-semibold text-slate-700">{selectedSubject}</span> • គ្រូបង្រៀន៖{' '}
              <span className="font-semibold text-cyan-700">{activeTeacher?.name}</span>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-3">ល.រ</th>
                <th className="py-3 px-3">អត្តលេខ</th>
                <th className="py-3 px-3">រូបថត</th>
                <th className="py-3 px-3">ឈ្មោះសិស្សអូតូ</th>
                <th className="py-3 px-3">ភេទ</th>
                <th className="py-3 px-4">
                  ជ្រើសស្ថានភាព (ចូលរៀន, មិនចូល, ច្បាប់, អត់ច្បាប់, អវត្តមាន)
                </th>
                <th className="py-3 px-3">ចំណាំ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    មិនមានសិស្សក្នុងថ្នាក់នេះទេ
                  </td>
                </tr>
              ) : (
                classStudents.map((student, idx) => {
                  const currentStatus = statuses[student.id] || 'ចូលរៀន';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-medium text-cyan-700">
                        {student.id}
                      </td>
                      <td className="py-3 px-3">
                        {student.image ? (
                          <img
                            src={student.image}
                            alt={student.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-[10px]">
                            {student.gender === 'ស្រី' ? 'ក' : 'ខ'}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{student.name}</td>
                      <td className="py-3 px-3 text-slate-600">{student.gender}</td>

                      {/* ជ្រើស(ចូលរៀន,មិនចូល,ច្បាប់,អត់ច្បាប់,អវត្តមាន) */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(
                            [
                              'ចូលរៀន',
                              'មិនចូល',
                              'ច្បាប់',
                              'អត់ច្បាប់',
                              'អវត្តមាន',
                            ] as StudentAttendanceStatus[]
                          ).map((statusOption) => {
                            const isSelected = currentStatus === statusOption;
                            return (
                              <button
                                key={statusOption}
                                type="button"
                                onClick={() => handleStatusChange(student.id, statusOption)}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                                  isSelected
                                    ? statusOption === 'ចូលរៀន'
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : statusOption === 'ច្បាប់'
                                      ? 'bg-blue-600 text-white shadow-2xs'
                                      : statusOption === 'អត់ច្បាប់'
                                      ? 'bg-amber-600 text-white shadow-2xs'
                                      : 'bg-rose-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {statusOption}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          placeholder="ចំណាំ..."
                          value={notes[student.id] || ''}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          className="px-2 py-1 border border-slate-200 rounded text-xs text-slate-700 focus:ring-1 focus:ring-cyan-500 w-full max-w-[150px]"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
