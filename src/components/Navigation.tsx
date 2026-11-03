import React from 'react';
import { SupportedLanguage } from '../types/family';
import { Home, Network, Users, Compass, Image, ShieldCheck, Settings, LogOut, Download } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  userEmail?: string;
  onLogout: () => void;
  onExportHTML?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  language,
  onChangeLanguage,
  userEmail,
  onLogout,
  onExportHTML
}) => {
  const labels = {
    en: {
      dashboard: "Dashboard",
      tree: "Family Tree",
      members: "Members",
      kinship: "Kinship Finder",
      memories: "Memories",
      tests: "DB Integrity Tests",
      settings: "Settings",
      logout: "Logout",
      export: "Download Standalone 7.8 HTML"
    },
    ur: {
      dashboard: "ڈیش بورڈ",
      tree: "خاندانی شجرہ",
      members: "ارکان خاندان",
      kinship: "رشتہ داری تلاش",
      memories: "یادگاریں اور تصاویر",
      tests: "ٹیسٹ سسٹم",
      settings: "ترتیبات",
      logout: "لاگ آؤٹ",
      export: "مستقل HTML ڈاؤنلوڈ"
    },
    hi: {
      dashboard: "डैशबोर्ड",
      tree: "परिवार वृक्ष",
      members: "परिवार सदस्य",
      kinship: "रिश्ता खोजक",
      memories: "स्मृतियाँ और चित्र",
      tests: "डेटाबेस परीक्षण",
      settings: "सेटिंग्स",
      logout: "लॉग आउट",
      export: "स्टैंडअलोन HTML डाउनलोड"
    }
  }[language];

  const tabs = [
    { id: 'dashboard', label: labels.dashboard, icon: Home },
    { id: 'tree', label: labels.tree, icon: Network },
    { id: 'members', label: labels.members, icon: Users },
    { id: 'kinship', label: labels.kinship, icon: Compass },
    { id: 'memories', label: labels.memories, icon: Image },
    { id: 'tests', label: labels.tests, icon: ShieldCheck },
    { id: 'settings', label: labels.settings, icon: Settings }
  ];

  return (
    <>
      <header className="bg-emerald-800 text-white px-5 py-3.5 flex flex-wrap justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🌳</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              ShamsiTree
              <span className="text-xs bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded-full font-mono">
                Unified 7.8
              </span>
            </h1>
            <p className="text-xs text-emerald-200">
              One Unified Family System • خاندانی درخت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onExportHTML && (
            <button
              onClick={onExportHTML}
              title={labels.export}
              className="hidden md:flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg border border-emerald-600 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{labels.export}</span>
            </button>
          )}

          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value as SupportedLanguage)}
            className="bg-emerald-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-emerald-700 outline-none"
          >
            <option value="en">English</option>
            <option value="ur">اردو</option>
            <option value="hi">हिन्दी</option>
          </select>

          {userEmail && (
            <span className="text-xs text-emerald-200 hidden sm:inline-block max-w-[180px] truncate">
              {userEmail}
            </span>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{labels.logout}</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <nav className="bg-white border-b border-gray-200 px-4 flex gap-1 overflow-x-auto shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                isActive
                  ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
