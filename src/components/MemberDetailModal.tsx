import React from 'react';
import { FamilyMember, FamilyUnion, FamilyChild } from '../types/family';
import { photoFor } from '../utils/photoStorage';
import { X, Edit, Trash2, MapPin, Calendar, Phone, Heart, Users } from 'lucide-react';

interface MemberDetailModalProps {
  member: FamilyMember | null;
  onClose: () => void;
  onEdit: (member: FamilyMember) => void;
  onDelete: (memberId: string) => void;
  allMembers: FamilyMember[];
  unions: FamilyUnion[];
  children: FamilyChild[];
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  onClose,
  onEdit,
  onDelete,
  allMembers,
  unions,
  children
}) => {
  if (!member) return null;

  // Resolve direct connections
  const childLinks = children.filter(c => c.child_id === member.id);
  const parents: FamilyMember[] = [];
  for (const cl of childLinks) {
    const u = unions.find(x => x.id === cl.family_union_id);
    if (!u) continue;
    if (u.partner1_id) {
      const p1 = allMembers.find(m => m.id === u.partner1_id);
      if (p1 && !parents.some(p => p.id === p1.id)) parents.push(p1);
    }
    if (u.partner2_id) {
      const p2 = allMembers.find(m => m.id === u.partner2_id);
      if (p2 && !parents.some(p => p.id === p2.id)) parents.push(p2);
    }
  }

  const spouses: FamilyMember[] = [];
  const memberUnions = unions.filter(u => u.relationship_type === 'spouse' && (u.partner1_id === member.id || u.partner2_id === member.id));
  for (const u of memberUnions) {
    const spId = u.partner1_id === member.id ? u.partner2_id : u.partner1_id;
    if (spId) {
      const sp = allMembers.find(m => m.id === spId);
      if (sp && !spouses.some(s => s.id === sp.id)) spouses.push(sp);
    }
  }

  const memberAllUnionIds = new Set(
    unions.filter(u => u.partner1_id === member.id || u.partner2_id === member.id).map(u => u.id)
  );
  const myKids = children.filter(c => memberAllUnionIds.has(c.family_union_id)).map(c => allMembers.find(m => m.id === c.child_id)).filter(Boolean) as FamilyMember[];

  const isFemale = member.gender === 'female';
  const headerBg = isFemale ? 'bg-pink-50 text-pink-900 border-pink-200' : 'bg-blue-50 text-blue-900 border-blue-200';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Top Header Card */}
        <div className={`p-6 border-b flex justify-between items-start ${headerBg}`}>
          <div className="flex items-center gap-4">
            <img
              src={photoFor(member)}
              alt=""
              className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-md bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-gray-900">{member.full_name}</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                  {member.biradari || "Shamsi"}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1 capitalize font-medium">
                {member.gender} {member.date_of_death ? '• Deceased (مرحوم)' : '• Living (حیات)'}
              </div>
              <div className="text-[10px] font-mono text-gray-400 mt-1">
                ID: {member.id.slice(0, 8)}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg bg-white/60 hover:bg-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Quick info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                Date of Birth
              </span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {member.date_of_birth || 'Not recorded'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                Date of Death
              </span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {member.date_of_death || 'Living'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                Birthplace
              </span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {member.birthplace || 'Not recorded'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                Residence / Location
              </span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {member.current_residence || member.location || 'Not recorded'}
              </span>
            </div>
          </div>

          {member.phone && (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-gray-800">{member.phone}</span>
            </div>
          )}

          {/* Relatives Summary */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              Family Connections
            </h4>

            {/* Parents */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600">Parents:</span>
              <span className="text-xs font-bold text-gray-900">
                {parents.length ? parents.map(p => p.full_name).join(', ') : 'Not assigned'}
              </span>
            </div>

            {/* Spouses */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-500" />
                <span>Spouse(s):</span>
              </span>
              <span className="text-xs font-bold text-gray-900">
                {spouses.length ? spouses.map(s => s.full_name).join(', ') : 'None recorded'}
              </span>
            </div>

            {/* Children */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-600" />
                <span>Children:</span>
              </span>
              <span className="text-xs font-bold text-gray-900">
                {myKids.length ? myKids.map(k => k.full_name).join(', ') : 'None recorded'}
              </span>
            </div>
          </div>

          {/* Notes */}
          {member.notes && (
            <div className="pt-2">
              <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                Notes & Memories
              </h4>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-950 whitespace-pre-wrap leading-relaxed">
                {member.notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${member.full_name}?`)) {
                onDelete(member.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Member</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition cursor-pointer shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
