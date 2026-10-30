import React, { useState, useMemo } from 'react';
import { FamilyMember, FamilyUnion, FamilyChild, KinshipResult, SupportedLanguage } from '../types/family';
import { KinshipEngine } from '../utils/kinshipEngine';
import { photoFor } from '../utils/photoStorage';
import { Compass, ArrowRightLeft, GitCommit, CheckCircle2, AlertCircle } from 'lucide-react';

interface KinshipFinderProps {
  members: FamilyMember[];
  unions: FamilyUnion[];
  children: FamilyChild[];
  language: SupportedLanguage;
}

export const KinshipFinder: React.FC<KinshipFinderProps> = ({
  members,
  unions,
  children,
  language
}) => {
  const [personAId, setPersonAId] = useState<string>('');
  const [personBId, setPersonBId] = useState<string>('');

  const engine = useMemo(() => {
    return new KinshipEngine(members, unions, children);
  }, [members, unions, children]);

  const personA = members.find(m => m.id === personAId) || null;
  const personB = members.find(m => m.id === personBId) || null;

  const result: KinshipResult | null = useMemo(() => {
    if (!personAId || !personBId) return null;
    return engine.calculateRelationship(personAId, personBId);
  }, [engine, personAId, personBId]);

  const handleSwap = () => {
    const temp = personAId;
    setPersonAId(personBId);
    setPersonBId(temp);
  };

  const t = {
    en: {
      title: "Kinship & Relationship Finder",
      subtitle: "Discover how any two family members are connected, along with exact English, Urdu, and Hindi kinship terms.",
      selectA: "Select First Person (Person A)",
      selectB: "Select Second Person (Person B)",
      swap: "Swap Persons",
      resultHeading: "Relationship Findings",
      forwardRelation: "Person A’s relationship to Person B",
      relationTo: "— relationship to",
      reverseRelation: "Relation from Person B to Person A",
      degree: "Generational Distance",
      pathHeading: "Genealogical Path",
      noSelection: "Please select both Person A and Person B above to analyze their relationship.",
      emptyTree: "Add family members first to use the Kinship Finder."
    },
    ur: {
      title: "رشتہ داری اور شجرہ معلوم کریں",
      subtitle: "خاندان کے کسی بھی دو افراد کے درمیان تعلق، قرابت اور درست رشتے (اردو، انگریزی اور ہندی) میں معلوم کریں۔",
      selectA: "پہلا فرد منتخب کریں (فرد الف)",
      selectB: "دوسرا فرد منتخب کریں (فرد ب)",
      swap: "افراد کو تبدیل کریں",
      resultHeading: "رشتہ داری کے نتائج",
      forwardRelation: "فرد (الف) کا فرد (ب) سے رشتہ",
      relationTo: "— رشتہ بہ",
      reverseRelation: "فرد (ب) کا فرد (الف) سے رشتہ",
      degree: "فاصلہ (درجات)",
      pathHeading: "خاندانی سلسلہ و شجرہ",
      noSelection: "رشتہ معلوم کرنے کے لیے اوپر سے فرد (الف) اور فرد (ب) کا انتخاب کریں۔",
      emptyTree: "رشتہ تلاش کرنے کے لیے پہلے خاندانی افراد شامل کریں۔"
    },
    hi: {
      title: "रिश्ता व वंशावली खोजक",
      subtitle: "परिवार के किन्हीं दो सदस्यों के बीच संबंध और सही पारिवारिक रिश्ते (हिंदी, अंग्रेजी, उर्दू) में जानें।",
      selectA: "पहला व्यक्ति चुनें (व्यक्ति A)",
      selectB: "दूसरा व्यक्ति चुनें (व्यक्ति B)",
      swap: "स्थान बदलें",
      resultHeading: "रिश्ता परिणाम",
      forwardRelation: "व्यक्ति A का व्यक्ति B से रिश्ता",
      relationTo: "— रिश्ता इनसे",
      reverseRelation: "व्यक्ति B का व्यक्ति A से रिश्ता",
      degree: "पीढ़ियों की दूरी",
      pathHeading: "वंशावली पथ",
      noSelection: "रिश्ता विश्लेषण देखने के लिए ऊपर दोनों व्यक्तियों का चयन करें।",
      emptyTree: "रिश्ता खोजने के लिए पहले परिवार के सदस्य जोड़ें।"
    }
  }[language];

  if (members.length < 2) {
    return (
      <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center max-w-xl mx-auto">
        <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-bold text-gray-800 text-lg">{t.emptyTree}</h3>
        <p className="text-xs text-gray-500 mt-1">
          You need at least two connected family members to calculate relationships.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Kinship Calculator</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t.title}</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* Selectors Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          {/* Person A */}
          <div className="md:col-span-3 space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase">
              {t.selectA}
            </label>
            <select
              value={personAId}
              onChange={(e) => setPersonAId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium outline-none focus:border-emerald-600"
            >
              <option value="">-- Choose Person A --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.gender})
                </option>
              ))}
            </select>

            {personA && (
              <div className="flex items-center gap-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <img
                  src={photoFor(personA)}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-white"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-gray-900 truncate">{personA.full_name}</div>
                  <div className="text-xs text-gray-500">{personA.gender} • {personA.biradari || "Shamsi"}</div>
                </div>
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              onClick={handleSwap}
              disabled={!personAId && !personBId}
              title={t.swap}
              className="p-3 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-full transition cursor-pointer disabled:opacity-40"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Person B */}
          <div className="md:col-span-3 space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase">
              {t.selectB}
            </label>
            <select
              value={personBId}
              onChange={(e) => setPersonBId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium outline-none focus:border-emerald-600"
            >
              <option value="">-- Choose Person B --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.gender})
                </option>
              ))}
            </select>

            {personB && (
              <div className="flex items-center gap-3 p-3 bg-pink-50/70 border border-pink-200 rounded-xl">
                <img
                  src={photoFor(personB)}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-white"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-gray-900 truncate">{personB.full_name}</div>
                  <div className="text-xs text-gray-500">{personB.gender} • {personB.biradari || "Shamsi"}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Display */}
      {result ? (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-gray-900 text-lg">{t.resultHeading}</h3>
            </div>
            {result.degreeOfSeparation >= 0 && (
              <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                {t.degree}: {result.degreeOfSeparation} step{result.degreeOfSeparation === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {/* Bidirectional Term Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Person A to Person B */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                {t.forwardRelation}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                <b className="text-gray-900">{personA?.full_name}</b> {t.relationTo} <b className="text-gray-900">{personB?.full_name}</b>:
              </div>
              <div className="text-2xl font-black text-emerald-950 mt-1">
                {result.reverseRelationshipEn}
              </div>
              <div className="text-lg font-bold text-emerald-800 mt-1">
                {result.reverseRelationshipUr}
              </div>
              <div className="text-sm font-medium text-emerald-700 mt-0.5">
                {result.reverseRelationshipHi}
              </div>
            </div>

            {/* Person B to Person A */}
            <div className="bg-teal-50/70 border border-teal-200 p-5 rounded-2xl">
              <div className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
                {t.reverseRelation}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                <b className="text-gray-900">{personB?.full_name}</b> {t.relationTo} <b className="text-gray-900">{personA?.full_name}</b>:
              </div>
              <div className="text-2xl font-black text-teal-950 mt-1">
                {result.relationshipEn}
              </div>
              <div className="text-lg font-bold text-teal-800 mt-1">
                {result.relationshipUr}
              </div>
              <div className="text-sm font-medium text-teal-700 mt-0.5">
                {result.relationshipHi}
              </div>
            </div>
          </div>

          {/* Detailed genealogical path */}
          {result.path && result.path.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-emerald-700" />
                <span>{t.pathHeading}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-xs bg-blue-100 text-blue-900 px-3 py-1.5 rounded-lg border border-blue-200">
                  {personA?.full_name}
                </span>

                {result.path.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-gray-400 text-xs font-bold">
                      → ({step.stepDescription}) →
                    </span>
                    <span className="font-bold text-xs bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200">
                      {step.personName}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex flex-col items-center gap-2">
          <AlertCircle className="w-5 h-5 text-gray-400" />
          <span>{t.noSelection}</span>
        </div>
      )}
    </div>
  );
};
