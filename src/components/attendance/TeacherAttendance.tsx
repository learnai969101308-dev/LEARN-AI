import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Calendar,
  Save,
  Clock,
  Download,
  CheckCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Teacher,
  TeacherAttendanceRecord,
  TeacherAttendanceStatus,
} from '../../types';
import { GRADE_9_SUBJECTS } from '../../services/sampleData';

interface TeacherAttendanceProps {
  teachers: Teacher[];
  attendanceRecords: TeacherAttendanceRecord[];
  onSaveBatchAttendance: (records: TeacherAttendanceRecord[]) => void;
}

export const TeacherAttendance: React.FC<TeacherAttendanceProps> = ({
  teachers,
  attendanceRecords,
  onSaveBatchAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // States per teacher: subject, checkIn, checkOut, status, note
  const [teacherRowState, setTeacherRowState] = useState<{
    [teacherId: string]: {
      subject: string;
      checkInTime: string;
      checkOutTime: string;
      status: TeacherAttendanceStatus;
      note: string;
    };
  }>({});

  // Populate state on date change or records change
  React.useEffect(() => {
    const newState: typeof teacherRowState = {};

    teachers.forEach((teacher) => {
      const match = attendanceRecords.find(
        (r) => r.date === selectedDate && r.teacherId === teacher.id
      );

      if (match) {
        newState[teacher.id] = {
          subject: match.subject || teacher.specialty || 'គណិតវិទ្យា',
          checkInTime: match.checkInTime || '07:00',
          checkOutTime: match.checkOutTime || '11:00',
          status: match.status || 'ទាន់ម៉ោង',
          note: match.note || '',
        };
      } else {
        newState[teacher.id] = {
          subject: teacher.specialty || 'គណិតវិទ្យា',
          checkInTime: '07:00',
          checkOutTime: '11:00',
          status: 'ទាន់ម៉ោង',
          note: '',
        };
      }
    });

    setTeacherRowState(newState);
  }, [selectedDate, teachers, attendanceRecords]);

  const updateTeacherRow = (
    teacherId: string,
    field: 'subject' | 'checkInTime' | 'checkOutTime' | 'status' | 'note',
    value: any
  ) => {
    setTeacherRowState((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [field]: value,
      },
    }));
  };

  // Mark all on time
  const handleMarkAllOnTime = () => {
    setTeacherRowState((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = {
          ...updated[id],
          status: 'ទាន់ម៉ោង',
        };
      });
      return updated;
    });
  };

  const handleSaveAttendance = () => {
    const recordsToSave: TeacherAttendanceRecord[] = teachers.map((teacher) => {
      const row = teacherRowState[teacher.id] || {
        subject: teacher.specialty || 'ទូទៅ',
        checkInTime: '07:00',
        checkOutTime: '11:00',
        status: 'ទាន់ម៉ោង',
        note: '',
      };

      const existing = attendanceRecords.find(
        (r) => r.date === selectedDate && r.teacherId === teacher.id
      );

      return {
        id: existing?.id || `ATT-T-${Date.now().toString().slice(-6)}-${teacher.id}`,
        date: selectedDate,
        teacherId: teacher.id,
        teacherName: teacher.name,
        subject: row.subject,
        checkInTime: row.checkInTime,
        checkOutTime: row.checkOutTime,
        status: row.status,
        note: row.note,
      };
    });

    onSaveBatchAttendance(recordsToSave);
    alert(`បានកត់ត្រាវត្តមានគ្រូបង្រៀនប្រចាំថ្ងៃ ${selectedDate} បានជោគជ័យ!`);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const rows = teachers.map((t, idx) => {
      const row = teacherRowState[t.id];
      return {
        'ល.រ': idx + 1,
        'កាលបរិច្ឆេទ': selectedDate,
        'អត្តលេខ': t.id,
        'គោត្តនាមនាម': t.name,
        'ភេទ': t.gender,
        'មុខវិជ្ជាបង្រៀន': row?.subject || t.specialty,
        'ម៉ោងចូល': row?.checkInTime || '',
        'ម៉ោងចេញ': row?.checkOutTime || '',
        'ស្ថានភាពវត្តមាន': row?.status || 'ទាន់ម៉ោង',
        'ចំណាំ': row?.note || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'វត្តមានគ្រូ');
    XLSX.writeFile(wb, `វត្តមានគ្រូ_${selectedDate}.xlsx`);
  };

  // Stats
  const stats = useMemo(() => {
    let onTime = 0;
    let late = 0;
    let permitted = 0;
    let noPerm = 0;
    let notSelected = 0;

    (Object.values(teacherRowState) as Array<{ status: TeacherAttendanceStatus }>).forEach((item) => {
      if (item.status === 'ទាន់ម៉ោង') onTime++;
      else if (item.status === 'យឺត') late++;
      else if (item.status === 'ច្បាប់') permitted++;
      else if (item.status === 'អត់ច្បាប់') noPerm++;
      else if (item.status === 'មិនជ្រើស') notSelected++;
    });

    return { onTime, late, permitted, noPerm, notSelected };
  }, [teacherRowState]);

  return (
    <div className="space-y-6">
      {/* Date Bar & Stats */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-rose-600">
            <Calendar className="w-5 h-5" />
            <label className="text-xs font-bold text-slate-700">កាលបរិច្ឆេទកត់វត្តមាន៖</label>
          </div>
          <input
            id="teacher-att-date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllOnTime}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>ទាន់ម៉ោងទាំងអស់</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Excel</span>
          </button>

          <button
            id="save-teacher-att-btn"
            onClick={handleSaveAttendance}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>រក្សាទុកវត្តមានគ្រូ</span>
          </button>
        </div>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
          <div className="text-[11px] text-slate-500">ទាន់ម៉ោង</div>
          <div className="text-xl font-bold text-emerald-600 mt-0.5">{stats.onTime} នាក់</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
          <div className="text-[11px] text-slate-500">យឺត</div>
          <div className="text-xl font-bold text-amber-600 mt-0.5">{stats.late} នាក់</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
          <div className="text-[11px] text-slate-500">ច្បាប់</div>
          <div className="text-xl font-bold text-blue-600 mt-0.5">{stats.permitted} នាក់</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
          <div className="text-[11px] text-slate-500">អត់ច្បាប់</div>
          <div className="text-xl font-bold text-rose-600 mt-0.5">{stats.noPerm} នាក់</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
          <div className="text-[11px] text-slate-500">មិនជ្រើស</div>
          <div className="text-xl font-bold text-slate-500 mt-0.5">{stats.notSelected} នាក់</div>
        </div>
      </div>

      {/* Teacher Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">
            បញ្ជីវត្តមានគ្រូបង្រៀន (គ្រូអូតូពីប្រព័ន្ធ - {teachers.length} នាក់)
          </h3>
          <p className="text-xs text-slate-500">
            កំណត់ម៉ោងចូល-ចេញ និងស្ថានភាពវត្តមាន (យឺត, ទាន់ម៉ោង, ច្បាប់, អត់ច្បាប់, មិនជ្រើស)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-rose-50/70 text-rose-950 border-b border-rose-100 font-semibold">
                <th className="py-3 px-3">គ្រូអូតូ (អត្តលេខ & ឈ្មោះ)</th>
                <th className="py-3 px-3">ជ្រើសរើសមុខវិជ្ជា</th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>ម៉ោងចូល</span>
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>ម៉ោងចេញ</span>
                  </div>
                </th>
                <th className="py-3 px-4">
                  ជ្រើសរើសស្ថានភាព (យឺត, ទាន់ម៉ោង, ច្បាប់, អត់ច្បាប់, មិនជ្រើស)
                </th>
                <th className="py-3 px-3">ចំណាំ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.map((teacher) => {
                const row = teacherRowState[teacher.id] || {
                  subject: teacher.specialty,
                  checkInTime: '07:00',
                  checkOutTime: '11:00',
                  status: 'ទាន់ម៉ោង' as TeacherAttendanceStatus,
                  note: '',
                };

                return (
                  <tr key={teacher.id} className="hover:bg-slate-50/70">
                    {/* គ្រូអូតូ */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {teacher.image ? (
                          <img
                            src={teacher.image}
                            alt={teacher.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                            {teacher.gender === 'ស្រី' ? 'អ' : 'ល'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-800">{teacher.name}</div>
                          <div className="font-mono text-[11px] text-rose-700">
                            {teacher.id} • {teacher.gender}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ជ្រើសរើសមុខវិជ្ជា */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={row.subject}
                        onChange={(e) => updateTeacherRow(teacher.id, 'subject', e.target.value)}
                        placeholder="មុខវិជ្ជាបង្រៀន"
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:ring-1 focus:ring-rose-500 w-36"
                      />
                    </td>

                    {/* ម៉ោងចូល */}
                    <td className="py-3 px-3">
                      <input
                        type="time"
                        value={row.checkInTime}
                        onChange={(e) =>
                          updateTeacherRow(teacher.id, 'checkInTime', e.target.value)
                        }
                        className="px-2 py-1 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-800 bg-white"
                      />
                    </td>

                    {/* ម៉ោងចេញ */}
                    <td className="py-3 px-3">
                      <input
                        type="time"
                        value={row.checkOutTime}
                        onChange={(e) =>
                          updateTeacherRow(teacher.id, 'checkOutTime', e.target.value)
                        }
                        className="px-2 py-1 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-800 bg-white"
                      />
                    </td>

                    {/* ជ្រើសរើស(យឺត ,ទាន់ម៉ោង,ច្បាប់,អត់ច្បាប់,មិនជ្រើស) */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(
                          ['យឺត', 'ទាន់ម៉ោង', 'ច្បាប់', 'អត់ច្បាប់', 'មិនជ្រើស'] as TeacherAttendanceStatus[]
                        ).map((statusOption) => {
                          const isSelected = row.status === statusOption;
                          return (
                            <button
                              key={statusOption}
                              type="button"
                              onClick={() => updateTeacherRow(teacher.id, 'status', statusOption)}
                              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                                isSelected
                                  ? statusOption === 'ទាន់ម៉ោង'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : statusOption === 'យឺត'
                                    ? 'bg-amber-600 text-white shadow-2xs'
                                    : statusOption === 'ច្បាប់'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : statusOption === 'អត់ច្បាប់'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'bg-slate-700 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {statusOption}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* ចំណាំ */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="មូលហេតុ/ចំណាំ..."
                        value={row.note}
                        onChange={(e) => updateTeacherRow(teacher.id, 'note', e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded text-xs text-slate-700 w-32"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
