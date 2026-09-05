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
  GraduationCap,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Teacher } from '../../types';

interface TeacherManagementProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onBatchAddTeachers: (newTeachers: Teacher[]) => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onBatchAddTeachers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State covering Columns A through K
  const [formData, setFormData] = useState<Teacher>({
    id: '', // A: អត្តលេខមន្ត្រី
    name: '', // B: គោត្តនាមនាម
    gender: 'ប្រុស', // C: ភេទ
    dob: '1988-01-01', // D: ថ្ងៃខែឆ្នាំកំណើត
    specialty: 'គណិតវិទ្យា', // E: មុខវិជ្ជាឯកទេស
    currentRole: 'គ្រូបង្រៀន', // F: តួនាទីបច្ចុប្បន្ន
    entryDate: '2015-10-01', // G: ថ្ងៃខែឆ្នាំចូលបម្រើការ
    seniority: '១១ ឆ្នាំ', // H: អតីតភាពការងារ
    address: '', // I: ទីលំនៅបច្ចុប្បន្ន
    phoneNumber: '', // J: លេខទូរស័ព្ទ
    image: '', // K: រូបថត
    assignedClass: '',
  });

  const generateAutoTeacherId = () => {
    const pad = String(teachers.length + 1).padStart(3, '0');
    return `T-${pad}`;
  };

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      id: generateAutoTeacherId(),
      name: '',
      gender: 'ប្រុស',
      dob: '1988-01-01',
      specialty: 'គណិតវិទ្យា',
      currentRole: 'គ្រូបង្រៀន',
      entryDate: '2015-10-01',
      seniority: '១១ ឆ្នាំ',
      address: '',
      phoneNumber: '',
      image: '',
      assignedClass: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({ ...teacher });
    setIsModalOpen(true);
  };

  const calculateSeniorityFromDate = (entryDateStr: string) => {
    if (!entryDateStr) return '';
    try {
      const entryYear = new Date(entryDateStr).getFullYear();
      const currentYear = new Date().getFullYear();
      const diff = Math.max(0, currentYear - entryYear);
      return `${diff} ឆ្នាំ`;
    } catch {
      return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const teacherToSave: Teacher = {
      ...formData,
      id: formData.id.trim() || generateAutoTeacherId(),
      name: formData.name.trim(),
      seniority: formData.seniority || calculateSeniorityFromDate(formData.entryDate),
    };

    if (editingTeacher) {
      onUpdateTeacher(teacherToSave);
    } else {
      onAddTeacher(teacherToSave);
    }
    setIsModalOpen(false);
  };

  // Excel Export
  const handleExportExcel = () => {
    const exportData = filteredTeachers.map((t) => ({
      'A: អត្តលេខមន្ត្រី': t.id,
      'B: គោត្តនាមនាម': t.name,
      'C: ភេទ': t.gender,
      'D: ថ្ងៃខែឆ្នាំកំណើត': t.dob,
      'E: មុខវិជ្ជាឯកទេស': t.specialty,
      'F: តួនាទីបច្ចុប្បន្ន': t.currentRole,
      'G: ថ្ងៃខែឆ្នាំចូលបម្រើការ': t.entryDate,
      'H: អតីតភាពការងារ': t.seniority,
      'I: ទីលំនៅបច្ចុប្បន្ន': t.address,
      'J: លេខទូរស័ព្ទ': t.phoneNumber,
      'K: រូបថត': t.image || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ព័ត៌មានគ្រូ');
    XLSX.writeFile(wb, `ព័ត៌មានគ្រូ_${new Date().toISOString().split('T')[0]}.xlsx`);
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

        const newTeachers: Teacher[] = rawRows.map((row, index) => {
          const autoId = `T-${String(teachers.length + index + 1).padStart(3, '0')}`;
          return {
            id: row['A: អត្តលេខមន្ត្រី'] || row['អត្តលេខ'] || row['ID'] || autoId,
            name: row['B: គោត្តនាមនាម'] || row['គោត្តនាមនាម'] || row['Name'] || `លោកគ្រូ/អ្នកគ្រូ ${index + 1}`,
            gender: row['C: ភេទ'] === 'ស្រី' || row['ភេទ'] === 'ស្រី' ? 'ស្រី' : 'ប្រុស',
            dob: row['D: ថ្ងៃខែឆ្នាំកំណើត'] || row['DOB'] || '1990-01-01',
            specialty: row['E: មុខវិជ្ជាឯកទេស'] || row['ឯកទេស'] || 'ទូទៅ',
            currentRole: row['F: តួនាទីបច្ចុប្បន្ន'] || row['តួនាទី'] || 'គ្រូបង្រៀន',
            entryDate: row['G: ថ្ងៃខែឆ្នាំចូលបម្រើការ'] || row['ថ្ងៃចូលបម្រើការ'] || '2018-01-01',
            seniority: row['H: អតីតភាពការងារ'] || row['អតីតភាព'] || '៨ ឆ្នាំ',
            address: row['I: ទីលំនៅបច្ចុប្បន្ន'] || row['អាសយដ្ឋាន'] || '',
            phoneNumber: String(row['J: លេខទូរស័ព្ទ'] || row['ទូរស័ព្ទ'] || ''),
            image: row['K: រូបថត'] || '',
          };
        });

        if (newTeachers.length > 0) {
          onBatchAddTeachers(newTeachers);
          alert(`បានបញ្ចូលគ្រូបង្រៀនចំនួន ${newTeachers.length} នាក់ពី Excel ដោយជោគជ័យ!`);
        }
      } catch (err) {
        console.error('Error importing teachers:', err);
        alert('មានបញ្ហាក្នុងការអាន Excel សូមពិនិត្យក្បាលតារាងពី A ដល់ K!');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const specialties = Array.from(new Set(teachers.map((t) => t.specialty).filter(Boolean)));

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.currentRole.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || t.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const femaleCount = teachers.filter((t) => t.gender === 'ស្រី').length;
  const maleCount = teachers.filter((t) => t.gender === 'ប្រុស').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 shrink-0">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">បុគ្គលិកគ្រូបង្រៀនសរុប</p>
          <p className="text-2xl font-bold mt-1 text-slate-900">{teachers.length}</p>
          <div className="mt-2 flex items-center text-[10px] text-indigo-600">ទិន្នន័យពី A ដល់ K</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">អ្នកគ្រូ (ស្រី)</p>
          <p className="text-2xl font-bold mt-1 text-pink-600">{femaleCount}</p>
          <div className="mt-2 flex items-center text-[10px] text-pink-600">ស្មើ {teachers.length ? Math.round((femaleCount / teachers.length) * 100) : 0}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">លោកគ្រូ (ប្រុស)</p>
          <p className="text-2xl font-bold mt-1 text-indigo-600">{maleCount}</p>
          <div className="mt-2 flex items-center text-[10px] text-indigo-600">ស្មើ {teachers.length ? Math.round((maleCount / teachers.length) * 100) : 0}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">មុខវិជ្ជាឯកទេស</p>
          <p className="text-2xl font-bold mt-1 text-slate-900">{specialties.length}</p>
          <div className="mt-2 flex items-center text-[10px] text-emerald-600">គ្រប់គ្រងក្នុងសាលា</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="teacher-search-input"
              type="text"
              placeholder="ស្វែងរកតាមអត្តលេខ, ឈ្មោះ, ឯកទេស, តួនាទី..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <select
            id="teacher-specialty-filter"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">គ្រប់មុខវិជ្ជាឯកទេស</option>
            {specialties.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            id="teacher-import-excel-btn"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50 text-xs font-medium transition shadow-xs"
            title="Upload បញ្ជីគ្រូពី Excel"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Upload Excel</span>
          </button>

          <button
            id="teacher-export-excel-btn"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-xs"
            title="Export បញ្ជីគ្រូពី A-K"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export Excel</span>
          </button>

          <button
            id="teacher-add-btn"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ បន្ថែមគ្រូថ្មី (A-K)</span>
          </button>
        </div>
      </div>

      {/* Teachers Table with Columns A to K */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-slate-500 border-b border-slate-200 text-xs font-semibold">
                <th className="px-4 py-3">A: អត្តលេខ</th>
                <th className="px-4 py-3">B: គោត្តនាមនាម</th>
                <th className="px-4 py-3">C: ភេទ</th>
                <th className="px-4 py-3">D: ថ្ងៃកំណើត</th>
                <th className="px-4 py-3">E: មុខវិជ្ជាឯកទេស</th>
                <th className="px-4 py-3">F: តួនាទីបច្ចុប្បន្ន</th>
                <th className="px-4 py-3">G: ចូលបម្រើការ</th>
                <th className="px-4 py-3">H: អតីតភាព</th>
                <th className="px-4 py-3">J: លេខទូរស័ព្ទ</th>
                <th className="px-4 py-3">K: រូបថត</th>
                <th className="px-4 py-3 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    មិនមានទិន្នន័យគ្រូបង្រៀនត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-indigo-600">
                      {teacher.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {teacher.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {teacher.gender}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{teacher.dob}</td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-700">
                        {teacher.specialty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-xs">{teacher.currentRole}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{teacher.entryDate}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs font-medium">{teacher.seniority}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-xs">{teacher.phoneNumber || '-'}</td>
                    <td className="px-4 py-3">
                      {teacher.image ? (
                        <img
                          src={teacher.image}
                          alt={teacher.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {teacher.gender === 'ស្រី' ? 'អ' : 'ល'}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingTeacher(teacher)}
                          className="text-slate-400 hover:text-slate-600 transition"
                          title="មើលប្រវត្តិរូប"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(teacher)}
                          className="text-indigo-600 font-medium hover:underline text-xs"
                        >
                          កែប្រែ
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`តើអ្នកពិតជាចង់លុបគ្រូ "${teacher.name}" មែនទេ?`)) {
                              onDeleteTeacher(teacher.id);
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

      {/* Add / Edit Teacher Modal (Columns A-K) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingTeacher ? 'កែសម្រួលព័ត៌មានគ្រូ' : 'បញ្ចូលព័ត៌មានគ្រូថ្មី (កាឡោន A ដល់ K)'}
                </h3>
                <p className="text-xs text-emerald-600">គ្រប់គ្រងទិន្នន័យមន្ត្រីអប់រំ និងសាលារៀន</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* A: អត្តលេខមន្ត្រី */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    A: អត្តលេខមន្ត្រី *
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      required
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, id: generateAutoTeacherId() })}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px]"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                {/* B: គោត្តនាមនាម */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    B: គោត្តនាមនាម *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឈ្មោះគ្រូពេញ"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* C: ភេទ */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">C: ភេទ</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as 'ប្រុស' | 'ស្រី' })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="ប្រុស">ប្រុស</option>
                    <option value="ស្រី">ស្រី</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* D: ថ្ងៃខែឆ្នាំកំណើត */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    D: ថ្ងៃខែឆ្នាំកំណើត
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* E: មុខវិជ្ជាឯកទេស */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    E: មុខវិជ្ជាឯកទេស *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. គណិតវិទ្យា, រូបវិទ្យា..."
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* F: តួនាទីបច្ចុប្បន្ន */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    F: តួនាទីបច្ចុប្បន្ន
                  </label>
                  <input
                    type="text"
                    placeholder="គ្រូបង្រៀន, នាយករង, ប្រធានក្រុម..."
                    value={formData.currentRole}
                    onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* G: ថ្ងៃខែឆ្នាំចូលបម្រើការ */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    G: ថ្ងៃខែឆ្នាំចូលបម្រើការ
                  </label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => {
                      const newEntry = e.target.value;
                      const autoSen = calculateSeniorityFromDate(newEntry);
                      setFormData({ ...formData, entryDate: newEntry, seniority: autoSen });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* H: អតីតភាពការងារ */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    H: អតីតភាពការងារ
                  </label>
                  <input
                    type="text"
                    placeholder="ឧ. ១២ ឆ្នាំ"
                    value={formData.seniority}
                    onChange={(e) => setFormData({ ...formData, seniority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* J: លេខទូរស័ព្ទ */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    J: លេខទូរស័ព្ទ
                  </label>
                  <input
                    type="text"
                    placeholder="012 345 678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* I: ទីលំនៅបច្ចុប្បន្ន */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  I: ទីលំនៅបច្ចុប្បន្ន
                </label>
                <input
                  type="text"
                  placeholder="ផ្ទះលេខ, ផ្លូវ, សង្កាត់/ឃុំ, ខណ្ឌ/ស្រុក, រាជធានី/ខេត្ត"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* K: រូបថត */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  K: រូបថត (Image URL)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-xs transition"
                >
                  {editingTeacher ? 'រក្សាទុកការកែប្រែ' : 'បញ្ចូលគ្រូថ្មី'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Teacher Details Modal */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setViewingTeacher(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-100">
              {viewingTeacher.image ? (
                <img
                  src={viewingTeacher.image}
                  alt={viewingTeacher.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-emerald-500 shadow-md mb-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl mx-auto mb-2">
                  {viewingTeacher.gender === 'ស្រី' ? 'អ្នកគ្រូ' : 'លោកគ្រូ'}
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-800">{viewingTeacher.name}</h3>
              <p className="text-xs font-mono text-emerald-700 font-semibold">{viewingTeacher.id}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                {viewingTeacher.specialty} • {viewingTeacher.currentRole}
              </span>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">ភេទ (C)៖</span>
                <span className="font-medium text-slate-800">{viewingTeacher.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">ថ្ងៃខែឆ្នាំកំណើត (D)៖</span>
                <span className="font-medium text-slate-800">{viewingTeacher.dob}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">ចូលបម្រើការ (G)៖</span>
                <span className="font-medium text-slate-800">{viewingTeacher.entryDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">អតីតភាពការងារ (H)៖</span>
                <span className="font-medium text-amber-700">{viewingTeacher.seniority}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">លេខទូរស័ព្ទ (J)៖</span>
                <span className="font-medium font-mono text-slate-800">{viewingTeacher.phoneNumber || '-'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">ទីលំនៅបច្ចុប្បន្ន (I)៖</span>
                <span className="font-medium text-slate-800 text-right max-w-[220px]">{viewingTeacher.address || '-'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setViewingTeacher(null)}
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
