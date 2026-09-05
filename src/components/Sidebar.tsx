import React from 'react';
import {
  Users,
  GraduationCap,
  School,
  Award,
  CalendarCheck,
  UserCheck,
  BarChart3,
  FileCode2,
  BookOpen,
} from 'lucide-react';

export type NavTab =
  | 'students'
  | 'teachers'
  | 'classes'
  | 'grades'
  | 'student_attendance'
  | 'teacher_attendance'
  | 'results'
  | 'code_gs_guide';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose?: () => void;
  studentCount: number;
  teacherCount: number;
  classCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  studentCount,
  teacherCount,
  classCount,
}) => {
  const menuItems = [
    {
      id: 'students' as NavTab,
      number: '១',
      title: 'ព័ត៌មានសិស្ស',
      subtitle: 'CRUD & Upload Excel',
      icon: Users,
      badge: `${studentCount}`,
    },
    {
      id: 'teachers' as NavTab,
      number: '២',
      title: 'ព័ត៌មានគ្រូ',
      subtitle: 'ព័ត៌មានលម្អិតពី A ដល់ K',
      icon: GraduationCap,
      badge: `${teacherCount}`,
    },
    {
      id: 'classes' as NavTab,
      number: '៣',
      title: 'គ្រប់គ្រងថ្នាក់រៀន',
      subtitle: 'ជ្រើសថ្នាក់, ទាញសិស្ស, ផ្ទេរសិស្ស',
      icon: School,
      badge: `${classCount}`,
    },
    {
      id: 'grades' as NavTab,
      number: '៤',
      title: 'គ្រប់គ្រងពិន្ទុសិស្ស',
      subtitle: 'បញ្ចូលពិន្ទុ (១០ & ១៣ មុខ)',
      icon: Award,
      badge: 'ពិន្ទុ',
    },
    {
      id: 'student_attendance' as NavTab,
      number: '៥',
      title: 'គ្រប់គ្រងវត្តមានសិស្ស',
      subtitle: 'វត្តមានសិស្សប្រចាំថ្ងៃ',
      icon: CalendarCheck,
      badge: 'វត្តមាន',
    },
    {
      id: 'teacher_attendance' as NavTab,
      number: '៦',
      title: 'គ្រប់គ្រងវត្តមានគ្រូ',
      subtitle: 'ម៉ោងចូល-ចេញ (យឺត, ទាន់ម៉ោង)',
      icon: UserCheck,
      badge: 'វត្តមាន',
    },
    {
      id: 'results' as NavTab,
      number: '៧',
      title: 'គ្រប់គ្រងលទ្ធផលសិក្សា',
      subtitle: 'មធ្យមភាគប្រចាំខែ & ឆមាស',
      icon: BarChart3,
      badge: 'លទ្ធផល',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="school-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0 ${
          isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-indigo-400 tracking-tight leading-none">
                SMS PRO
              </h1>
              <p className="text-xs text-slate-400 mt-1">ប្រព័ន្ធគ្រប់គ្រងសាលារៀន</p>
            </div>
          </div>
          {onClose && (
            <button
              id="sidebar-close-btn"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-0.5 custom-scrollbar">
          <div className="px-6 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
            មេនុយចម្បង
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full text-left px-6 py-3 flex items-center transition-colors border-l-4 group relative ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-400 font-medium'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border-transparent'
                }`}
              >
                <span className="mr-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                </span>

                <div className="flex-1 min-w-0 pr-1">
                  <span className="text-xs sm:text-sm truncate block">
                    {item.title}
                  </span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Backend Code.gs Guide */}
          <div className="pt-3 mt-3 border-t border-slate-800/80">
            <button
              id="sidebar-codegs-guide-btn"
              onClick={() => {
                onSelectTab('code_gs_guide');
                if (onClose) onClose();
              }}
              className={`w-full text-left px-6 py-2.5 flex items-center transition-colors border-l-4 group ${
                currentTab === 'code_gs_guide'
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-400 font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white border-transparent'
              }`}
            >
              <FileCode2 className="w-4 h-4 mr-3 text-slate-400 group-hover:text-amber-400" />
              <div className="flex-1 min-w-0">
                <span className="text-xs block truncate font-medium">Code.gs (Google Sheets)</span>
              </div>
            </button>
          </div>
        </nav>

        {/* User Profile Card at Bottom */}
        <div className="p-4 bg-slate-800/50 mt-auto border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              AD
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-xs font-medium text-white truncate">Admin User</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                អ្នកគ្រប់គ្រង
              </p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500" title="Online"></div>
        </div>
      </aside>
    </>
  );
};
