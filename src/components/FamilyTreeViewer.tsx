import React, { useState, useEffect } from 'react';
import { FamilyMember, FamilyUnion, FamilyChild, SupportedLanguage } from '../types/family';
import { photoFor } from '../utils/photoStorage';
import { Plus, User, Eye, Printer, ChevronUp, Users, Heart } from 'lucide-react';

interface FamilyTreeViewerProps {
  members: FamilyMember[];
  unions: FamilyUnion[];
  children: FamilyChild[];
  currentUserId?: string;
  language: SupportedLanguage;
  onSelectMember: (member: FamilyMember) => void;
  onAddRelative: (targetMember: FamilyMember, relationType: 'father' | 'mother' | 'spouse' | 'child', union?: FamilyUnion) => void;
  onOpenAddMember: () => void;
}

export const FamilyTreeViewer: React.FC<FamilyTreeViewerProps> = ({
  members,
  unions,
  children,
  currentUserId,
  language,
  onSelectMember,
  onAddRelative,
  onOpenAddMember
}) => {
  const [theme, setTheme] = useState<'classic' | 'heritage' | 'soft'>('classic');
  const [rootMemberId, setRootMemberId] = useState<string>(() => {
    if (!members.length) return '';
    // Choose marked self member or first member
    const self = members.find(m => currentUserId && m.created_by === currentUserId && /\[Family Role:\s*Self\]/i.test(m.notes || ''));
    if (self) return self.id;
    return members[0].id;
  });

  const rootMember = members.find(m => m.id === rootMemberId) || members[0] || null;

  // Helpers
  const getParents = (personId: string): { father: FamilyMember | null; mother: FamilyMember | null } => {
    let father: FamilyMember | null = null;
    let mother: FamilyMember | null = null;

    const childLinks = children.filter(c => c.child_id === personId);
    for (const cl of childLinks) {
      const u = unions.find(x => x.id === cl.family_union_id);
      if (!u) continue;
      if (u.partner1_id) {
        const p1 = members.find(m => m.id === u.partner1_id);
        if (p1?.gender === 'male' && !father) father = p1;
        else if (p1?.gender === 'female' && !mother) mother = p1;
      }
      if (u.partner2_id) {
        const p2 = members.find(m => m.id === u.partner2_id);
        if (p2?.gender === 'male' && !father) father = p2;
        else if (p2?.gender === 'female' && !mother) mother = p2;
      }
    }
    return { father, mother };
  };

  const getSpouses = (personId: string): { spouse: FamilyMember; union: FamilyUnion }[] => {
    const list: { spouse: FamilyMember; union: FamilyUnion }[] = [];
    for (const u of unions) {
      if (u.relationship_type === 'spouse') {
        let spouseId: string | null = null;
        if (u.partner1_id === personId && u.partner2_id) spouseId = u.partner2_id;
        else if (u.partner2_id === personId && u.partner1_id) spouseId = u.partner1_id;

        if (spouseId) {
          const sp = members.find(m => m.id === spouseId);
          if (sp && !list.some(x => x.spouse.id === sp.id)) {
            list.push({ spouse: sp, union: u });
          }
        }
      }
    }
    return list;
  };

  const getChildrenForUnion = (unionId: string): FamilyMember[] => {
    const cl = children.filter(c => c.family_union_id === unionId);
    return cl.map(c => members.find(m => m.id === c.child_id)).filter(Boolean) as FamilyMember[];
  };

  const getDirectChildrenWithoutSpouse = (personId: string): FamilyMember[] => {
    const spouseUnionIds = new Set(
      unions.filter(u => u.relationship_type === 'spouse' && (u.partner1_id === personId || u.partner2_id === personId)).map(u => u.id)
    );
    const personUnionIds = new Set(
      unions.filter(u => u.partner1_id === personId || u.partner2_id === personId).map(u => u.id)
    );

    const childLinks = children.filter(c => personUnionIds.has(c.family_union_id) && !spouseUnionIds.has(c.family_union_id));
    return childLinks.map(c => members.find(m => m.id === c.child_id)).filter(Boolean) as FamilyMember[];
  };

  // Card color conventions:
  // Male: light blue (#e8f2fb, border blue-300)
  // Female: light pink (#fde8ef, border pink-300)
  // Current user: light green (#e8f5e9, border emerald-400)
  const getCardStyle = (member: FamilyMember, isRoot = false) => {
    const isSelf = currentUserId && member.created_by === currentUserId && (/\[Family Role:\s*Self\]/i.test(member.notes || '') || member.id === rootMember?.id);
    if (isRoot) {
      return "bg-emerald-50 border-2 border-emerald-500 shadow-sm";
    }
    if (member.gender === 'female') {
      return "bg-pink-50/70 border border-pink-300 hover:border-pink-500 shadow-xs";
    }
    if (member.gender === 'male') {
      return "bg-blue-50/70 border border-blue-300 hover:border-blue-500 shadow-xs";
    }
    return "bg-gray-50 border border-gray-300 shadow-xs";
  };

  const handlePrint = () => {
    window.print();
  };

  if (!members.length) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <div className="text-4xl mb-3">🌳</div>
        <h3 className="text-lg font-bold text-gray-800">Your Family Tree is Empty</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Add your first family member to start building your unified tree.
        </p>
        <button
          onClick={onOpenAddMember}
          className="mt-5 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm px-4 py-2 rounded-xl transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add First Member</span>
        </button>
      </div>
    );
  }

  const { father: rootFather, mother: rootMother } = rootMember ? getParents(rootMember.id) : { father: null, mother: null };
  const spouses = rootMember ? getSpouses(rootMember.id) : [];
  const directChildren = rootMember ? getDirectChildrenWithoutSpouse(rootMember.id) : [];

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Focus Person:
          </label>
          <select
            aria-label="Focus Person"
            value={rootMember?.id || ''}
            onChange={(e) => setRootMemberId(e.target.value)}
            className="text-sm font-medium border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-800 outline-none"
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.full_name} ({m.gender})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setTheme('classic')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${theme === 'classic' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600'}`}
            >
              Classic
            </button>
            <button
              onClick={() => setTheme('heritage')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${theme === 'heritage' ? 'bg-white text-amber-900 shadow-xs' : 'text-gray-600'}`}
            >
              Heritage
            </button>
            <button
              onClick={() => setTheme('soft')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${theme === 'soft' ? 'bg-white text-purple-900 shadow-xs' : 'text-gray-600'}`}
            >
              Family Album
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-xl transition cursor-pointer"
            title="Print Tree"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Tree</span>
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div
        className={`p-6 sm:p-10 rounded-2xl border overflow-auto min-h-[620px] transition ${
          theme === 'classic'
            ? 'bg-gradient-to-b from-white to-emerald-50/20 border-gray-200'
            : theme === 'heritage'
            ? 'bg-amber-50/40 border-amber-200'
            : 'bg-purple-50/30 border-purple-200'
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* 1. UPWARD ANCESTORS (Father & Mother) */}
          <div className="mb-6 flex flex-col items-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-3">
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Ancestors (Parents ↑)</span>
            </div>

            <div className="flex justify-center items-center gap-8">
              {/* Father Node */}
              {rootFather ? (
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-blue-700 uppercase mb-1">Father</span>
                  <div
                    onClick={() => setRootMemberId(rootFather.id)}
                    className={`w-44 p-3 rounded-xl cursor-pointer text-center transition hover:-translate-y-0.5 ${getCardStyle(rootFather)}`}
                  >
                    <img
                      src={photoFor(rootFather)}
                      alt=""
                      className="w-14 h-14 rounded-full mx-auto object-cover border-2 border-white shadow-xs"
                    />
                    <div className="font-bold text-sm text-gray-900 mt-2 truncate">
                      {rootFather.full_name}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {rootFather.biradari || "Shamsi"}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => rootMember && onAddRelative(rootMember, 'father')}
                  className="w-36 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-emerald-700 hover:border-emerald-400 bg-white/60 transition cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4 mb-1" />
                  <span>+ Add Father</span>
                </button>
              )}

              {/* Mother Node */}
              {rootMother ? (
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-pink-700 uppercase mb-1">Mother</span>
                  <div
                    onClick={() => setRootMemberId(rootMother.id)}
                    className={`w-44 p-3 rounded-xl cursor-pointer text-center transition hover:-translate-y-0.5 ${getCardStyle(rootMother)}`}
                  >
                    <img
                      src={photoFor(rootMother)}
                      alt=""
                      className="w-14 h-14 rounded-full mx-auto object-cover border-2 border-white shadow-xs"
                    />
                    <div className="font-bold text-sm text-gray-900 mt-2 truncate">
                      {rootMother.full_name}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {rootMother.biradari || "Shamsi"}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => rootMember && onAddRelative(rootMember, 'mother')}
                  className="w-36 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-emerald-700 hover:border-emerald-400 bg-white/60 transition cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4 mb-1" />
                  <span>+ Add Mother</span>
                </button>
              )}
            </div>

            {/* Vertical connector down to root person */}
            <div className="w-0.5 h-8 bg-gray-300 my-2" />
          </div>

          <p className="text-xs text-gray-500 mb-3">Select a relative to explore their family. Select the focus card for details, photos and editing.</p>
          {/* 2. ROOT PERSON (CENTER) */}
          {rootMember && (
            <div className="flex flex-col items-center z-10">
              <div
                onClick={() => onSelectMember(rootMember)}
                className={`w-64 p-4 rounded-2xl cursor-pointer text-center transition hover:-translate-y-0.5 ${getCardStyle(rootMember, true)}`}
              >
                <div className="text-[11px] font-extrabold text-emerald-800 tracking-wider uppercase mb-1.5">
                  ★ Focus Person
                </div>
                <img
                  src={photoFor(rootMember)}
                  alt=""
                  className="w-20 h-20 rounded-full mx-auto object-cover border-3 border-white shadow-md"
                />
                <div className="font-extrabold text-base text-gray-900 mt-2 truncate">
                  {rootMember.full_name}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {rootMember.biradari || "Shamsi"} • {rootMember.gender}
                </div>
                {rootMember.current_residence && (
                  <div className="text-[11px] text-gray-500 mt-1 truncate">
                    📍 {rootMember.current_residence}
                  </div>
                )}
                <div className="text-[10px] text-gray-400 mt-2">
                  Click to view profile & relations
                </div>
              </div>

              {/* Action buttons below root */}
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <button
                  onClick={() => onAddRelative(rootMember, 'spouse')}
                  className="inline-flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3 py-1.5 rounded-lg border border-gray-300 shadow-2xs transition cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-pink-500" />
                  <span>+ Add Spouse</span>
                </button>
                <button
                  onClick={() => onAddRelative(rootMember, 'child')}
                  className="inline-flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 text-xs px-3 py-1.5 rounded-lg border border-gray-300 shadow-2xs transition cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ Add Child</span>
                </button>
              </div>

              {/* Downward connector to spouses and children */}
              <div className="w-0.5 h-8 bg-gray-300 my-2" />
            </div>
          )}

          {/* 3. SPOUSE BRANCHES & DOWNWARD CHILDREN */}
          {spouses.length > 0 ? (
            <div className="w-full mt-2">
              <div className="text-xs font-bold text-center text-gray-400 uppercase tracking-wider mb-4">
                Marriage Branches ({spouses.length} Spouse{spouses.length > 1 ? 's' : ''})
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                {spouses.map(({ spouse, union }, sIdx) => {
                  const branchKids = getChildrenForUnion(union.id);
                  return (
                    <div
                      key={spouse.id}
                      className="bg-white/90 p-4 rounded-2xl border border-pink-200/90 shadow-xs flex flex-col items-center"
                    >
                      {/* Spouse Card */}
                      <div className="text-xs font-bold text-pink-700 mb-1 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-500" />
                        <span>Spouse {sIdx + 1} ({spouse.gender === 'female' ? 'Wife' : 'Husband'})</span>
                      </div>

                      <div
                        onClick={() => setRootMemberId(spouse.id)}
                        className={`w-full max-w-[220px] p-3 rounded-xl cursor-pointer text-center transition hover:-translate-y-0.5 ${getCardStyle(spouse)}`}
                      >
                        <img
                          src={photoFor(spouse)}
                          alt=""
                          className="w-14 h-14 rounded-full mx-auto object-cover border-2 border-white shadow-xs"
                        />
                        <div className="font-bold text-sm text-gray-900 mt-2 truncate">
                          {spouse.full_name}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">
                          {spouse.biradari || "Shamsi"}
                        </div>
                      </div>

                      {/* Add child to this specific couple */}
                      <div className="mt-3 w-full flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                        <span className="font-bold text-gray-600">
                          Children ({branchKids.length})
                        </span>
                        <button
                          onClick={() => onAddRelative(rootMember!, 'child', union)}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Child</span>
                        </button>
                      </div>

                      {/* Children Cards for this couple */}
                      <div className="w-full mt-2 space-y-2">
                        {branchKids.length ? (
                          branchKids.map(kid => (
                            <div
                              key={kid.id}
                              onClick={() => setRootMemberId(kid.id)}
                              className={`p-2 rounded-xl flex items-center gap-3 cursor-pointer transition hover:-translate-y-0.5 ${getCardStyle(kid)}`}
                            >
                              <img
                                src={photoFor(kid)}
                                alt=""
                                className="w-9 h-9 rounded-full object-cover border border-white"
                              />
                              <div className="flex-1 min-w-0 text-left">
                                <div className="text-xs font-bold text-gray-900 truncate">
                                  {kid.full_name}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {kid.gender === 'male' ? 'Son' : 'Daughter'}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRootMemberId(kid.id);
                                }}
                                title="Center on this child"
                                className="text-gray-400 hover:text-emerald-700 p-1 rounded"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400 py-3 text-center bg-gray-50 rounded-xl">
                            No children recorded for this marriage yet.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          {(directChildren.length > 0 || spouses.length === 0) && (
            /* Preserve single-parent children even when other marriages exist. */
            <div className="w-full max-w-xl mt-4">
              <div className="text-xs font-bold text-center text-gray-400 uppercase tracking-wider mb-3">
                Other recorded child branches
              </div>

              {directChildren.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {directChildren.map(kid => (
                    <div
                      key={kid.id}
                      onClick={() => setRootMemberId(kid.id)}
                      className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition hover:-translate-y-0.5 ${getCardStyle(kid)}`}
                    >
                      <img
                        src={photoFor(kid)}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover border-2 border-white"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {kid.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {kid.gender === 'male' ? 'Son' : 'Daughter'}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRootMemberId(kid.id);
                        }}
                        title="Make Focus Person"
                        className="text-gray-400 hover:text-emerald-700 p-1.5"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-xs text-gray-400 bg-white/70 border border-dashed border-gray-300 rounded-xl py-6">
                  No children added yet. Add a spouse or child to extend the family tree downwards.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
