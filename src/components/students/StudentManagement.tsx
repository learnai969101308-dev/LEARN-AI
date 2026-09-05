import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student } from '../../types';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onBatchAddStudents: (newStudents: Student[]) => void;
  classList: string[];
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBatchAddStudents,
  classList,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    id: '',
    name: '',
    gender: 'ប្រុស',
    dob: '',
    grade: classList[0] || 'ថ្នាក់ទី ៧ក',
    motherName: '',
    fatherName: '',
    address: '',
    phoneNumber: '',
    image: '',
    status: 'កំពុងរៀន',
  });

  const generateAutoId = () => {
    const year = new Date().getFullYear();
    const count = students.length + 1;
    const pad = String(count).padStart(3, '0');
    return `STU-${year}-${pad}`;
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      id: generateAutoId(),
      name: '',
      gender: 'ប្រុស',
      dob: '2013-01-01',
      grade: classList[0] || 'ថ្នាក់ទី ៧ក',
      motherName: '',
      fatherName: '',
      address: '',
      phoneNumber: '',
      image: '',
      status: 'កំពុងរៀន',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const studentToSave: Student = {
      id: formData.id || generateAutoId(),
      name: formData.name.trim(),
      gender: formData.gender as 'ប្រុស' | 'ស្រី',
      dob: formData.dob || '2013-01-01',
      grade: formData.grade || classList[0] || 'ថ្នាក់ទី ៧ក',
      motherName: formData.motherName || '',
      fatherName: formData.fatherName || '',
      address: formData.address || '',
      phoneNumber: formData.phoneNumber || '',
      image: formData.image || '',
      status: formData.status as Student['status'] || 'កំពុងរៀន',
      createdAt: editingStudent?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingStudent) {
      onUpdateStudent(studentToSave);
    } else {
      onAddStudent(studentToSave);
    }
    setIsModalOpen(false);
  };

  // Excel Export
  const handleExportExcel = () => {
    const exportData = filteredStudents.map((s, idx) => ({
      'ល.រ': idx + 1,
      'អត្តលេខ (ID)': s.id,
      'គោត្តនាម-នាម': s.name,
      'ភេទ': s.gender,
      'ថ្ងៃខែឆ្នាំកំណើត': s.dob,
      'ថ្នាក់រៀន': s.grade,
      'ឈ្មោះម្តាយ': s.motherName,
      'ឈ្មោះឪពុក': s.fatherName,
      'អាសយដ្ឋាន': s.address,
      'លេខទូរស័ព្ទ': s.phoneNumber,
      'ស្ថានភាព': s.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'បញ្ជីសិស្ស');
    XLSX.writeFile(wb, `បញ្ជីសិស្ស_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Excel Import
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        const newStudents: Student[] = rawRows.map((row, index) => {
          const autoId = `STU-IMP-${String(students.length + index + 1).padStart(3, '0')}`;
          return {
            id: row['អត្តលេខ (ID)'] || row['ID'] || row['id'] || autoId,
            name: row['គោត្តនាម-នាម'] || row['ឈ្មោះ'] || row['Name'] || row['name'] || `សិស្សថ្មី ${index + 1}`,
            gender: row['ភេទ'] === 'ស្រី' || row['gender'] === 'ស្រី' || row['Gender'] === 'Female' ? 'ស្រី' : 'ប្រុស',
            dob: row['ថ្ងៃខែឆ្នាំកំណើត'] || row['DOB'] || '2013-01-01',
            grade: row['ថ្នាក់រៀន'] || row['Grade'] || classList[0] || 'ថ្នាក់ទី ៧ក',
            motherName: row['ឈ្មោះម្តាយ'] || row['Mother'] || '',
            fatherName: row['ឈ្មោះឪពុក'] || row['Father'] || '',
            address: row['អាសយដ្ឋាន'] || row['Address'] || '',
            phoneNumber: String(row['លេខទូរស័ព្ទ'] || row['Phone'] || ''),
            image: row['រូបថត'] || '',
            status: (row['ស្ថានភាព'] || 'កំពុងរៀន') as Student['status'],
            createdAt: new Date().toISOString().split('T')[0],
          };
        });

        if (newStudents.length > 0) {
          onBatchAddStudents(newStudents);
          alert(`បានបញ្ចូលសិស្សចំនួន ${newStudents.length} នាក់ដោយជោគជ័យពី Excel!`);
        }
      } catch (err) {
        console.error('Error parsing excel:', err);
        alert('មានបញ្ហាក្នុងការអានឯកសារ Excel សូមពិនិត្យមើលទម្រង់តារាង!');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phoneNumber.includes(searchTerm);
    const matchesGrade = selectedGrade === 'all' || s.grade === selectedGrade;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const femaleCount = students.filter((s) => s.gender === 'ស្រី').length;
  const maleCount = students.filter((s) => s.gender === 'ប្រុស').length;
  const activeCount = students.filter((s) => s.status === 'កំពុងរៀន').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 shrink-0">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">សិស្សសរុប</p>
          <p className="text-2xl font-bold mt-1 text-slate-900">{students.length}</p>
          <div className="mt-2 flex items-center text-[10px] text-indigo-600">ក្នុងប្រព័ន្ធគ្រប់គ្រង</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">សិស្សស្រី</p>
          <p className="text-2xl font-bold mt-1 text-pink-600">{femaleCount}</p>
          <div className="mt-2 flex items-center text-[10px] text-pink-600">ស្មើ {students.length ? Math.round((femaleCount / students.length) * 100) : 0}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">សិស្សប្រុស</p>
          <p className="text-2xl font-bold mt-1 text-indigo-600">{maleCount}</p>
          <div className="mt-2 flex items-center text-[10px] text-indigo-600">ស្មើ {students.length ? Math.round((maleCount / students.length) * 100) : 0}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">កំពុងរៀន</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{activeCount}</p>
          <div className="mt-2 flex items-center text-[10px] text-emerald-600">សកម្មក្នុងថ្នាក់</div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 items-center flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="student-search-input"
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ, ID, លេខទូរស័ព្ទ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          <select
            id="student-grade-filter"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">គ្រប់ថ្នាក់រៀន</option>
            {classList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            id="student-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">គ្រប់ស្ថានភាព</option>
            <option value="កំពុងរៀន">កំពុងរៀន</option>
            <option value="ផ្អាកការសិក្សា">ផ្អាកការសិក្សា</option>
            <option value="បោះបង់">បោះបង់</option>
            <option value="ផ្ទេរចេញ">ផ្ទេរចេញ</option>
            <option value="បញ្ចប់ការសិក្សា">បញ្ចប់ការសិក្សា</option>
          </select>
        </div>

        {/* Buttons: Add Student, Import/Export Excel */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            id="student-import-excel-btn"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50 text-xs font-medium transition shadow-xs"
            title="បញ្ចូលសិស្សពីឯកសារ Excel"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Upload Excel</span>
          </button>

          <button
            id="student-export-excel-btn"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-xs"
            title="ទាញបញ្ជីសិស្សជា Excel"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export Excel</span>
          </button>

          <button
            id="student-add-btn"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ បន្ថែមសិស្សថ្មី</span>
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-slate-500 border-b border-slate-200 text-xs font-semibold">
                <th className="px-6 py-3">អត្តលេខ</th>
                <th className="px-6 py-3">រូបថត</th>
                <th className="px-6 py-3">ឈ្មោះសិស្ស</th>
                <th className="px-6 py-3">ភេទ</th>
                <th className="px-6 py-3">ថ្ងៃខែឆ្នាំកំណើត</th>
                <th className="px-6 py-3">ថ្នាក់</th>
                <th className="px-6 py-3">ម្តាយ / ឪពុក</th>
                <th className="px-6 py-3">លេខទូរស័ព្ទ</th>
                <th className="px-6 py-3 text-center">ស្ថានភាព</th>
                <th className="px-6 py-3 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    មិនមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs font-medium text-indigo-600">
                      {student.id}
                    </td>
                    <td className="px-6 py-3">
                      {student.image ? (
                        <img
                          src={student.image}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {student.gender === 'ស្រី' ? 'ក' : 'ខ'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {student.gender}
                    </td>
                    <td className="px-6 py-3 text-slate-500">{student.dob}</td>
                    <td className="px-6 py-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-700">
                        {student.grade}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">
                      <div>{student.motherName || '-'}</div>
                      <div className="text-[10px] text-slate-400">{student.fatherName || '-'}</div>
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-500 text-xs">{student.phoneNumber || '-'}</td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          student.status === 'កំពុងរៀន'
                            ? 'bg-emerald-100 text-emerald-700'
                            : student.status === 'ផ្ទេរចេញ'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingStudent(student)}
                          className="text-slate-400 hover:text-slate-600 transition"
                          title="មើលព័ត៌មានលម្អិត"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="text-indigo-600 font-medium hover:underline text-xs"
                        >
                          កែប្រែ
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`តើអ្នកពិតជាចង់លុបសិស្ស "${student.name}" មែនទេ?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 transition"
                          title="លុប"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Create / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingStudent ? 'កែសម្រួលព័ត៌មានសិស្ស' : 'បន្ថែមសិស្សថ្មី (កាឡោនទាំង១១)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* ID អូតូ */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ID អូតូ (Auto ID)
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      required
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, id: generateAutoId() })}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px]"
                      title="បង្កើត ID ស្វ័យប្រវត្តិ"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    គោត្តនាម-នាម *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឈ្មោះសិស្ស"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ភេទ</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as 'ប្រុស' | 'ស្រី' })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="ប្រុស">ប្រុស</option>
                    <option value="ស្រី">ស្រី</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* DOB */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ថ្ងៃខែឆ្នាំកំណើត (DOB)
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ថ្នាក់រៀន (Grade)</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    {classList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ស្ថានភាព</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as Student['status'],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="កំពុងរៀន">កំពុងរៀន</option>
                    <option value="ផ្អាកការសិក្សា">ផ្អាកការសិក្សា</option>
                    <option value="បោះបង់">បោះបង់</option>
                    <option value="ផ្ទេរចេញ">ផ្ទេរចេញ</option>
                    <option value="បញ្ចប់ការសិក្សា">បញ្ចប់ការសិក្សា</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mother Name */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ឈ្មោះម្តាយ (Mother Name)
                  </label>
                  <input
                    type="text"
                    placeholder="ឈ្មោះម្តាយ"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Father Name */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ឈ្មោះឪពុក (Father Name)
                  </label>
                  <input
                    type="text"
                    placeholder="ឈ្មោះឪពុក"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    លេខទូរស័ព្ទ (Phone Number)
                  </label>
                  <input
                    type="text"
                    placeholder="012 345 678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    រូបថតសិស្ស (Image URL)
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  អាសយដ្ឋានបច្ចុប្បន្ន (Address)
                </label>
                <textarea
                  rows={2}
                  placeholder="ភូមិ, ឃុំ/សង្កាត់, ស្រុក/ខណ្ឌ, ខេត្ត/រាជធានី"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-xs transition"
                >
                  {editingStudent ? 'រក្សាទុកការកែប្រែ' : 'បញ្ចូលសិស្ស'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Details Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setViewingStudent(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-100">
              {viewingStudent.image ? (
                <img
                  src={viewingStudent.image}
                  alt={viewingStudent.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-blue-500 shadow-md mb-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl mx-auto mb-2">
                  {viewingStudent.gender === 'ស្រី' ? 'សិស្សស្រី' : 'សិស្សប្រុស'}
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-800">{viewingStudent.name}</h3>
              <p className="text-xs font-mono text-blue-600 font-semibold">{viewingStudent.id}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                {viewingStudent.grade}
              </span>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">ភេទ៖</span>
                <span className="font-medium text-slate-800">{viewingStudent.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">ថ្ងៃខែឆ្នាំកំណើត៖</span>
                <span className="font-medium text-slate-800">{viewingStudent.dob}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">ឈ្មោះម្តាយ៖</span>
                <span className="font-medium text-slate-800">{viewingStudent.motherName || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">ឈ្មោះឪពុក៖</span>
                <span className="font-medium text-slate-800">{viewingStudent.fatherName || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">លេខទូរស័ព្ទ៖</span>
                <span className="font-medium font-mono text-slate-800">{viewingStudent.phoneNumber || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">អាសយដ្ឋាន៖</span>
                <span className="font-medium text-slate-800 text-right max-w-[200px]">{viewingStudent.address || '-'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">ស្ថានភាព៖</span>
                <span className="font-medium text-emerald-600">{viewingStudent.status}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setViewingStudent(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
