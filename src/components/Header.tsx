import React, { useState } from 'react';
import {
  Menu,
  Cloud,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
  subtitle: string;
  currentUser: User | null;
  accessToken: string | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onSyncGoogleSheets: () => Promise<void>;
  isSyncing: boolean;
  spreadsheetId: string | null;
  onOpenCodeGsGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title,
  subtitle,
  currentUser,
  accessToken,
  onGoogleSignIn,
  onSignOut,
  onSyncGoogleSheets,
  isSyncing,
  spreadsheetId,
  onOpenCodeGsGuide,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      id="app-header"
      className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between"
    >
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left side: Mobile Toggle & Breadcrumb / Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="header-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-400 hidden md:inline">ផ្ទាំងគ្រប់គ្រង</span>
            <span className="text-slate-300 hidden md:inline">/</span>
            <h2 className="text-slate-900 font-medium text-sm sm:text-base truncate">
              {title}
            </h2>
          </div>
        </div>

        {/* Right side: Google Sheets Connection & Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Guide to Code.gs */}
          <button
            id="header-codegs-btn"
            onClick={onOpenCodeGsGuide}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Code.gs Guide</span>
          </button>

          {/* Sync Button */}
          {accessToken && (
            <button
              id="header-sync-sheets-btn"
              onClick={onSyncGoogleSheets}
              disabled={isSyncing}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-sm ${
                isSyncing
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              title="ធ្វើសមកាលកម្មទិន្នន័យទាំងអស់ទៅកាន់ Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'កំពុង Sync...' : 'Sync ទៅ Sheets'}
              </span>
            </button>
          )}

          {/* Open Google Sheet link if available */}
          {spreadsheetId && (
            <a
              id="header-open-sheet-link"
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-xs font-medium transition shadow-2xs"
              title="បើក Google Sheet ផ្ទុកទិន្នន័យ"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Google Sheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* User Sign In / User Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                id="header-user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-700 transition shadow-2xs"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[90px] truncate font-medium hidden sm:inline">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </button>

              {showUserMenu && (
                <div
                  id="header-user-dropdown"
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800">
                      {currentUser.displayName || 'អ្នកប្រើប្រាស់'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Google Connected
                    </span>
                  </div>

                  {spreadsheetId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                      បើក Google Sheet សាលា
                    </a>
                  )}

                  <button
                    id="header-dropdown-signout-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    ចាកចេញ (Sign Out)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-google-signin-btn"
              onClick={onGoogleSignIn}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs transition active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>ភ្ជាប់ Google Sheets</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
