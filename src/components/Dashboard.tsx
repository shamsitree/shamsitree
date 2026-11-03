import React from 'react';
import { FamilyTree, FamilyMember, FamilyUnion, SupportedLanguage } from '../types/family';
import { Network, Users, HeartHandshake, PlusCircle, Compass, ShieldCheck } from 'lucide-react';

interface DashboardProps {
  tree: FamilyTree | null;
  members: FamilyMember[];
  unions: FamilyUnion[];
  language: SupportedLanguage;
  onOpenAddMember: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tree,
  members,
  unions,
  language,
  onOpenAddMember,
  onNavigateTab
}) => {
  const maleCount = members.filter(m => m.gender === 'male').length;
  const femaleCount = members.filter(m => m.gender === 'female').length;
  const livingCount = members.filter(m => !m.date_of_death).length;
  const deceasedCount = members.filter(m => !!m.date_of_death).length;
  const spouseUnionsCount = unions.filter(u => u.relationship_type === 'spouse' && u.partner1_id && u.partner2_id).length;

  const t = {
    en: {
      welcome: "Welcome to ShamsiTree Unified",
      subtitle: "Your family history, kinship relations, and multi-generational lineages connected in one consistent system.",
      treeCard: "Active Family Tree",
      treeCode: "Tree ID Code",
      membersCard: "Total Family Members",
      unionsCard: "Family Unions & Marriages",
      addMemberBtn: "Add Family Member",
      viewTreeBtn: "Open Unified Tree",
      findKinshipBtn: "Find Kinship Relation",
      checkIntegrityBtn: "Run Integrity Tests",
      statsTitle: "Lineage Demographics",
      male: "Men (Male)",
      female: "Women (Female)",
      living: "Living Relatives",
      deceased: "Deceased Relatives",
      ruleNotice: "Unified System Notice",
      ruleText: "Form A and Form B have been permanently unified. All members and multi-spouse branches now read and save to the same family_unions and family_children database tables with zero data duplication."
    },
    ur: {
      welcome: "شمسی ٹری کے متفقہ نظام میں خوش آمدید",
      subtitle: "آپ کی خاندانی تاریخ، شجرہ نسب اور رشتہ داریاں اب ایک ہی مستحکم اور متفقہ نظام میں محفوظ ہیں۔",
      treeCard: "موجودہ خاندانی درخت",
      treeCode: "شجرہ شناختی کوڈ",
      membersCard: "کل ارکان خاندان",
      unionsCard: "ازدواجی جوڑے اور شاخیں",
      addMemberBtn: "نیا فرد شامل کریں",
      viewTreeBtn: "شجرہ دیکھیں",
      findKinshipBtn: "رشتہ داری تلاش کریں",
      checkIntegrityBtn: "ڈیٹا بیس چیک کریں",
      statsTitle: "خاندانی اعداد و شمار",
      male: "مرد حضرات",
      female: "خواتین",
      living: "حیات ارکان",
      deceased: "مرحومین",
      ruleNotice: "متفقہ نظام کی وضاحت",
      ruleText: "پرانے فارم اے اور فارم بی کو مکمل طور پر ختم کر کے ایک ہی جامع فیملی سسٹم قائم کر دیا گیا ہے۔ تمام ارکان اور شادیاں براہ راست فیملی یونینز ٹیبل سے مربوط ہیں۔"
    },
    hi: {
      welcome: "शम्सीट्री एकीकृत प्रणाली में आपका स्वागत है",
      subtitle: "आपका पारिवारिक इतिहास, वंशावली और रिश्ते अब एक ही पारदर्शी और एकीकृत प्रणाली में जुड़े हैं।",
      treeCard: "सक्रिय परिवार वृक्ष",
      treeCode: "ट्री आईडी कोड",
      membersCard: "कुल परिवार सदस्य",
      unionsCard: "वैवाहिक जोड़ियां",
      addMemberBtn: "नया सदस्य जोड़ें",
      viewTreeBtn: "परिवार वृक्ष देखें",
      findKinshipBtn: "रिश्ता खोजें",
      checkIntegrityBtn: "डेटाबेस परीक्षण चलाएं",
      statsTitle: "पारिवारिक आंकड़े",
      male: "पुरुष",
      female: "महिलाएं",
      living: "जीवित परिजन",
      deceased: "स्वर्गीय परिजन",
      ruleNotice: "एकीकृत प्रणाली सूचना",
      ruleText: "फॉर्म A और फॉर्म B को स्थायी रूप से हटाकर एक एकीकृत प्रणाली बना दी गई है। सभी सदस्य और बहु-विवाह शाखाएं सीधे एक ही डेटाबेस टेबल से प्रबंधित हैं।"
    }
  }[language];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.welcome}</h2>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed">
            {t.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onOpenAddMember}
              className="flex items-center gap-2 bg-white text-emerald-900 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs hover:bg-emerald-50 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>{t.addMemberBtn}</span>
            </button>
            <button
              onClick={() => onNavigateTab('tree')}
              className="flex items-center gap-2 bg-emerald-900/60 hover:bg-emerald-900/80 text-white font-medium text-sm px-4 py-2.5 rounded-xl border border-emerald-500/40 transition cursor-pointer"
            >
              <Network className="w-4 h-4 text-emerald-300" />
              <span>{t.viewTreeBtn}</span>
            </button>
            <button
              onClick={() => onNavigateTab('kinship')}
              className="flex items-center gap-2 bg-emerald-900/60 hover:bg-emerald-900/80 text-white font-medium text-sm px-4 py-2.5 rounded-xl border border-emerald-500/40 transition cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>{t.findKinshipBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 text-sm font-medium">
              <span>{t.treeCard}</span>
              <Network className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2 truncate">
              {tree?.name || "My Family Tree"}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">{t.treeCode}:</span>
            <span className="font-mono bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
              {tree?.tree_code || "Not assigned"}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 text-sm font-medium">
              <span>{t.membersCard}</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">
              {members.length}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{maleCount} {t.male}</span>
            <span>•</span>
            <span>{femaleCount} {t.female}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 text-sm font-medium">
              <span>{t.unionsCard}</span>
              <HeartHandshake className="w-5 h-5 text-pink-600" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">
              {spouseUnionsCount}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{unions.length} total branches</span>
            <button
              onClick={() => onNavigateTab('tests')}
              className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.checkIntegrityBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demographics & Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>{t.statsTitle}</span>
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>{t.male}</span>
                <span>{maleCount} ({members.length ? Math.round((maleCount / members.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${members.length ? (maleCount / members.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>{t.female}</span>
                <span>{femaleCount} ({members.length ? Math.round((femaleCount / members.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-pink-500 h-2 rounded-full"
                  style={{ width: `${members.length ? (femaleCount / members.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between text-xs text-gray-600 border-t border-gray-100">
              <span>{t.living}: <b className="text-gray-900">{livingCount}</b></span>
              <span>{t.deceased}: <b className="text-gray-900">{deceasedCount}</b></span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-emerald-950 text-base flex items-center gap-2 mb-2">
              <span className="text-lg">🌿</span>
              <span>{t.ruleNotice}</span>
            </h3>
            <p className="text-emerald-900/80 text-xs sm:text-sm leading-relaxed">
              {t.ruleText}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-800">
            <span>Color code: Men (Light Blue) • Women (Pink) • Self (Green)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
