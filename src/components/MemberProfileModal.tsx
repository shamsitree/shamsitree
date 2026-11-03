/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person, Gender, RelationshipType } from '../types/family';
import { SmartDateInput } from './SmartDateInput';
import { PersonAvatar } from './PersonAvatar';
import { findHalfSiblings } from '../utils/treeLayout';
import {
  X,
  Edit2,
  Save,
  User,
  Heart,
  Users,
  Calendar,
  Briefcase,
  MapPin,
  Tag,
  BookOpen,
  Plus,
} from 'lucide-react';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  allMembers: Record<string, Person>;
  onUpdatePerson: (updatedPerson: Person) => void;
  onAddChild?: (parentPerson: Person) => void;
  onAddSpouse?: (person: Person) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  isOpen,
  onClose,
  person,
  allMembers,
  onUpdatePerson,
  onAddChild,
  onAddSpouse,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Person | null>(person);

  React.useEffect(() => {
    setFormData(person);
    setIsEditing(false);
  }, [person]);

  if (!isOpen || !person || !formData) return null;

  const halfSiblings = findHalfSiblings(person, allMembers);

  const father = person.fatherId ? allMembers[person.fatherId] : null;
  const mother = person.motherId ? allMembers[person.motherId] : null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onUpdatePerson(formData);
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <PersonAvatar person={person} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {person.firstName} {person.lastName}
                </h2>
                <span className="text-[11px] font-mono font-semibold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                  Generation {person.generation}
                </span>
              </div>
              {person.arabicName && (
                <p className="text-sm text-slate-600 font-serif" dir="rtl">
                  {person.arabicName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isEditing ? (
            /* Universal Dynamic Family Form - Edit Mode */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Arabic Name (Calligraphy)
                  </label>
                  <input
                    type="text"
                    value={formData.arabicName || ''}
                    onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                    placeholder="e.g. عبد المنان الشمسي"
                    dir="rtl"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 font-serif"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Smart Mobile Date Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <SmartDateInput
                  label="Birth Date"
                  value={formData.birthDate || ''}
                  onChange={(val) => setFormData({ ...formData, birthDate: val })}
                />

                <SmartDateInput
                  label="Death Date (if deceased)"
                  value={formData.deathDate || ''}
                  onChange={(val) => setFormData({ ...formData, deathDate: val, isLiving: !val })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Birth Place
                  </label>
                  <input
                    type="text"
                    value={formData.birthPlace || ''}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="City, Country"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="Profession"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Biography & Historical Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Record ancestral memories, deeds, and oral traditions..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Vital Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    <strong>Birth:</strong> {person.birthDate || 'Unknown'} {person.birthPlace && `(${person.birthPlace})`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    <strong>Status:</strong> {person.isLiving ? 'Living' : `Deceased ${person.deathDate || ''}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    <strong>Occupation:</strong> {person.occupation || 'Not specified'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Tag className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    <strong>Relationship:</strong> {person.relationshipType || 'Biological'}
                  </span>
                </div>
              </div>

              {/* Biography */}
              {person.bio && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Biography
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                    {person.bio}
                  </p>
                </div>
              )}

              {/* Parents Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Parents & Lineage
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center gap-2.5">
                    {father ? (
                      <>
                        <PersonAvatar person={father} size="sm" />
                        <div>
                          <span className="text-[10px] text-slate-600 uppercase font-bold block">Father</span>
                          <span className="text-xs font-semibold text-slate-900">
                            {father.firstName} {father.lastName}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-slate-600 italic">Father not recorded</span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center gap-2.5">
                    {mother ? (
                      <>
                        <PersonAvatar person={mother} size="sm" />
                        <div>
                          <span className="text-[10px] text-slate-600 uppercase font-bold block">Mother</span>
                          <span className="text-xs font-semibold text-slate-900">
                            {mother.firstName} {mother.lastName}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-slate-600 italic">Mother not recorded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Spouses & Marriages Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Spouses & Marriages ({person.spouses.length})
                  </h4>
                </div>

                {person.spouses.length === 0 ? (
                  <p className="text-xs text-slate-600 italic">No recorded marriages</p>
                ) : (
                  <div className="space-y-2">
                    {person.spouses.map((sp) => {
                      const spouseObj = allMembers[sp.spouseId];
                      return (
                        <div
                          key={`profile-sp-${sp.spouseId}`}
                          className="p-3 bg-rose-50/40 rounded-lg border border-rose-100 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            {spouseObj && <PersonAvatar person={spouseObj} size="sm" />}
                            <div>
                              <span className="text-xs font-bold text-slate-900">
                                {spouseObj ? `${spouseObj.firstName} ${spouseObj.lastName}` : sp.spouseId}
                              </span>
                              {sp.marriageDate && (
                                <span className="text-[11px] text-slate-500 font-mono ml-2">
                                  Married: {sp.marriageDate}
                                </span>
                              )}
                              {sp.notes && <p className="text-[11px] text-rose-700 mt-0.5">{sp.notes}</p>}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                            Union #{sp.order}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Half-Siblings Section (Objective 3 Verification) */}
              {halfSiblings.length > 0 && (
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    Identified Half-Siblings ({halfSiblings.length})
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {halfSiblings.map((halfId) => {
                      const sib = allMembers[halfId];
                      if (!sib) return null;
                      return (
                        <div
                          key={`half-sib-${halfId}`}
                          className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 flex items-center gap-2 text-xs text-amber-950 font-medium"
                        >
                          <PersonAvatar person={sib} size="sm" />
                          <span>
                            {sib.firstName} {sib.lastName}
                          </span>
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded">
                            Shared {person.fatherId === sib.fatherId ? 'Father' : 'Mother'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
