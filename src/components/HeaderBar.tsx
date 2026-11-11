import React, { useState } from 'react';
import { 
  Plus, Users, Wifi, WifiOff, Search, Download, 
  RotateCcw, Sparkles, User, Printer
} from 'lucide-react';
import { ConnectedUserInfo } from '../types';

interface HeaderBarProps {
  onAddRow: () => void;
  isConnected: boolean;
  activeUsers: ConnectedUserInfo[];
  currentUserName: string;
  onUpdateUserName: (name: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExportCSV: () => void;
  onResetDemo: () => void;
  onPrint: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onAddRow,
  isConnected,
  activeUsers,
  currentUserName,
  onUpdateUserName,
  searchQuery,
  onSearchChange,
  onExportCSV,
  onResetDemo,
  onPrint,
}) => {
  const [showUsersPopover, setShowUsersPopover] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(currentUserName);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim());
      setShowNameModal(false);
    }
  };

  return (
    <header className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Textile Lot Tracker
                </h1>
                {isConnected ? (
                  <button
                    type="button"
                    onClick={() => setShowUsersPopover(!showUsersPopover)}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                    title="सक्रिय यूज़र्स देखें"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>सिंक चालू ({activeUsers.length || 1})</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    री-कनेक्टिंग...
                  </span>
                )}
              </div>
            </div>

            {/* Active Users Popover */}
            {showUsersPopover && (
              <div className="absolute left-4 top-14 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between font-bold text-zinc-800 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 pb-2 mb-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    सक्रिय उपयोगकर्ता ({activeUsers.length || 1})
                  </span>
                  <button 
                    onClick={() => setShowUsersPopover(false)}
                    className="text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {activeUsers.length === 0 ? (
                    <div className="text-zinc-400 text-xs py-1">आप कनेक्टेड हैं: {currentUserName}</div>
                  ) : (
                    activeUsers.map(u => (
                      <div key={u.id} className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                        <span className="font-medium truncate max-w-[140px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {u.userName}
                        </span>
                        {u.userName === currentUserName && (
                          <span className="text-[10px] text-blue-600 font-bold">(You)</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Prominent Search Bar (Only search bar is displayed, no extra boxes) */}
          <div className="relative flex-1 w-full max-w-xl">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="लॉट नं, मास्टर, कारीगर, कपड़ा, साइज़ से खोजें (Search)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 shadow-xs transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action: User, Print, Export, Add Row */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            {/* User Profile Badge */}
            <button
              type="button"
              onClick={() => {
                setTempName(currentUserName);
                setShowNameModal(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="अपना नाम बदलें"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="max-w-[70px] sm:max-w-[110px] truncate">{currentUserName}</span>
            </button>

            {/* Print Sheet */}
            <button
              type="button"
              onClick={onPrint}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="प्रिंट लेजर शीट (Print)"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={onExportCSV}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="CSV डाउनलोड करें"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Reset Demo */}
            <button
              type="button"
              onClick={onResetDemo}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="डेमो डेटा रीसेट"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Add Row Button */}
            <button
              type="button"
              onClick={onAddRow}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">+ नया लॉट (Add Row)</span>
              <span className="sm:hidden">+ Lot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Name Change Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              अपना नाम दर्ज करें (Your Name)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              अन्य सभी ऑनलाइन यूजर्स को पता चलेगा कि कौन-सा लॉट या विवरण आप अपडेट कर रहे हैं।
            </p>
            <form onSubmit={handleSaveName} className="space-y-4">
              <input
                type="text"
                required
                placeholder="उदा. रमेश (मैनेजर), शमीम"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 rounded-lg cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                >
                  सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
