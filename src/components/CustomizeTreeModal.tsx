/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person, TreeViewFilter, CustomTreeView } from '../types/family';
import { getAncestorIds, getDescendantIds, getCore50MemberIds } from '../data/sampleFamily';
import {
  Sliders,
  X,
  Search,
  CheckSquare,
  Square,
  Users,
  GitBranch,
  Bookmark,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface CustomizeTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMembers: Record<string, Person>;
  filter: TreeViewFilter;
  onFilterChange: (newFilter: TreeViewFilter) => void;
  savedViews: CustomTreeView[];
  onSaveView: (name: string, description: string) => void;
  onLoadView: (view: CustomTreeView) => void;
  onDeleteView: (viewId: string) => void;
  visibleCount: number;
  totalCount: number;
  bridgeCount: number;
  isDisconnected: boolean;
}

export const CustomizeTreeModal: React.FC<CustomizeTreeModalProps> = ({
  isOpen,
  onClose,
  allMembers,
  filter,
  onFilterChange,
  savedViews,
  onSaveView,
  onLoadView,
  onDeleteView,
  visibleCount,
  totalCount,
  bridgeCount,
  isDisconnected,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'range' | 'marriages' | 'saved'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [newViewName, setNewViewName] = useState('');
  const [newViewDesc, setNewViewDesc] = useState('');

  if (!isOpen) return null;

  const memberList = Object.values(allMembers);

  // Search filter
  const filteredSearchList = memberList.filter((m) => {
    const q = searchTerm.toLowerCase();
    return (
      m.firstName.toLowerCase().includes(q) ||
      m.lastName.toLowerCase().includes(q) ||
      (m.arabicName && m.arabicName.includes(q)) ||
      (m.tags && m.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  // Multiple marriage subjects (e.g. Anwar Kamal)
  const multiMarriageMembers = memberList.filter((m) => m.spouses.length > 1);

  // Handlers for Member Selection
  const handleSelectAll = () => {
    onFilterChange({
      ...filter,
      selectedMemberIds: memberList.map((m) => m.id),
    });
  };

  const handleSelectNone = () => {
    onFilterChange({
      ...filter,
      selectedMemberIds: [],
    });
  };

  const handleSelectCore50 = () => {
    const core50 = memberList.slice(0,50).map(m=>m.id);
    onFilterChange({
      ...filter,
      selectedMemberIds: core50,
      generationLimit: 'all',
      endPersonId: undefined,
    });
  };

  const handleSelectDescendants = (personId: string) => {
    const desc = getDescendantIds(personId, allMembers);
    desc.add(personId);
    // Also include their spouses
    const spouses = new Set<string>();
    desc.forEach((id) => {
      allMembers[id]?.spouses.forEach((s) => spouses.add(s.spouseId));
    });
    spouses.forEach((id) => desc.add(id));

    onFilterChange({
      ...filter,
      selectedMemberIds: Array.from(desc),
    });
  };

  const handleSelectAncestors = (personId: string) => {
    const ancs = getAncestorIds(personId, allMembers);
    ancs.add(personId);
    onFilterChange({
      ...filter,
      selectedMemberIds: Array.from(ancs),
    });
  };

  const toggleMember = (id: string) => {
    const current = new Set(filter.selectedMemberIds);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    onFilterChange({
      ...filter,
      selectedMemberIds: Array.from(current),
    });
  };

  // Toggle specific marriage branch (e.g. Ruhi Kamal vs Ruhi Fakhir for Anwar Kamal)
  const toggleMarriageBranch = (personId: string, spouseId: string) => {
    const currentActive = filter.activeMarriageBranches[personId]
      ? [...filter.activeMarriageBranches[personId]]
      : allMembers[personId].spouses.map((s) => s.spouseId);

    let updated: string[];
    if (currentActive.includes(spouseId)) {
      // do not allow removing if only 1 is active, or toggle
      updated = currentActive.filter((id) => id !== spouseId);
    } else {
      updated = [...currentActive, spouseId];
    }

    onFilterChange({
      ...filter,
      activeMarriageBranches: {
        ...filter.activeMarriageBranches,
        [personId]: updated,
      },
    });
  };

  const handleSaveViewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim()) return;
    onSaveView(newViewName.trim(), newViewDesc.trim() || 'Custom user configuration');
    setNewViewName('');
    setNewViewDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Customize My Tree</h2>
              <p className="text-xs text-slate-500">
                Filter family members, select ancestral ranges, and isolate marriage branches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Counter Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700 font-mono">
              <Users className="w-3.5 h-3.5" />
              <span>
                Showing {visibleCount} of {totalCount} members
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Nav Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-slate-50/30 text-xs font-medium">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Select Members ({filter.selectedMemberIds.length})
          </button>

          <button
            onClick={() => setActiveTab('range')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'range'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Range & Lineage
          </button>

          <button
            onClick={() => setActiveTab('marriages')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'marriages'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-4 h-4 text-rose-500" />
            Marriage Branches
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            Saved Views ({savedViews.length})
          </button>
        </div>

        {/* Warning if disconnected subtrees detected */}
        {isDisconnected && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Notice:</strong> Your current selection contains separate disconnected family branches.
              </span>
            </div>
            <button
              onClick={() => onFilterChange({ ...filter, includeBridgeAncestors: false })}
              className="text-xs font-bold underline hover:text-amber-950 ml-4 shrink-0"
            >
              Add Connector Bridges
            </button>
          </div>
        )}

        {/* Tab 1: Member Selection & Search */}
        {activeTab === 'members' && (
          <div className="flex-1 overflow-hidden flex flex-col p-6">
            {/* Quick action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search family member by name or tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectCore50}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Demo requirement: Select exactly 50 of 100 members"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Select First 50
                </button>

                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Select All ({totalCount})
                </button>

                <button
                  type="button"
                  onClick={handleSelectNone}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Checkbox list */}
            <div className="flex-1 overflow-y-auto mt-4 divide-y divide-slate-100 pr-2">
              {filteredSearchList.map((person) => {
                const isSelected = filter.selectedMemberIds.includes(person.id);

                return (
                  <div
                    key={person.id}
                    className="py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <label className="flex items-center gap-3 cursor-pointer select-none min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMember(person.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {person.firstName} {person.lastName}
                          </span>
                          {person.arabicName && (
                            <span className="text-[11px] text-slate-500 font-serif" dir="rtl">
                              {person.arabicName}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                            Gen {person.generation}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">
                          {person.birthDate ? `Born ${person.birthDate}` : 'Date unknown'} · {person.occupation || 'Family Member'}
                        </p>
                      </div>
                    </label>

                    {/* Branch action triggers */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-4">
                      <button
                        type="button"
                        onClick={() => handleSelectDescendants(person.id)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded font-medium transition-colors"
                      >
                        + Descendants
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAncestors(person.id)}
                        className="text-[10px] text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded font-medium transition-colors"
                      >
                        + Ancestors
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Range & Lineage */}
        {activeTab === 'range' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* A & B: Start & End Person */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Start From Person (Root / Patriarch)
                </label>
                <select
                  value={filter.startPersonId}
                  onChange={(e) => onFilterChange({ ...filter, startPersonId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Ancestors (Complete Tree)</option>
                  {memberList.map((m) => (
                    <option key={`start-${m.id}`} value={m.id}>
                      {m.firstName} {m.lastName} (Gen {m.generation})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Example: Select <strong>Abdul Mannan</strong> or <strong>Anwar Kamal</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  End At Person (Direct Lineage Path)
                </label>
                <select
                  value={filter.endPersonId || ''}
                  onChange={(e) =>
                    onFilterChange({
                      ...filter,
                      endPersonId: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="">None (Show Full Descendant Tree)</option>
                  {memberList.map((m) => (
                    <option key={`end-${m.id}`} value={m.id}>
                      {m.firstName} {m.lastName} (Gen {m.generation})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Traces the connecting path (e.g. Abdul Mannan → Anwar Kamal → Abdul Ghani)
                </p>
              </div>
            </div>

            {/* D. Generation Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Generation Depth Limit
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5, 'all'].map((g) => {
                  const isActive = filter.generationLimit === g;
                  return (
                    <button
                      key={`gen-limit-${g}`}
                      type="button"
                      onClick={() => onFilterChange({ ...filter, generationLimit: g as any })}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {g === 'all' ? 'All Generations' : `${g} Generation${Number(g) > 1 ? 's' : ''}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bridge Ancestors Option */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Include Bridge Ancestors</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Render intermediate non-selected ancestors as dotted bridge nodes so relationships stay logical.
                </p>
              </div>
              <input
                type="checkbox"
                checked={filter.includeBridgeAncestors}
                onChange={(e) =>
                  onFilterChange({ ...filter, includeBridgeAncestors: e.target.checked })
                }
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Marriage Branches (Multiple Marriages Test) */}
        {activeTab === 'marriages' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200">
              <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-rose-600" />
                Multiple Marriage Isolation Engine
              </h3>
              <p className="text-xs text-rose-800 mt-1">
                When a family member has multiple spouses, you can choose to display the first marriage branch, the second marriage branch, or both. Children will strictly stay attached to their true biological mother!
              </p>
            </div>

            {multiMarriageMembers.map((person) => {
              const activeSpouses = filter.activeMarriageBranches[person.id] || person.spouses.map((s) => s.spouseId);

              return (
                <div key={`multi-${person.id}`} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {person.firstName} {person.lastName}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        Has {person.spouses.length} recorded marriages
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onFilterChange({
                            ...filter,
                            activeMarriageBranches: {
                              ...filter.activeMarriageBranches,
                              [person.id]: person.spouses.map((s) => s.spouseId),
                            },
                          })
                        }
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Show Both Branches
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {person.spouses.map((sp) => {
                      const spouseObj = allMembers[sp.spouseId];
                      const isBranchActive = activeSpouses.includes(sp.spouseId);

                      // Find children born to this specific union
                      const unionChildren = memberList.filter(
                        (c) =>
                          c.parentIds.includes(person.id) &&
                          c.parentIds.includes(sp.spouseId)
                      );

                      return (
                        <div
                          key={`spouse-branch-${sp.spouseId}`}
                          className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                            isBranchActive
                              ? 'bg-rose-50/40 border-rose-200'
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isBranchActive}
                              onChange={() => toggleMarriageBranch(person.id, sp.spouseId)}
                              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">
                                  Marriage #{sp.order}: {spouseObj ? `${spouseObj.firstName} ${spouseObj.lastName}` : sp.spouseId}
                                </span>
                                {sp.marriageDate && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    (m. {sp.marriageDate})
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Children in this branch:{' '}
                                {unionChildren.length > 0
                                  ? unionChildren.map((c) => c.firstName).join(', ')
                                  : 'None'}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs font-semibold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 shadow-2xs">
                            {isBranchActive ? 'Branch Active' : 'Excluded'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Saved Views Manager */}
        {activeTab === 'saved' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Save current view form */}
            <form onSubmit={handleSaveViewSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Save Current Selection As Named View
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="View Name (e.g. Anwar Kamal First Marriage)"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Short Description (optional)"
                  value={newViewDesc}
                  onChange={(e) => setNewViewDesc(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save View Preset
                </button>
              </div>
            </form>

            {/* Existing Saved Views */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Available View Presets
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {savedViews.map((view) => (
                  <div
                    key={view.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{view.name}</span>
                        <span className="text-[10px] text-slate-600 font-mono">
                          {view.selectedMemberIds.length} members
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {view.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadView(view);
                          onClose();
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Load View →
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteView(view.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete view"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Selected: <strong className="text-slate-900">{filter.selectedMemberIds.length}</strong> of {totalCount} people
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleSelectAll();
                onFilterChange({
                  ...filter,
                  startPersonId: '',
                  selectedMemberIds: memberList.map(m=>m.id),
                  endPersonId: undefined,
                  generationLimit: 'all',
                  activeMarriageBranches: {},
                  includeBridgeAncestors: false,
                });
              }}
              className="px-3 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
            >
              Apply & View Tree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
