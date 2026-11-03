/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../../types/family';
import { PersonAvatar } from '../PersonAvatar';

interface NaturalLivingTreeProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export const NaturalLivingTree: React.FC<NaturalLivingTreeProps> = ({
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

  // Layout parameters for organic tree
  // Gen 1 near bottom (trunk crown), higher gens fan outward and upward
  const width = 1600;
  const height = 1200;
  const trunkBaseX = width / 2;
  const trunkBaseY = height - 60;
  const crownY = height - 260;

  // Calculate coordinates for each member positioned along organic branch forks
  const nodeCoords = new Map<string, { x: number; y: number; gen: number; angle: number }>();

  gens.forEach((gen) => {
    const list = genGroups[gen];
    const n = list.length;
    // Y position goes up as generation increases
    // Gen 1 at y = 920, Gen 2 at 720, Gen 3 at 500, Gen 4 at 300, Gen 5 at 140
    const yGen = trunkBaseY - 200 - (gen - 1) * 200;
    const spreadX = Math.min(width - 240, 200 + (gen * 240));
    const startX = trunkBaseX - spreadX / 2;
    const stepX = n > 1 ? spreadX / (n - 1) : 0;

    list.forEach((person, idx) => {
      const x = n === 1 ? trunkBaseX : startX + idx * stepX;
      // natural gentle vertical jitter for organic arboreal feel
      const jitterY = ((idx * 17) % 35) - 15;
      nodeCoords.set(person.id, {
        x,
        y: yGen + jitterY,
        gen,
        angle: (idx / Math.max(n - 1, 1) - 0.5) * 45,
      });
    });
  });

  return (
    <div className="relative w-full h-full min-h-[850px] bg-gradient-to-b from-sky-50/70 via-emerald-50/40 to-amber-50/60 overflow-hidden select-none">
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          {/* Bark Gradient */}
          <linearGradient id="barkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="35%" stopColor="#78350f" />
            <stop offset="70%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Leaf Gradients */}
          <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>

          <filter id="woodShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.18" />
          </filter>

          {/* Reusable Leaf Sprig */}
          <g id="leafCluster">
            <path d="M 0,0 C -15,-20 0,-40 10,-35 C 20,-30 15,-10 0,0" fill="url(#leafGrad1)" opacity="0.85" />
            <path d="M 0,0 C 15,-20 30,-25 35,-15 C 40,-5 20,5 0,0" fill="url(#leafGrad2)" opacity="0.9" />
            <circle cx="5" cy="-18" r="3" fill="#f43f5e" opacity="0.8" />
          </g>
        </defs>

        {/* ================= BACKGROUND FOLIAGE CANOPY ================= */}
        <g className="opacity-25 pointer-events-none">
          <circle cx={trunkBaseX - 350} cy="350" r="280" fill="#86efac" />
          <circle cx={trunkBaseX + 350} cy="380" r="300" fill="#4ade80" />
          <circle cx={trunkBaseX} cy="260" r="320" fill="#22c55e" />
          <circle cx={trunkBaseX - 180} cy="180" r="220" fill="#16a34a" />
          <circle cx={trunkBaseX + 200} cy="190" r="240" fill="#86efac" />
        </g>

        {/* ================= ORGANIC TRUNK & ROOTS ================= */}
        {/* Ground mound */}
        <path
          d={`M ${trunkBaseX - 500} ${trunkBaseY + 60} Q ${trunkBaseX} ${trunkBaseY - 40} ${trunkBaseX + 500} ${trunkBaseY + 60} L ${trunkBaseX + 500} ${height} L ${trunkBaseX - 500} ${height} Z`}
          fill="#365314"
          opacity="0.85"
        />

        {/* Roots */}
        <path
          d={`M ${trunkBaseX - 70} ${trunkBaseY + 10} C ${trunkBaseX - 180} ${trunkBaseY + 50}, ${trunkBaseX - 300} ${trunkBaseY + 70}, ${trunkBaseX - 420} ${trunkBaseY + 80}
              L ${trunkBaseX - 400} ${trunkBaseY + 95} C ${trunkBaseX - 250} ${trunkBaseY + 70}, ${trunkBaseX - 120} ${trunkBaseY + 50}, ${trunkBaseX - 30} ${trunkBaseY + 20} Z`}
          fill="url(#barkGradient)"
        />
        <path
          d={`M ${trunkBaseX + 70} ${trunkBaseY + 10} C ${trunkBaseX + 180} ${trunkBaseY + 50}, ${trunkBaseX + 300} ${trunkBaseY + 70}, ${trunkBaseX + 420} ${trunkBaseY + 80}
              L ${trunkBaseX + 400} ${trunkBaseY + 95} C ${trunkBaseX + 250} ${trunkBaseY + 70}, ${trunkBaseX + 120} ${trunkBaseY + 50}, ${trunkBaseX + 30} ${trunkBaseY + 20} Z`}
          fill="url(#barkGradient)"
        />

        {/* Massive Main Trunk */}
        <path
          d={`M ${trunkBaseX - 90} ${trunkBaseY + 20}
              C ${trunkBaseX - 75} ${trunkBaseY - 100}, ${trunkBaseX - 95} ${crownY + 80}, ${trunkBaseX - 120} ${crownY}
              C ${trunkBaseX - 60} ${crownY - 20}, ${trunkBaseX + 60} ${crownY - 20}, ${trunkBaseX + 120} ${crownY}
              C ${trunkBaseX + 95} ${crownY + 80}, ${trunkBaseX + 75} ${trunkBaseY - 100}, ${trunkBaseX + 90} ${trunkBaseY + 20} Z`}
          fill="url(#barkGradient)"
          filter="url(#woodShadow)"
        />

        {/* Bark Grooves / Organic Ridges */}
        <path
          d={`M ${trunkBaseX - 20} ${trunkBaseY} Q ${trunkBaseX - 40} ${trunkBaseY - 120} ${trunkBaseX - 30} ${crownY + 30}`}
          stroke="#291203"
          strokeWidth="4"
          fill="none"
          opacity="0.6"
        />
        <path
          d={`M ${trunkBaseX + 25} ${trunkBaseY} Q ${trunkBaseX + 15} ${trunkBaseY - 110} ${trunkBaseX + 40} ${crownY + 25}`}
          stroke="#291203"
          strokeWidth="4"
          fill="none"
          opacity="0.6"
        />

        {/* ================= ORGANIC BRANCHES TO MEMBERS ================= */}
        {memberList.map((person) => {
          const coord = nodeCoords.get(person.id);
          if (!coord) return null;

          // If person has parents, branch splits from parent
          let startPt = { x: trunkBaseX, y: crownY };
          if (person.parentIds.length > 0) {
            const parentCoord = nodeCoords.get(person.parentIds[0]);
            if (parentCoord) {
              startPt = { x: parentCoord.x, y: parentCoord.y };
            }
          }

          const dx = coord.x - startPt.x;
          const dy = coord.y - startPt.y;
          const ctrlX1 = startPt.x + dx * 0.1;
          const ctrlY1 = startPt.y + dy * 0.5 - 20;
          const ctrlX2 = startPt.x + dx * 0.8;
          const ctrlY2 = startPt.y + dy * 0.7;

          const branchPath = `M ${startPt.x} ${startPt.y} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${coord.x} ${coord.y}`;
          const strokeW = Math.max(3, 14 - coord.gen * 2.2);

          return (
            <g key={`branch-${person.id}`}>
              {/* Branch */}
              <path
                d={branchPath}
                fill="none"
                stroke="url(#barkGradient)"
                strokeWidth={strokeW}
                strokeLinecap="round"
                filter="url(#woodShadow)"
              />
              {/* Leaves sprouting at mid branch */}
              <use
                href="#leafCluster"
                x={ctrlX2}
                y={ctrlY2}
                transform={`rotate(${coord.angle}, ${ctrlX2}, ${ctrlY2}) scale(${0.7 + (coord.gen % 3) * 0.2})`}
              />
            </g>
          );
        })}

        {/* ================= MEMBERS AS LIVING BRANCH FRUITS / MEDALLIONS ================= */}
        {memberList.map((person) => {
          const coord = nodeCoords.get(person.id);
          if (!coord) return null;

          const isFocused = selectedPersonId === person.id;
          const isBridge = bridgeIds.has(person.id);
          const isFemale = person.gender === 'female';

          return (
            <foreignObject
              key={`leaf-node-${person.id}`}
              x={coord.x - 95}
              y={coord.y - 45}
              width={190}
              height={90}
              className="overflow-visible"
            >
              <div
                onClick={() => onSelectPerson(person)}
                className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-300 cursor-pointer ${
                  isFocused
                    ? 'bg-amber-100/95 border-2 border-emerald-600 shadow-xl scale-110 z-30 ring-4 ring-emerald-200'
                    : isBridge
                    ? 'bg-emerald-50/70 border border-dashed border-emerald-300 opacity-60'
                    : 'bg-white/95 border border-amber-800/30 shadow-md hover:shadow-lg hover:border-emerald-500 hover:scale-105'
                }`}
              >
                {/* Botanical leaf sprig on corner */}
                <div className="absolute -top-2.5 -right-2 text-emerald-600 pointer-events-none drop-shadow-sm">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                  </svg>
                </div>

                <PersonAvatar person={person} size="md" className="ring-2 ring-emerald-600/40" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-stone-900 truncate">
                      {person.firstName} {person.lastName.split(' ')[0]}
                    </span>
                  </div>

                  {person.arabicName && (
                    <span className="block text-[10px] text-emerald-900 font-serif truncate" dir="rtl">
                      {person.arabicName}
                    </span>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-stone-600 font-mono mt-0.5">
                    <span>{person.birthDate ? person.birthDate.slice(-4) : '—'}</span>
                    {person.spouses.length > 1 && (
                      <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded text-[9px]">
                        2 wives
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
};
