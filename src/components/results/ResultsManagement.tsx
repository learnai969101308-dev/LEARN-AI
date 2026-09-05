import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Calendar,
  Download,
  Printer,
  Medal,
  TrendingUp,
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

interface ResultsManagementProps {
  students: Student[];
  classes: SchoolClass[];
  grades: StudentGradeRecord[];
}

export const ResultsManagement: React.FC<ResultsManagementProps> = ({
  students,
  classes,
  grades,
}) => {
  // Tab: 'monthly' (តារាងមធ្យមភាគប្រចាំខែ) or 'semester' (តារាងមធ្យមភាគប្រចាំឆមាស)
  const [activeTab, setActiveTab] = useState<'monthly' | 'semester'>('monthly');

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<AcademicMonth>('ខែធ្នូ');
  const [selectedSemester, setSelectedSemester] = useState<'ឆមាសទី ១' | 'ឆមាសទី ២'>('ឆមាសទី ១');

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const isGrade9 = activeClass?.level === 9 || activeClass?.name?.includes('៩');
  const subjects = isGrade9 ? GRADE_9_SUBJECTS : GRADE_1_8_SUBJECTS;

  // Students in class
  const classStudents = useMemo(() => {
    return students.filter(
      (s) => s.grade === activeClass?.name || activeClass?.studentIds?.includes(s.id)
    );
  }, [students, activeClass]);

  // Monthly Results Calculations
  const monthlyResults = useMemo(() => {
    const rows = classStudents.map((student) => {
      const rec = grades.find(
        (g) =>
          g.studentId === student.id &&
          g.month === selectedMonth &&
          (g.gradeClass === activeClass?.name || g.gradeClass === student.grade)
      );

      const total = rec?.totalScore || 0;
      const avg = rec?.averageScore || 0;
      const letter = rec?.gradeLetter || (avg >= 25 ? 'មធ្យម (D)' : 'ធ្លាក់ (F)');
      const isPassed = avg >= 25; // standard 50% passing threshold (out of 50)

      return {
        student,
        record: rec,
        total,
        avg,
        letter,
        isPassed,
      };
    });

    // Sort by average descending to compute rank
    const sorted = [...rows].sort((a, b) => b.avg - a.avg);
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [classStudents, grades, selectedMonth, activeClass]);

  // Semester Results Calculations
  const semesterMonths =
    selectedSemester === 'ឆមាសទី ១'
      ? ['ខែវិច្ឆិកា', 'ខែធ្នូ', 'ខែមករា', 'ខែកុម្ភៈ']
      : ['ខែមីនា', 'ខែមេសា', 'ខែឧសភា', 'ខែមិថុនា'];

  const semesterResults = useMemo(() => {
    const rows = classStudents.map((student) => {
      // Find all records for this student in the semester months
      const studentSemesterGrades = grades.filter(
        (g) =>
          g.studentId === student.id &&
          semesterMonths.includes(g.month) &&
          (g.gradeClass === activeClass?.name || g.gradeClass === student.grade)
      );

      const monthAverages = semesterMonths.map((m) => {
        const found = studentSemesterGrades.find((g) => g.month === m);
        return {
          month: m,
          avg: found?.averageScore ?? 0,
        };
      });

      const validAverages = monthAverages.filter((m) => m.avg > 0);
      const semesterAvg =
        validAverages.length > 0
          ? Number(
              (
                validAverages.reduce((acc, curr) => acc + curr.avg, 0) /
                validAverages.length
              ).toFixed(2)
            )
          : 0;

      let letter = 'ខ្សោយ (F)';
      if (semesterAvg >= 45) letter = 'ល្អប្រសើរ (A)';
      else if (semesterAvg >= 40) letter = 'ល្អណាស់ (B)';
      else if (semesterAvg >= 35) letter = 'ល្អ (C)';
      else if (semesterAvg >= 30) letter = 'មធ្យម (D)';
      else if (semesterAvg >= 25) letter = 'ខ្សោយ (E)';

      const isPassed = semesterAvg >= 25;

      return {
        student,
        monthAverages,
        semesterAvg,
        letter,
        isPassed,
      };
    });

    // Sort descending by semester average to calculate ranks
    const sorted = [...rows].sort((a, b) => b.semesterAvg - a.semesterAvg);
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [classStudents, grades, semesterMonths, activeClass]);

  // Monthly Stats
  const monthlyStats = useMemo(() => {
    if (monthlyResults.length === 0) return { passed: 0, failed: 0, classAvg: 0, maxScore: 0 };
    const passed = monthlyResults.filter((r) => r.isPassed).length;
    const failed = monthlyResults.length - passed;
    const sumAvg = monthlyResults.reduce((acc, curr) => acc + curr.avg, 0);
    const classAvg = Number((sumAvg / monthlyResults.length).toFixed(2));
    const maxScore = Math.max(...monthlyResults.map((r) => r.avg));
    return { passed, failed, classAvg, maxScore };
  }, [monthlyResults]);

  // Export Monthly Table to Excel
  const handleExportMonthly = () => {
    const rows = monthlyResults.map((item) => ({
      'ចំណាត់ថ្នាក់': `លេខ ${item.rank}`,
      'អត្តលេខ': item.student.id,
      'គោត្តនាម-នាម': item.student.name,
      'ភេទ': item.student.gender,
      'ពិន្ទុសរុប': item.total,
      'មធ្យមភាគ': item.avg,
      'និទ្ទេស': item.letter,
      'លទ្ធផល': item.isPassed ? 'ជាប់' : 'ធ្លាក់',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `លទ្ធផល_${selectedMonth}`);
    XLSX.writeFile(wb, `លទ្ធផលប្រចាំខែ_${activeClass.name}_${selectedMonth}.xlsx`);
  };

  // Export Semester Table to Excel
  const handleExportSemester = () => {
    const rows = semesterResults.map((item) => {
      const row: Record<string, any> = {
        'ចំណាត់ថ្នាក់': `លេខ ${item.rank}`,
        'អត្តលេខ': item.student.id,
        'គោត្តនាម-នាម': item.student.name,
        'ភេទ': item.student.gender,
      };

      item.monthAverages.forEach((m) => {
        row[m.month] = m.avg || '-';
      });

      row['មធ្យមភាគឆមាស'] = item.semesterAvg;
      row['និទ្ទេស'] = item.letter;
      row['លទ្ធផល'] = item.isPassed ? 'ជាប់' : 'ធ្លាក់';
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, selectedSemester);
    XLSX.writeFile(wb, `លទ្ធផល_${selectedSemester}_${activeClass.name}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher: តារាងមធ្យមភាគប្រចាំខែ vs តារាងមធ្យមភាគប្រចាំឆមាស */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2">
        <button
          id="tab-monthly-results"
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'monthly'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>១. តារាងមធ្យមភាគប្រចាំខែ (Monthly Average)</span>
        </button>

        <button
          id="tab-semester-results"
          onClick={() => setActiveTab('semester')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'semester'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>២. តារាងមធ្យមភាគប្រចាំឆមាស (Semester Average)</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              ជ្រើសរើសថ្នាក់
            </label>
            <select
              id="result-class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month or Semester Select */}
          {activeTab === 'monthly' ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                ជ្រើសរើសខែ
              </label>
              <select
                id="result-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value as AcademicMonth)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {ACADEMIC_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                ជ្រើសរើសឆមាស
              </label>
              <select
                id="result-semester-select"
                value={selectedSemester}
                onChange={(e) =>
                  setSelectedSemester(e.target.value as 'ឆមាសទី ១' | 'ឆមាសទី ២')
                }
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="ឆមាសទី ១">ឆមាសទី ១ (វិច្ឆិកា ដល់ កុម្ភៈ)</option>
                <option value="ឆមាសទី ២">ឆមាសទី ២ (មីនា ដល់ មិថុនា)</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>បោះពុម្ព (Print)</span>
          </button>

          <button
            id="export-results-excel-btn"
            onClick={activeTab === 'monthly' ? handleExportMonthly : handleExportSemester}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Top 3 Honor Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeTab === 'monthly' ? (
          monthlyResults.slice(0, 3).map((item, idx) => {
            const medalColors = [
              'bg-amber-100 text-amber-800 border-amber-300',
              'bg-slate-100 text-slate-800 border-slate-300',
              'bg-orange-100 text-orange-800 border-orange-300',
            ];
            const medalLabels = ['លេខ ១ (Gold)', 'លេខ ២ (Silver)', 'លេខ ៣ (Bronze)'];

            return (
              <div
                key={item.student.id}
                className={`p-4 rounded-xl border bg-white shadow-2xs relative overflow-hidden ${
                  idx === 0 ? 'border-amber-300' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${medalColors[idx]}`}
                  >
                    {medalLabels[idx]}
                  </span>
                  <Medal
                    className={`w-5 h-5 ${
                      idx === 0
                        ? 'text-amber-500'
                        : idx === 1
                        ? 'text-slate-400'
                        : 'text-orange-500'
                    }`}
                  />
                </div>
                <div className="mt-3">
                  <div className="text-base font-bold text-slate-900">{item.student.name}</div>
                  <div className="text-xs text-slate-500">
                    {item.student.id} • {item.student.gender} • {activeClass.name}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">មធ្យមភាគ៖</span>
                  <span className="text-base font-extrabold text-indigo-700">{item.avg}</span>
                </div>
              </div>
            );
          })
        ) : (
          semesterResults.slice(0, 3).map((item, idx) => {
            const medalLabels = ['លេខ ១ (Gold)', 'លេខ ២ (Silver)', 'លេខ ៣ (Bronze)'];
            return (
              <div
                key={item.student.id}
                className="p-4 rounded-xl border border-indigo-200 bg-white shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {medalLabels[idx]}
                  </span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-3">
                  <div className="text-base font-bold text-slate-900">{item.student.name}</div>
                  <div className="text-xs text-slate-500">
                    {item.student.id} • {item.student.gender}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">មធ្យមភាគឆមាស៖</span>
                  <span className="text-base font-extrabold text-indigo-700">{item.semesterAvg}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {activeTab === 'monthly'
                ? `តារាងមធ្យមភាគប្រចាំ ${selectedMonth} - ${activeClass.name}`
                : `តារាងមធ្យមភាគប្រចាំ ${selectedSemester} - ${activeClass.name}`}
            </h3>
            <p className="text-xs text-slate-500">
              រៀបលំដាប់តាមចំណាត់ថ្នាក់ពីពិន្ទុខ្ពស់ទៅទាប
            </p>
          </div>

          {activeTab === 'monthly' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                ជាប់៖ {monthlyStats.passed} នាក់
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium">
                ធ្លាក់៖ {monthlyStats.failed} នាក់
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                មធ្យមភាគរួម៖ {monthlyStats.classAvg}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'monthly' ? (
            /* TAB 1: Monthly Table */
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <th className="py-3 px-3 text-center">ចំណាត់ថ្នាក់</th>
                  <th className="py-3 px-3">អត្តលេខ</th>
                  <th className="py-3 px-3">គោត្តនាម-នាម</th>
                  <th className="py-3 px-3">ភេទ</th>
                  <th className="py-3 px-3 text-right">ពិន្ទុសរុប</th>
                  <th className="py-3 px-3 text-right font-bold text-indigo-900 bg-indigo-50/50">
                    មធ្យមភាគ
                  </th>
                  <th className="py-3 px-3 text-center">និទ្ទេស</th>
                  <th className="py-3 px-3 text-center">លទ្ធផល</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyResults.map((item) => (
                  <tr key={item.student.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
                          item.rank === 1
                            ? 'bg-amber-100 text-amber-800'
                            : item.rank === 2
                            ? 'bg-slate-200 text-slate-800'
                            : item.rank === 3
                            ? 'bg-orange-100 text-orange-800'
                            : 'text-slate-600'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-700">
                      {item.student.id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {item.student.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{item.student.gender}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">
                      {item.total}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-indigo-700 bg-indigo-50/20 text-sm">
                      {item.avg}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] border border-emerald-100">
                        {item.letter}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.isPassed ? 'ជាប់' : 'ធ្លាក់'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* TAB 2: Semester Table */
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <th className="py-3 px-3 text-center">ចំណាត់ថ្នាក់</th>
                  <th className="py-3 px-3">អត្តលេខ</th>
                  <th className="py-3 px-3">គោត្តនាម-នាម</th>
                  <th className="py-3 px-3">ភេទ</th>
                  {semesterMonths.map((m) => (
                    <th key={m} className="py-3 px-3 text-center">
                      {m}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right font-bold text-indigo-900 bg-indigo-50">
                    មធ្យមភាគឆមាស
                  </th>
                  <th className="py-3 px-3 text-center">និទ្ទេស</th>
                  <th className="py-3 px-3 text-center">លទ្ធផល</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {semesterResults.map((item) => (
                  <tr key={item.student.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
                          item.rank <= 3
                            ? 'bg-amber-100 text-amber-800'
                            : 'text-slate-600'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-700">
                      {item.student.id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {item.student.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{item.student.gender}</td>

                    {item.monthAverages.map((m) => (
                      <td key={m.month} className="py-3 px-3 text-center font-mono">
                        {m.avg > 0 ? (
                          <span>{m.avg}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    ))}

                    <td className="py-3 px-3 text-right font-mono font-extrabold text-indigo-700 bg-indigo-50/40 text-sm">
                      {item.semesterAvg}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] border border-emerald-100">
                        {item.letter}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.isPassed ? 'ជាប់' : 'ធ្លាក់'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
