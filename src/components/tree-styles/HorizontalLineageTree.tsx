/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../../types/family';
import { PersonAvatar } from '../PersonAvatar';

interface HorizontalLineageProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export const HorizontalLineageTree: React.FC<HorizontalLineageProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
}) => {
  const memberList = Object.values(members);

  // Group by generation
  const genGroups: Record<number, Person[]> = {};
  memberList.forEach((m) => {
    const g = m.generation || 1;
    if (!genGroups[g]) genGroups[g] = [];
    genGroups[g].push(m);
  });

  const gens = Object.keys(genGroups)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="relative w-full h-full min-h-[750px] bg-white p-6 overflow-x-auto select-none">
      <div className="flex items-start gap-12 min-w-max">
        {gens.map((gen) => {
          const list = genGroups[gen];
          return (
            <div key={`h-gen-${gen}`} className="flex flex-col gap-4 w-64 shrink-0">
              {/* Generation Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur z-10 py-2 border-b-2 border-indigo-600 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Generation {gen}
                </span>
                <span className="text-[11px] font-mono text-slate-600">
                  {list.length} {list.length === 1 ? 'member' : 'members'}
                </span>
              </div>

              {/* Members in column */}
              <div className="flex flex-col gap-3">
                {list.map((person) => {
                  const isSelected = selectedPersonId === person.id;
                  const isBridge = bridgeIds.has(person.id);

                  return (
                    <div
                      key={`h-node-${person.id}`}
                      onClick={() => onSelectPerson(person)}
                      className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-2 border-indigo-600 shadow-md ring-2 ring-indigo-200'
                          : isBridge
                          ? 'bg-slate-50 border-dashed border-slate-300 opacity-60'
                          : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <PersonAvatar person={person} size="sm" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-xs text-slate-900 truncate">
                            {person.firstName} {person.lastName}
                          </h4>
                          {person.arabicName && (
                            <span className="block text-[10px] text-slate-500 font-serif truncate" dir="rtl">
                              {person.arabicName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-2 border-t border-slate-100 pt-1.5">
                        <span>{person.birthDate ? person.birthDate.slice(-4) : '—'}</span>
                        {person.spouses.length > 1 && (
                          <span className="text-rose-600 font-bold text-[10px] bg-rose-50 px-1 rounded">
                            2 Wives
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
