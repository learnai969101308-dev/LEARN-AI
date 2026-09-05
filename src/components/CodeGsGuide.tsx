import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  ExternalLink,
  Save,
  CheckCircle2,
  Cloud,
} from 'lucide-react';
import { getSavedAppsScriptUrl, saveAppsScriptUrl } from '../services/sheetsService';

interface CodeGsGuideProps {
  spreadsheetId: string | null;
  onOpenSpreadsheet: () => void;
}

export const CodeGsGuide: React.FC<CodeGsGuideProps> = ({
  spreadsheetId,
  onOpenSpreadsheet,
}) => {
  const [copied, setCopied] = useState(false);
  const [webAppUrl, setWebAppUrl] = useState(getSavedAppsScriptUrl());
  const [isUrlSaved, setIsUrlSaved] = useState(false);

  const handleCopyCode = () => {
    // Read the script text or provide instructions
    const sampleScript = `// មើលកូដពេញលេញនៅក្នុងឯកសារ Code.gs ក្នុង Root Directory
// ឬទាញយកពីគម្រោងនេះ។`;
    navigator.clipboard.writeText(sampleScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    saveAppsScriptUrl(webAppUrl.trim());
    setIsUrlSaved(true);
    setTimeout(() => setIsUrlSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Introduction Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-2xl shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <FileCode2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              ការដំឡើង Backend Google Sheets ជាមួយ Google Apps Script (Code.gs)
            </h2>
            <p className="text-xs text-amber-100 mt-1 leading-relaxed">
              ប្រព័ន្ធនេះអាចភ្ជាប់ទិន្នន័យផ្ទាល់ជាមួយ Google Sheets ដោយស្វ័យប្រវត្តិតាមរយៈ Google OAuth API ឬតាមរយៈ Google Apps Script Web App URL ។
            </p>
          </div>
        </div>
      </div>

      {/* Web App URL Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Cloud className="w-4 h-4 text-blue-600" />
          <span>ការភ្ជាប់តាមរយៈ Google Apps Script Web App URL</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          ប្រសិនបើលោកអ្នកបាន Deploy Web App នៅក្នុង Apps Script រួចហើយ សូមបិទភ្ជាប់ Web App URL នៅត្រង់នេះ៖
        </p>

        <form onSubmit={handleSaveUrl} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            id="apps-script-url-input"
            type="url"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={webAppUrl}
            onChange={(e) => setWebAppUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition whitespace-nowrap"
          >
            {isUrlSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isUrlSaved ? 'បានរក្សាទុក!' : 'រក្សាទុក URL'}</span>
          </button>
        </form>

        {spreadsheetId && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Google Sheet ID បច្ចុប្បន្ន៖ <strong className="font-mono">{spreadsheetId}</strong></span>
            </div>
            <button
              onClick={onOpenSpreadsheet}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold underline"
            >
              <span>បើកមើល Sheet</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Step by Step Setup Guide */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">ជំហានងាយៗទាំង ៦ ដើម្បីភ្ជាប់ Google Sheet៖</h3>

        <ol className="space-y-3 text-xs text-slate-700 list-decimal list-inside leading-relaxed">
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <strong>ជំហានទី ១៖</strong> បង្កើត Google Sheet ថ្មីមួយនៅ{' '}
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline font-semibold inline-flex items-center gap-0.5"
            >
              https://sheets.new <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <strong>ជំហានទី ២៖</strong> នៅក្នុង Google Sheet ចុចម៉ឺនុយ <strong>Extensions (ផ្នែកបន្ថែម)</strong> &rarr; ជ្រើសរើស <strong>Apps Script</strong>
          </li>
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <strong>ជំហានទី ៣៖</strong> លុបកូដចាស់ទាំងអស់ចេញ រួច Copy កូដពីឯកសារ <strong>Code.gs</strong> (ដែលមានស្រាប់នៅក្នុងគម្រោងនេះ) ទៅបិទភ្ជាប់ (Paste) ក្នុងផ្ទាំង Apps Script
          </li>
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <strong>ជំហានទី ៤៖</strong> ចុច Save (រូបតំណាងថាស ឬ Ctrl + S)
          </li>
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <strong>ជំហានទី ៥៖</strong> នៅខាងលើ ចុចជ្រើសរើស Function <strong>setupSchoolSpreadsheet</strong> រួចចុចប៊ូតុង <strong>Run</strong> (វាបង្កើត Sheet Tabs ទាំង ៦ អូតូ៖ Students, Teachers, Classes, Grades, StudentAttendance, TeacherAttendance)
          </li>
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <strong>ជំហានទី ៦៖</strong> ចុចប៊ូតុងពណ៌ខៀវ <strong>Deploy</strong> &rarr; <strong>New deployment</strong> &rarr; ជ្រើសរើសប្រភេទ <strong>Web app</strong>:
            <ul className="list-disc list-inside mt-2 pl-4 text-slate-600 space-y-1">
              <li>Description: <em>School Management API</em></li>
              <li>Execute as: <em>Me (គណនីរបស់អ្នក)</em></li>
              <li>Who has access: <em>Anyone</em> (ដើម្បីឲ្យប្រព័ន្ធអាច Sync ទិន្នន័យបាន)</li>
            </ul>
            បន្ទាប់មកចុច <strong>Deploy</strong> រួចចម្លង Web app URL យកមកបិទភ្ជាប់ក្នុងប្រអប់ខាងលើ!
          </li>
        </ol>
      </div>
    </div>
  );
};
