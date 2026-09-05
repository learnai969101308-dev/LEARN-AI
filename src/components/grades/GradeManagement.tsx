import React, { useState, useMemo } from 'react';
import {
  Award,
  Calendar,
  Save,
  Download,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Student,
  SchoolClass,
  StudentGradeRecord,
  AcademicMonth,
} from '../../types';
import {
  ACADEMIC_MONTHS,
  GRADE_9_SUBJECTS,
  GRADE_1_8_SUBJECTS,
} from '../../services/sampleData';

interface GradeManagementProps {
  students: Student[];
  classes: SchoolClass[];
  grades: StudentGradeRecord[];
  onSaveGradeRecord: (record: StudentGradeRecord) => void;
  onBatchSaveGrades: (records: StudentGradeRecord[]) => void;
}

export const GradeManagement: React.FC<GradeManagementProps> = ({
  students,
  classes,
  grades,
  onSaveGradeRecord,
  onBatchSaveGrades,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<AcademicMonth>('ខែធ្នូ');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const isGrade9 = activeClass?.level === 9 || activeClass?.name?.includes('៩');
  const activeSubjects = isGrade9 ? GRADE_9_SUBJECTS : GRADE_1_8_SUBJECTS;

  // Students in this active class
  const classStudents = useMemo(() => {
    return students.filter(
      (s) => s.grade === activeClass?.name || activeClass?.studentIds?.includes(s.id)
    );
  }, [students, activeClass]);

  // If selectedStudentId not in class, pick first
  const currentStudent =
    classStudents.find((s) => s.id === selectedStudentId) || classStudents[0];

  // Look for existing grade record for this student + month
  const existingRecord = useMemo(() => {
    if (!currentStudent) return null;
    return grades.find(
      (g) =>
        g.studentId === currentStudent.id &&
        g.month === selectedMonth &&
        (g.gradeClass === activeClass?.name || g.gradeClass === currentStudent.grade)
    );
  }, [grades, currentStudent, selectedMonth, activeClass]);

  // Current Scores State
  const [inputScores, setInputScores] = useState<{ [subjectName: string]: number }>({});

  // Synchronize inputScores whenever currentStudent, selectedMonth, or existingRecord changes
  React.useEffect(() => {
    if (existingRecord) {
      setInputScores({ ...existingRecord.subjects });
    } else {
      const initial: { [subjectName: string]: number } = {};
      activeSubjects.forEach((sub) => {
        initial[sub.name] = 35; // default reasonable benchmark
      });
      setInputScores(initial);
    }
  }, [currentStudent?.id, selectedMonth, existingRecord, activeSubjects]);

  const handleScoreChange = (subjectName: string, valStr: string) => {
    const val = Number(valStr);
    setInputScores((prev) => ({
      ...prev,
      [subjectName]: isNaN(val) ? 0 : Math.min(50, Math.max(0, val)), // Khmer 50-point standard scale
    }));
  };

  // Calculations
  const calculatedStats = useMemo(() => {
    const subjectList = activeSubjects.map((s) => s.name);
    let total = 0;
    subjectList.forEach((name) => {
      total += Number(inputScores[name] || 0);
    });
    const avg = subjectList.length > 0 ? Number((total / subjectList.length).toFixed(2)) : 0;

    let letter = 'ខ្សោយ (F)';
    if (avg >= 45) letter = 'ល្អប្រសើរ (A)';
    else if (avg >= 40) letter = 'ល្អណាស់ (B)';
    else if (avg >= 35) letter = 'ល្អ (C)';
    else if (avg >= 30) letter = 'មធ្យម (D)';
    else if (avg >= 25) letter = 'ខ្សោយ (E)';

    return { total, avg, letter };
  }, [inputScores, activeSubjects]);

  const handleSaveIndividualScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent || !activeClass) return;

    const recordId = existingRecord?.id || `GRD-${Date.now().toString().slice(-6)}`;
    const newRecord: StudentGradeRecord = {
      id: recordId,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      gradeClass: activeClass.name,
      month: selectedMonth,
      academicYear: activeClass.academicYear || '2025-2026',
      subjects: inputScores,
      totalScore: calculatedStats.total,
      averageScore: calculatedStats.avg,
      gradeLetter: calculatedStats.letter,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSaveGradeRecord(newRecord);
    alert(`បានរក្សាទុកពិន្ទុសម្រាប់សិស្ស "${currentStudent.name}" (${selectedMonth}) ដោយជោគជ័យ!`);
  };

  // Class monthly grades overview list
  const classGradesForMonth = useMemo(() => {
    return classStudents.map((student) => {
      const rec = grades.find(
        (g) =>
          g.studentId === student.id &&
          g.month === selectedMonth &&
          (g.gradeClass === activeClass?.name || g.gradeClass === student.grade)
      );
      return {
        student,
        record: rec,
      };
    });
  }, [classStudents, grades, selectedMonth, activeClass]);

  // Export Class Grade Book to Excel
  const handleExportGradeBook = () => {
    if (!activeClass) return;
    const rows = classGradesForMonth.map((item, idx) => {
      const row: Record<string, any> = {
        'ល.រ': idx + 1,
        'អត្តលេខ': item.student.id,
        'គោត្តនាម-នាម': item.student.name,
        'ភេទ': item.student.gender,
      };

      activeSubjects.forEach((sub) => {
        row[sub.name] = item.record?.subjects?.[sub.name] ?? '-';
      });

      row['ពិន្ទុសរុប'] = item.record?.totalScore ?? '-';
      row['មធ្យមភាគ'] = item.record?.averageScore ?? '-';
      row['និទ្ទេស'] = item.record?.gradeLetter ?? '-';

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `ពិន្ទុ_${activeClass.name}_${selectedMonth}`);
    XLSX.writeFile(wb, `តារាងពិន្ទុ_${activeClass.name}_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* 3 Selectors: Month, Class, Student */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. ជ្រើសរើសខែ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>១. ជ្រើសរើសខែសិក្សា</span>
            </label>
            <select
              id="grade-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value as AcademicMonth)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {ACADEMIC_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* 2. ជ្រើសរើសថ្នាក់ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>២. ជ្រើសរើសថ្នាក់រៀន</span>
            </label>
            <select
              id="grade-class-select"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedStudentId('');
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.level === 9 ? 'ថ្នាក់ទី៩ - ១០មុខវិជ្ជា' : `ថ្នាក់ទី${cls.level} - ១៣មុខវិជ្ជា`})
                </option>
              ))}
            </select>
          </div>

          {/* 3. ជ្រើសរើសសិស្ស */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>៣. ជ្រើសរើសសិស្ស (ក្នុងថ្នាក់)</span>
            </label>
            <select
              id="grade-student-select"
              value={currentStudent?.id || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {classStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.gender} - {s.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grade Entry Form for Selected Student */}
      {currentStudent ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header of Form */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">
                  បញ្ចូលពិន្ទុ៖ {currentStudent.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium font-mono">
                  {currentStudent.id}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                  {activeClass?.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isGrade9
                  ? 'ថ្នាក់ទី៩៖ កំណត់ ១០ មុខវិជ្ជា (មាត្រដ្ឋានពិន្ទុ ០ ដល់ ៥០)'
                  : 'ថ្នាក់ទី១ ដល់ ៨៖ កំណត់ ១៣ មុខវិជ្ជា (មាត្រដ្ឋានពិន្ទុ ០ ដល់ ៥០)'}
              </p>
            </div>

            {/* Calculations Banner */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-right">
                <div className="text-[10px] text-slate-400">ពិន្ទុសរុប / មធ្យមភាគ</div>
                <div className="font-bold text-slate-800 text-sm">
                  {calculatedStats.total} /{' '}
                  <span className="text-blue-600">{calculatedStats.avg}</span>
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              <div>
                <div className="text-[10px] text-slate-400">និទ្ទេស</div>
                <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {calculatedStats.letter}
                </span>
              </div>
            </div>
          </div>

          {/* Form with 10 or 13 Subjects */}
          <form onSubmit={handleSaveIndividualScore} className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeSubjects.map((subject, index) => {
                const currentVal = inputScores[subject.name] ?? 0;
                return (
                  <div
                    key={subject.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-xs text-slate-700 flex items-center gap-1 truncate">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {index + 1}
                        </span>
                        <span className="truncate" title={subject.name}>
                          {subject.name}
                        </span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">Max: 50</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={currentVal}
                        onChange={(e) => handleScoreChange(subject.name, e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-right"
                      />
                      <span className="text-xs font-medium text-slate-500">ពិន្ទុ</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                មុខវិជ្ជាសរុប៖{' '}
                <span className="font-bold text-slate-800">{activeSubjects.length} មុខ</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុកពិន្ទុ {currentStudent.name}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
          មិនមានសិស្សក្នុងថ្នាក់នេះទេ
        </div>
      )}

      {/* Class Gradebook Table for Selected Month */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              តារាងពិន្ទុរួមប្រចាំ {selectedMonth} - {activeClass?.name} ({classStudents.length} នាក់)
            </h3>
            <p className="text-xs text-slate-500">
              បង្ហាញពិន្ទុគ្រប់មុខវិជ្ជា សរុប មធ្យមភាគ និងនិទ្ទេស
            </p>
          </div>

          <button
            onClick={handleExportGradeBook}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export តារាងពិន្ទុ Excel</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-2.5 px-2">ល.រ</th>
                <th className="py-2.5 px-2">អត្តលេខ</th>
                <th className="py-2.5 px-3">ឈ្មោះសិស្ស</th>
                <th className="py-2.5 px-2">ភេទ</th>
                {activeSubjects.map((s) => (
                  <th key={s.id} className="py-2.5 px-2 text-center truncate max-w-[80px]" title={s.name}>
                    {s.name}
                  </th>
                ))}
                <th className="py-2.5 px-2 text-center bg-amber-50 text-amber-900">សរុប</th>
                <th className="py-2.5 px-2 text-center bg-blue-50 text-blue-900 font-bold">មធ្យមភាគ</th>
                <th className="py-2.5 px-2 text-center bg-emerald-50 text-emerald-900">និទ្ទេស</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classGradesForMonth.length === 0 ? (
                <tr>
                  <td colSpan={activeSubjects.length + 7} className="py-8 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-1 opacity-30" />
                    មិនទាន់មានទិន្នន័យសិស្ស
                  </td>
                </tr>
              ) : (
                classGradesForMonth.map((item, idx) => {
                  const hasGrade = !!item.record;
                  return (
                    <tr
                      key={item.student.id}
                      onClick={() => setSelectedStudentId(item.student.id)}
                      className={`hover:bg-slate-50 cursor-pointer transition ${
                        item.student.id === currentStudent?.id ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-2 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-2 font-mono text-purple-700 font-medium">
                        {item.student.id}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {item.student.name}
                      </td>
                      <td className="py-2.5 px-2 text-slate-600">{item.student.gender}</td>

                      {activeSubjects.map((sub) => {
                        const score = item.record?.subjects?.[sub.name];
                        return (
                          <td key={sub.id} className="py-2.5 px-2 text-center font-mono">
                            {score !== undefined ? (
                              <span
                                className={
                                  score < 25
                                    ? 'text-rose-600 font-bold'
                                    : score >= 45
                                    ? 'text-emerald-600 font-bold'
                                    : 'text-slate-700'
                                }
                              >
                                {score}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-2 text-center font-bold font-mono bg-amber-50/50 text-amber-900">
                        {hasGrade ? item.record?.totalScore : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold font-mono bg-blue-50/50 text-blue-800">
                        {hasGrade ? item.record?.averageScore : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center bg-emerald-50/50">
                        {hasGrade ? (
                          <span className="font-semibold text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {item.record?.gradeLetter}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
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
