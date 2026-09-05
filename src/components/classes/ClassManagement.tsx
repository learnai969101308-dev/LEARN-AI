import React, { useState } from 'react';
import {
  School,
  Plus,
  ArrowRightLeft,
  UserPlus,
  Trash2,
  X,
  UserMinus,
} from 'lucide-react';
import { SchoolClass, Student, Teacher } from '../../types';

interface ClassManagementProps {
  classes: SchoolClass[];
  students: Student[];
  teachers: Teacher[];
  onAddClass: (newClass: SchoolClass) => void;
  onUpdateClass: (updatedClass: SchoolClass) => void;
  onDeleteClass: (classId: string) => void;
  onTransferStudent: (studentId: string, fromClassId: string, toClassId: string) => void;
  onEnrollStudentToClass: (studentId: string, classId: string) => void;
  onRemoveStudentFromClass: (studentId: string, classId: string) => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  classes,
  students,
  teachers,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onTransferStudent,
  onEnrollStudentToClass,
  onRemoveStudentFromClass,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [transferModalStudent, setTransferModalStudent] = useState<Student | null>(null);
  const [targetTransferClassId, setTargetTransferClassId] = useState('');

  // Form State for Adding Class
  const [newClassData, setNewClassData] = useState({
    name: '',
    level: 7,
    academicYear: '2025-2026',
    roomNumber: 'បន្ទប់ ១០៣',
    homeroomTeacherId: teachers[0]?.id || '',
    description: '',
  });

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Students currently in the selected class (either in activeClass.studentIds or student.grade === activeClass.name)
  const classStudents = students.filter(
    (s) => s.grade === activeClass?.name || activeClass?.studentIds?.includes(s.id)
  );

  // Students not in this class
  const availableStudentsToEnroll = students.filter(
    (s) => s.grade !== activeClass?.name && !activeClass?.studentIds?.includes(s.id)
  );

  const femaleCount = classStudents.filter((s) => s.gender === 'ស្រី').length;
  const maleCount = classStudents.filter((s) => s.gender === 'ប្រុស').length;

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassData.name.trim()) return;

    const id = `cls-${newClassData.level}-${Date.now().toString().slice(-4)}`;
    const newCls: SchoolClass = {
      id,
      name: newClassData.name.trim(),
      level: Number(newClassData.level),
      academicYear: newClassData.academicYear,
      roomNumber: newClassData.roomNumber,
      homeroomTeacherId: newClassData.homeroomTeacherId,
      studentIds: [],
      description: newClassData.description,
    };

    onAddClass(newCls);
    setSelectedClassId(id);
    setIsAddClassModalOpen(false);
  };

  const handleExecuteTransfer = () => {
    if (!transferModalStudent || !targetTransferClassId) return;
    onTransferStudent(transferModalStudent.id, activeClass.id, targetTransferClassId);
    setTransferModalStudent(null);
  };

  const homeroomTeacher = teachers.find((t) => t.id === activeClass?.homeroomTeacherId);

  return (
    <div className="space-y-6">
      {/* Top Selector and Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-purple-600" />
            <label className="text-xs font-semibold text-slate-700">ជ្រើសរើសថ្នាក់រៀន៖</label>
          </div>
          <select
            id="class-selector"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-purple-500 focus:outline-none min-w-[180px]"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.roomNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="enroll-student-to-class-btn"
            onClick={() => setIsEnrollModalOpen(true)}
            disabled={!activeClass}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-medium transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>ទាញសិស្សចូលថ្នាក់នេះ</span>
          </button>

          <button
            id="add-new-class-btn"
            onClick={() => setIsAddClassModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>បង្កើតថ្នាក់ថ្មី</span>
          </button>
        </div>
      </div>

      {activeClass && (
        <>
          {/* Class Summary Banner */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-purple-100">
                  កម្រិតថ្នាក់ទី {activeClass.level} • {activeClass.academicYear}
                </span>
                <h2 className="text-2xl font-bold mt-2">{activeClass.name}</h2>
                <p className="text-xs text-purple-200 mt-1">
                  {activeClass.roomNumber} • {activeClass.description || 'ថ្នាក់រៀនចំណេះទូទៅ'}
                </p>
                {homeroomTeacher && (
                  <p className="text-xs text-purple-100 mt-2 flex items-center gap-1.5">
                    <span className="opacity-75">គ្រូបន្ទុកថ្នាក់៖</span>
                    <span className="font-semibold underline underline-offset-2">
                      {homeroomTeacher.name} ({homeroomTeacher.specialty})
                    </span>
                  </p>
                )}
              </div>

              {/* Class Counts */}
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-3 rounded-xl text-center min-w-[90px]">
                  <div className="text-xs text-purple-200">សិស្សសរុប</div>
                  <div className="text-2xl font-bold">{classStudents.length}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-3 rounded-xl text-center min-w-[90px]">
                  <div className="text-xs text-purple-200">សិស្សស្រី</div>
                  <div className="text-2xl font-bold text-pink-300">{femaleCount}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-3 rounded-xl text-center min-w-[90px]">
                  <div className="text-xs text-purple-200">សិស្សប្រុស</div>
                  <div className="text-2xl font-bold text-blue-300">{maleCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Students Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  បញ្ជីសិស្សក្នុង {activeClass.name} ({classStudents.length} នាក់)
                </h3>
                <p className="text-xs text-slate-500">
                  គ្រប់គ្រងសិស្សក្នុងថ្នាក់ ឬផ្ទេរសិស្សចេញទៅថ្នាក់ផ្សេង
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
                    <th className="py-3 px-3">គោត្តនាម-នាម</th>
                    <th className="py-3 px-3">ភេទ</th>
                    <th className="py-3 px-3">ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th className="py-3 px-3">លេខទូរស័ព្ទ</th>
                    <th className="py-3 px-3">ស្ថានភាព</th>
                    <th className="py-3 px-3 text-right">ផ្ទេរសិស្ស / ដកចេញ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        ថ្នាក់នេះមិនទាន់មានសិស្សនៅឡើយទេ! សូមចុច &quot;ទាញសិស្សចូលថ្នាក់នេះ&quot; ខាងលើ។
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-mono font-medium text-purple-700">
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
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[11px]">
                              {student.gender === 'ស្រី' ? 'ក' : 'ខ'}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">{student.name}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] ${
                              student.gender === 'ស្រី'
                                ? 'bg-pink-50 text-pink-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {student.gender}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{student.dob}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {student.phoneNumber || '-'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-medium">
                            {student.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* ផ្ទេរសិស្សចេញ */}
                            <button
                              id={`transfer-student-${student.id}`}
                              onClick={() => {
                                setTransferModalStudent(student);
                                setTargetTransferClassId(
                                  classes.find((c) => c.id !== activeClass.id)?.id || ''
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-medium transition"
                              title="ផ្ទេរសិស្សចេញទៅថ្នាក់ផ្សេង"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>ផ្ទេរសិស្ស</span>
                            </button>

                            {/* ដកសិស្សចេញពីថ្នាក់ */}
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `តើអ្នកចង់ដកសិស្ស "${student.name}" ចេញពីថ្នាក់ ${activeClass.name} មែនទេ?`
                                  )
                                ) {
                                  onRemoveStudentFromClass(student.id, activeClass.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                              title="ដកចេញពីថ្នាក់"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: Add New Class */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">បង្កើតថ្នាក់រៀនថ្មី</h3>
              <button
                onClick={() => setIsAddClassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ឈ្មោះថ្នាក់ (Class Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ថ្នាក់ទី ៧គ ឬ ថ្នាក់ទី ៩ខ"
                  value={newClassData.name}
                  onChange={(e) => setNewClassData({ ...newClassData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    កម្រិតថ្នាក់ (១-៩)
                  </label>
                  <select
                    value={newClassData.level}
                    onChange={(e) =>
                      setNewClassData({ ...newClassData, level: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        ថ្នាក់ទី {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">លេខបន្ទប់</label>
                  <input
                    type="text"
                    value={newClassData.roomNumber}
                    onChange={(e) =>
                      setNewClassData({ ...newClassData, roomNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  គ្រូបន្ទុកថ្នាក់ (Homeroom Teacher)
                </label>
                <select
                  value={newClassData.homeroomTeacherId}
                  onChange={(e) =>
                    setNewClassData({ ...newClassData, homeroomTeacherId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">-- មិនទាន់ចាត់តាំង --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">ការពិពណ៌នា</label>
                <textarea
                  rows={2}
                  value={newClassData.description}
                  onChange={(e) =>
                    setNewClassData({ ...newClassData, description: e.target.value })
                  }
                  placeholder="ឧ. វេនព្រឹក ឬ វេនរសៀល..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
                >
                  បង្កើតថ្នាក់
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll / Pull Students into this Class */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  ទាញសិស្សចូល {activeClass.name}
                </h3>
                <p className="text-xs text-slate-500">ជ្រើសរើសសិស្សដែលចង់បញ្ជូនចូលថ្នាក់នេះ</p>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {availableStudentsToEnroll.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  មិនមានសិស្សក្រៅពីថ្នាក់នេះដើម្បីទាញចូលទេ!
                </div>
              ) : (
                availableStudentsToEnroll.map((student) => (
                  <div
                    key={student.id}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-purple-300 bg-slate-50/50 flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {student.name} ({student.gender})
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {student.id} • ថ្នាក់បច្ចុប្បន្ន៖{' '}
                        <span className="text-purple-600">{student.grade}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onEnrollStudentToClass(student.id, activeClass.id);
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium text-xs transition shadow-2xs"
                    >
                      + ទាញចូល
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
              >
                រួចរាល់
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Transfer Student to another Class */}
      {transferModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">ផ្ទេរសិស្សចេញ</h3>
              <button
                onClick={() => setTransferModalStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[11px]">ព័ត៌មានសិស្សត្រូវផ្ទេរ៖</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {transferModalStudent.name} ({transferModalStudent.gender})
                </p>
                <p className="text-[11px] text-slate-500">
                  {transferModalStudent.id} • ថ្នាក់បច្ចុប្បន្ន៖{' '}
                  <span className="font-semibold text-purple-700">{activeClass.name}</span>
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ជ្រើសរើសថ្នាក់ដែលត្រូវផ្ទេរទៅ *
                </label>
                <select
                  value={targetTransferClassId}
                  onChange={(e) => setTargetTransferClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-xs font-semibold"
                >
                  {classes
                    .filter((c) => c.id !== activeClass.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.roomNumber})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setTransferModalStudent(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs hover:bg-slate-50"
              >
                បោះបង់
              </button>
              <button
                onClick={handleExecuteTransfer}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-xs shadow-xs"
              >
                បញ្ជាក់ការផ្ទេរសិស្ស
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
