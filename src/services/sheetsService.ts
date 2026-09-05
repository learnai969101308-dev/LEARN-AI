import { Student, Teacher, SchoolClass, StudentGradeRecord, StudentAttendanceRecord, TeacherAttendanceRecord } from '../types';

export interface SchoolDatabaseState {
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  grades: StudentGradeRecord[];
  studentAttendance: StudentAttendanceRecord[];
  teacherAttendance: TeacherAttendanceRecord[];
}

const LOCAL_STORAGE_KEY = 'school_management_system_data_v1';
const SPREADSHEET_ID_KEY = 'school_google_sheet_id';
const APPS_SCRIPT_URL_KEY = 'school_apps_script_url';

export const loadLocalSchoolData = (initialData: SchoolDatabaseState): SchoolDatabaseState => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        students: parsed.students || initialData.students,
        teachers: parsed.teachers || initialData.teachers,
        classes: parsed.classes || initialData.classes,
        grades: parsed.grades || initialData.grades,
        studentAttendance: parsed.studentAttendance || initialData.studentAttendance,
        teacherAttendance: parsed.teacherAttendance || initialData.teacherAttendance,
      };
    }
  } catch (err) {
    console.error('Error loading local data:', err);
  }
  return initialData;
};

export const saveLocalSchoolData = (data: SchoolDatabaseState) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving local data:', err);
  }
};

export const getSavedSpreadsheetId = (): string | null => {
  return localStorage.getItem(SPREADSHEET_ID_KEY);
};

export const saveSpreadsheetId = (id: string) => {
  localStorage.setItem(SPREADSHEET_ID_KEY, id);
};

export const getSavedAppsScriptUrl = (): string => {
  return localStorage.getItem(APPS_SCRIPT_URL_KEY) || '';
};

export const saveAppsScriptUrl = (url: string) => {
  localStorage.setItem(APPS_SCRIPT_URL_KEY, url);
};

/**
 * Creates a complete School Spreadsheet via Google Sheets API (v4)
 */
export const createSchoolSpreadsheet = async (
  accessToken: string,
  title = 'ប្រព័ន្ធគ្រប់គ្រងសាលារៀន - School Management Database'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const payload = {
    properties: {
      title,
      locale: 'km_KH',
    },
    sheets: [
      { properties: { title: 'Students', tabColor: { red: 0.12, green: 0.23, blue: 0.54 } } },
      { properties: { title: 'Teachers', tabColor: { red: 0.02, green: 0.37, blue: 0.27 } } },
      { properties: { title: 'Classes', tabColor: { red: 0.3, green: 0.11, blue: 0.58 } } },
      { properties: { title: 'Grades', tabColor: { red: 0.6, green: 0.2, blue: 0.07 } } },
      { properties: { title: 'StudentAttendance', tabColor: { red: 0.08, green: 0.37, blue: 0.46 } } },
      { properties: { title: 'TeacherAttendance', tabColor: { red: 0.51, green: 0.09, blue: 0.26 } } },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`មិនអាចបង្កើត Google Sheet បានទេ: ${errText}`);
  }

  const result = await createRes.json();
  const spreadsheetId = result.spreadsheetId;
  saveSpreadsheetId(spreadsheetId);

  // Initialize Headers
  await initializeSheetHeaders(accessToken, spreadsheetId);

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
};

/**
 * Sets headers and initial styling
 */
export const initializeSheetHeaders = async (accessToken: string, spreadsheetId: string) => {
  const headerData = [
    {
      range: 'Students!A1:L1',
      values: [[
        'ID (អត្តលេខ)', 'ឈ្មោះសិស្ស', 'ភេទ', 'ថ្ងៃខែឆ្នាំកំណើត', 'ថ្នាក់រៀន',
        'ឈ្មោះម្តាយ', 'ឈ្មោះឪពុក', 'អាសយដ្ឋាន', 'លេខទូរស័ព្ទ', 'រូបថត', 'ស្ថានភាព', 'កាលបរិច្ឆេទបង្កើត'
      ]],
    },
    {
      range: 'Teachers!A1:K1',
      values: [[
        'A: អត្តលេខមន្ត្រី', 'B: គោត្តនាមនាម', 'C: ភេទ', 'D: ថ្ងៃខែឆ្នាំកំណើត',
        'E: មុខវិជ្ជាឯកទេស', 'F: តួនាទីបច្ចុប្បន្ន', 'G: ថ្ងៃខែឆ្នាំចូលបម្រើការ',
        'H: អតីតភាពការងារ', 'I: ទីលំនៅបច្ចុប្បន្ន', 'J: លេខទូរស័ព្ទ', 'K: រូបថត'
      ]],
    },
    {
      range: 'Classes!A1:H1',
      values: [[
        'កូដថ្នាក់', 'ឈ្មោះថ្នាក់', 'កម្រិតថ្នាក់', 'ឆ្នាំសិក្សា', 'លេខបន្ទប់', 'អត្តលេខគ្រូបន្ទុក', 'បញ្ជីកូដសិស្ស (JSON)', 'ការពិពណ៌នា'
      ]],
    },
    {
      range: 'Grades!A1:L1',
      values: [[
        'កូដកំណត់ត្រា', 'អត្តលេខសិស្ស', 'ឈ្មោះសិស្ស', 'ថ្នាក់រៀន', 'ខែសិក្សា', 'ឆ្នាំសិក្សា', 'ពិន្ទុមុខវិជ្ជា (JSON)', 'ពិន្ទុសរុប', 'មធ្យមភាគ', 'ចំណាត់ថ្នាក់', 'និទ្ទេស', 'កាលបរិច្ឆេទកែប្រែ'
      ]],
    },
    {
      range: 'StudentAttendance!A1:K1',
      values: [[
        'កូដ', 'កាលបរិច្ឆេទ', 'កូដថ្នាក់', 'ឈ្មោះថ្នាក់', 'អត្តលេខសិស្ស', 'ឈ្មោះសិស្ស', 'មុខវិជ្ជា', 'ឈ្មោះគ្រូ', 'អត្តលេខគ្រូ', 'ស្ថានភាព', 'ចំណាំ'
      ]],
    },
    {
      range: 'TeacherAttendance!A1:I1',
      values: [[
        'កូដ', 'កាលបរិច្ឆេទ', 'អត្តលេខគ្រូ', 'ឈ្មោះគ្រូ', 'មុខវិជ្ជា', 'ម៉ោងចូល', 'ម៉ោងចេញ', 'ស្ថានភាព', 'ចំណាំ'
      ]],
    },
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: headerData,
    }),
  });
};

/**
 * Sync entire local data state to Google Sheet
 */
export const syncAllDataToGoogleSheet = async (
  accessToken: string,
  spreadsheetId: string,
  data: SchoolDatabaseState
) => {
  const studentRows = data.students.map((s) => [
    s.id, s.name, s.gender, s.dob, s.grade, s.motherName, s.fatherName,
    s.address, s.phoneNumber, s.image || '', s.status, s.createdAt || ''
  ]);

  const teacherRows = data.teachers.map((t) => [
    t.id, t.name, t.gender, t.dob, t.specialty, t.currentRole,
    t.entryDate, t.seniority, t.address, t.phoneNumber, t.image || ''
  ]);

  const classRows = data.classes.map((c) => [
    c.id, c.name, c.level, c.academicYear, c.roomNumber,
    c.homeroomTeacherId || '', JSON.stringify(c.studentIds), c.description || ''
  ]);

  const gradeRows = data.grades.map((g) => [
    g.id, g.studentId, g.studentName, g.gradeClass, g.month, g.academicYear,
    JSON.stringify(g.subjects), g.totalScore, g.averageScore, g.gradeRank || '',
    g.gradeLetter || '', g.updatedAt
  ]);

  const sAttRows = data.studentAttendance.map((a) => [
    a.id, a.date, a.classId, a.className, a.studentId, a.studentName,
    a.subject, a.teacherName, a.teacherId, a.status, a.note || ''
  ]);

  const tAttRows = data.teacherAttendance.map((a) => [
    a.id, a.date, a.teacherId, a.teacherName, a.subject, a.checkInTime,
    a.checkOutTime, a.status, a.note || ''
  ]);

  // First, clear old rows below headers
  const clearRanges = [
    'Students!A2:L',
    'Teachers!A2:K',
    'Classes!A2:H',
    'Grades!A2:L',
    'StudentAttendance!A2:K',
    'TeacherAttendance!A2:I'
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ranges: clearRanges }),
  });

  // Batch update new data
  const updateData = [
    { range: 'Students!A2', values: studentRows },
    { range: 'Teachers!A2', values: teacherRows },
    { range: 'Classes!A2', values: classRows },
    { range: 'Grades!A2', values: gradeRows },
    { range: 'StudentAttendance!A2', values: sAttRows },
    { range: 'TeacherAttendance!A2', values: tAttRows },
  ].filter((item) => item.values.length > 0);

  if (updateData.length > 0) {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: updateData,
      }),
    });

    if (!res.ok) {
      throw new Error(`ការធ្វើសមកាលកម្មទិន្នន័យទៅ Google Sheets បរាជ័យ: ${await res.text()}`);
    }
  }

  return true;
};

/**
 * Send data to Apps Script Web App URL if configured
 */
export const syncToAppsScriptUrl = async (webAppUrl: string, data: SchoolDatabaseState) => {
  if (!webAppUrl) return false;
  const res = await fetch(webAppUrl, {
    method: 'POST',
    mode: 'no-cors', // standard Apps Script redirect handling
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'batchSync',
      data: data,
    }),
  });
  return true;
};
