/**
 * ==============================================================================
 * ប្រព័ន្ធគ្រប់គ្រងសាលារៀន (School Management System) - Backend Code.gs
 * ==============================================================================
 * 
 * របៀបដំឡើង (Step-by-Step Installation):
 * 1. បង្កើត Google Sheet ថ្មីមួយនៅ https://sheets.new
 * 2. ចុច Extensions (ផ្នែកបន្ថែម) -> Apps Script
 * 3. លុបកូដចាស់ទាំងអស់ចេញ ហើយ Copy កូដខាងក្រោមនេះទាំងស្រុងទៅបិទភ្ជាប់ (Paste)
 * 4. ចុច Save (រូប Disk ឬ Ctrl + S)
 * 5. ជ្រើសរើស Function "setupSchoolSpreadsheet" រួចចុច "Run" ដើម្បីបង្កើត Tabs ទាំង 6 អូតូ
 * 6. ចុច Deploy -> New deployment -> Select type: Web app
 *    - Description: "School Management API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (ដើម្បីឲ្យ Web App អាចទាក់ទងបាន)
 * 7. ចុច Deploy រួចចម្លង (Copy) "Web app URL" មកដាក់ក្នុងប្រព័ន្ធ Web App នេះ!
 * ==============================================================================
 */

// ឈ្មោះសន្លឹកកិច្ចការ (Sheet Tabs)
const SHEET_NAMES = {
  STUDENTS: 'Students',
  TEACHERS: 'Teachers',
  CLASSES: 'Classes',
  GRADES: 'Grades',
  STUDENT_ATTENDANCE: 'StudentAttendance',
  TEACHER_ATTENDANCE: 'TeacherAttendance'
};

/**
 * មុខងារបង្កើតសន្លឹកកិច្ចការ និងក្បាលតារាងជាស្វ័យប្រវត្តិ
 */
function setupSchoolSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. សន្លឹកសិស្ស (Students)
  let studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  if (!studentSheet) {
    studentSheet = ss.insertSheet(SHEET_NAMES.STUDENTS);
  }
  const studentHeaders = [
    'ID (អត្តលេខ)', 'ឈ្មោះសិស្ស (Name)', 'ភេទ (Gender)', 'ថ្ងៃខែឆ្នាំកំណើត (DOB)', 
    'ថ្នាក់រៀន (Grade)', 'ឈ្មោះម្តាយ (Mother Name)', 'ឈ្មោះឪពុក (Father Name)', 
    'អាសយដ្ឋាន (Address)', 'លេខទូរស័ព្ទ (Phone Number)', 'រូបថត (Image URL)', 'ស្ថានភាព (Status)', 'កាលបរិច្ឆេទបង្កើត'
  ];
  studentSheet.getRange(1, 1, 1, studentHeaders.length).setValues([studentHeaders])
    .setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold');
  studentSheet.setFrozenRows(1);

  // 2. សន្លឹកគ្រូ (Teachers) ពី A ដល់ K
  let teacherSheet = ss.getSheetByName(SHEET_NAMES.TEACHERS);
  if (!teacherSheet) {
    teacherSheet = ss.insertSheet(SHEET_NAMES.TEACHERS);
  }
  const teacherHeaders = [
    'A: អត្តលេខមន្ត្រី', 'B: គោត្តនាមនាម', 'C: ភេទ', 'D: ថ្ងៃខែឆ្នាំកំណើត', 
    'E: មុខវិជ្ជាឯកទេស', 'F: តួនាទីបច្ចុប្បន្ន', 'G: ថ្ងៃខែឆ្នាំចូលបម្រើការ', 
    'H: អតីតភាពការងារ', 'I: ទីលំនៅបច្ចុប្បន្ន', 'J: លេខទូរស័ព្ទ', 'K: រូបថត'
  ];
  teacherSheet.getRange(1, 1, 1, teacherHeaders.length).setValues([teacherHeaders])
    .setBackground('#065f46').setFontColor('#ffffff').setFontWeight('bold');
  teacherSheet.setFrozenRows(1);

  // 3. សន្លឹកថ្នាក់រៀន (Classes)
  let classSheet = ss.getSheetByName(SHEET_NAMES.CLASSES);
  if (!classSheet) {
    classSheet = ss.insertSheet(SHEET_NAMES.CLASSES);
  }
  const classHeaders = ['កូដថ្នាក់ (Class ID)', 'ឈ្មោះថ្នាក់ (Class Name)', 'កម្រិតថ្នាក់ (Level)', 'ឆ្នាំសិក្សា (Academic Year)', 'លេខបន្ទប់ (Room)', 'អត្តលេខគ្រូបន្ទុក (Homeroom Teacher ID)', 'បញ្ជីកូដសិស្ស (Student IDs JSON)', 'ការពិពណ៌នា'];
  classSheet.getRange(1, 1, 1, classHeaders.length).setValues([classHeaders])
    .setBackground('#4c1d95').setFontColor('#ffffff').setFontWeight('bold');
  classSheet.setFrozenRows(1);

  // 4. សន្លឹកពិន្ទុ (Grades)
  let gradeSheet = ss.getSheetByName(SHEET_NAMES.GRADES);
  if (!gradeSheet) {
    gradeSheet = ss.insertSheet(SHEET_NAMES.GRADES);
  }
  const gradeHeaders = ['កូដកំណត់ត្រា (Grade ID)', 'អត្តលេខសិស្ស', 'ឈ្មោះសិស្ស', 'ថ្នាក់រៀន', 'ខែសិក្សា (Month)', 'ឆ្នាំសិក្សា', 'ពិន្ទុមុខវិជ្ជា (Scores JSON)', 'ពិន្ទុសរុប', 'មធ្យមភាគ', 'ចំណាត់ថ្នាក់', 'និទ្ទេស', 'កាលបរិច្ឆេទកែប្រែ'];
  gradeSheet.getRange(1, 1, 1, gradeHeaders.length).setValues([gradeHeaders])
    .setBackground('#9a3412').setFontColor('#ffffff').setFontWeight('bold');
  gradeSheet.setFrozenRows(1);

  // 5. សន្លឹកវត្តមានសិស្ស (Student Attendance)
  let sAttSheet = ss.getSheetByName(SHEET_NAMES.STUDENT_ATTENDANCE);
  if (!sAttSheet) {
    sAttSheet = ss.insertSheet(SHEET_NAMES.STUDENT_ATTENDANCE);
  }
  const sAttHeaders = ['កូដ (ID)', 'កាលបរិច្ឆេទ (Date)', 'កូដថ្នាក់', 'ឈ្មោះថ្នាក់', 'អត្តលេខសិស្ស', 'ឈ្មោះសិស្ស', 'មុខវិជ្ជា', 'ឈ្មោះគ្រូ', 'អត្តលេខគ្រូ', 'ស្ថានភាព (ចូលរៀន/មិនចូល/ច្បាប់/អត់ច្បាប់/អវត្តមាន)', 'ចំណាំ'];
  sAttSheet.getRange(1, 1, 1, sAttHeaders.length).setValues([sAttHeaders])
    .setBackground('#155e75').setFontColor('#ffffff').setFontWeight('bold');
  sAttSheet.setFrozenRows(1);

  // 6. សន្លឹកវត្តមានគ្រូ (Teacher Attendance)
  let tAttSheet = ss.getSheetByName(SHEET_NAMES.TEACHER_ATTENDANCE);
  if (!tAttSheet) {
    tAttSheet = ss.insertSheet(SHEET_NAMES.TEACHER_ATTENDANCE);
  }
  const tAttHeaders = ['កូដ (ID)', 'កាលបរិច្ឆេទ (Date)', 'អត្តលេខគ្រូ', 'ឈ្មោះគ្រូ', 'មុខវិជ្ជា', 'ម៉ោងចូល (Check In)', 'ម៉ោងចេញ (Check Out)', 'ស្ថានភាព (យឺត/ទាន់ម៉ោង/ច្បាប់/អត់ច្បាប់/មិនជ្រើស)', 'ចំណាំ'];
  tAttSheet.getRange(1, 1, 1, tAttHeaders.length).setValues([tAttHeaders])
    .setBackground('#831843').setFontColor('#ffffff').setFontWeight('bold');
  tAttSheet.setFrozenRows(1);

  SpreadsheetApp.flush();
  return { status: 'success', message: 'ការបង្កើតសន្លឹកកិច្ចការសាលារៀនបានជោគជ័យ!' };
}

/**
 * Handle GET requests - Read data or ping
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'getAll';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ping') {
      return createJsonResponse({ status: 'ok', time: new Date().toISOString() });
    }

    if (action === 'setup') {
      const res = setupSchoolSpreadsheet();
      return createJsonResponse(res);
    }

    if (action === 'getAll') {
      const data = {
        students: readSheetData(ss, SHEET_NAMES.STUDENTS),
        teachers: readSheetData(ss, SHEET_NAMES.TEACHERS),
        classes: readSheetData(ss, SHEET_NAMES.CLASSES),
        grades: readSheetData(ss, SHEET_NAMES.GRADES),
        studentAttendance: readSheetData(ss, SHEET_NAMES.STUDENT_ATTENDANCE),
        teacherAttendance: readSheetData(ss, SHEET_NAMES.TEACHER_ATTENDANCE)
      };
      return createJsonResponse({ status: 'success', data: data });
    }

    return createJsonResponse({ status: 'error', message: 'សកម្មភាពមិនត្រឹមត្រូវ: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Handle POST requests - Create, Update, Delete, Batch Sync
 */
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'batchSync') {
      // Sync all data from the app to Google Sheets
      const payload = contents.data;
      if (payload.students) syncSheetData(ss, SHEET_NAMES.STUDENTS, payload.students);
      if (payload.teachers) syncSheetData(ss, SHEET_NAMES.TEACHERS, payload.teachers);
      if (payload.classes) syncSheetData(ss, SHEET_NAMES.CLASSES, payload.classes);
      if (payload.grades) syncSheetData(ss, SHEET_NAMES.GRADES, payload.grades);
      if (payload.studentAttendance) syncSheetData(ss, SHEET_NAMES.STUDENT_ATTENDANCE, payload.studentAttendance);
      if (payload.teacherAttendance) syncSheetData(ss, SHEET_NAMES.TEACHER_ATTENDANCE, payload.teacherAttendance);

      return createJsonResponse({ status: 'success', message: 'ធ្វើសមកាលកម្មទិន្នន័យបានជោគជ័យ!' });
    }

    if (action === 'saveStudent') {
      const student = contents.student;
      const sheet = ss.getSheetByName(SHEET_NAMES.STUDENTS) || ss.insertSheet(SHEET_NAMES.STUDENTS);
      upsertRowById(sheet, student.id, [
        student.id, student.name, student.gender, student.dob,
        student.grade, student.motherName, student.fatherName,
        student.address, student.phoneNumber, student.image || '', student.status, new Date().toISOString()
      ]);
      return createJsonResponse({ status: 'success', message: 'រក្សាទុកសិស្សបានជោគជ័យ' });
    }

    if (action === 'deleteStudent') {
      const studentId = contents.id;
      const sheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
      if (sheet) deleteRowById(sheet, studentId);
      return createJsonResponse({ status: 'success', message: 'លុបសិស្សបានជោគជ័យ' });
    }

    // Default response for other actions
    return createJsonResponse({ status: 'success', message: 'ទិន្នន័យត្រូវបានកត់ត្រា' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// ======================== HELPER FUNCTIONS ========================

function readSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  
  const headers = rows[0];
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] && !row[1]) continue; // Skip empty rows
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    data.push(item);
  }
  return data;
}

function syncSheetData(ss, sheetName, dataList) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    setupSchoolSpreadsheet();
    sheet = ss.getSheetByName(sheetName);
  }
  if (!sheet || !dataList || dataList.length === 0) return;

  // Clear existing content except headers
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  // Convert array of objects to 2D array
  const rows = dataList.map(item => Object.values(item));
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

function upsertRowById(sheet, id, newRowValues) {
  const data = sheet.getDataRange().getValues();
  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, newRowValues.length).setValues([newRowValues]);
  } else {
    sheet.appendRow(newRowValues);
  }
}

function deleteRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
