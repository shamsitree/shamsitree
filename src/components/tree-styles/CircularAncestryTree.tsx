/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../../types/family';
import { PersonAvatar } from '../PersonAvatar';

interface CircularAncestryProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
  rootPersonId?: string;
}

export const CircularAncestryTree: React.FC<CircularAncestryProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
  rootPersonId = 'abdul-mannan',
}) => {
  const memberList = Object.values(members);
  const size = 1100;
  const centerX = size / 2;
  const centerY = size / 2;

  // Group by generation
  const genGroups: Record<number, Person[]> = {};
  memberList.forEach((m) => {
    const g = m.generation || 1;
    if (!genGroups[g]) genGroups[g] = [];
    genGroups[g].push(m);
  });

  const sortedGens = Object.keys(genGroups)
    .map(Number)
    .sort((a, b) => a - b);

  // Orbit Radii
  const radiusMap: Record<number, number> = {
    1: 0, // center
    2: 170,
    3: 310,
    4: 430,
    5: 520,
  };

  const coords = new Map<string, { x: number; y: number; r: number; angle: number }>();

  sortedGens.forEach((gen) => {
    const list = genGroups[gen];
    const r = radiusMap[gen] || 160 * (gen - 1);

    if (gen === 1 && list.length === 1) {
      coords.set(list[0].id, { x: centerX, y: centerY, r: 0, angle: 0 });
    } else {
      const count = list.length;
      list.forEach((p, idx) => {
        // distribute angles around 360 degrees
        const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        coords.set(p.id, { x, y, r, angle });
      });
    }
  });

  return (
    <div className="relative w-full h-full min-h-[850px] bg-slate-900 overflow-hidden select-none">
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="sunburstGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>

          <filter id="circularGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Radial Background */}
        <rect width={size} height={size} fill="url(#sunburstGrad)" />

        {/* Orbit Rings */}
        {[170, 310, 430, 520].map((r, i) => (
          <g key={`orbit-${r}`}>
            <circle
              cx={centerX}
              cy={centerY}
              r={r}
              fill="none"
              stroke="#334155"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              opacity="0.6"
            />
            <text
              x={centerX + 8}
              y={centerY - r + 16}
              fill="#64748b"
              fontSize="11"
              fontWeight="600"
              className="font-mono uppercase tracking-widest opacity-70"
            >
              Orbit {i + 2}
            </text>
          </g>
        ))}

        {/* Radial Relationship Connectors */}
        {memberList.map((person) => {
          const personCoord = coords.get(person.id);
          if (!personCoord) return null;

          return person.parentIds.map((pId) => {
            const parentCoord = coords.get(pId);
            if (!parentCoord) return null;

            return (
              <line
                key={`rad-line-${pId}-${person.id}`}
                x1={parentCoord.x}
                y1={parentCoord.y}
                x2={personCoord.x}
                y2={personCoord.y}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeOpacity="0.4"
                strokeDasharray={bridgeIds.has(person.id) ? '4 4' : undefined}
              />
            );
          });
        })}

        {/* Member Orbit Nodes */}
        {memberList.map((person) => {
          const coord = coords.get(person.id);
          if (!coord) return null;

          const isCenter = coord.r === 0;
          const isFocused = selectedPersonId === person.id;
          const nodeWidth = isCenter ? 140 : 110;
          const nodeHeight = isCenter ? 140 : 95;

          return (
            <foreignObject
              key={`circ-node-${person.id}`}
              x={coord.x - nodeWidth / 2}
              y={coord.y - nodeHeight / 2}
              width={nodeWidth}
              height={nodeHeight}
              className="overflow-visible"
            >
              <div
                onClick={() => onSelectPerson(person)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 cursor-pointer text-center ${
                  isCenter
                    ? 'bg-blue-600 text-white ring-4 ring-blue-300 shadow-2xl scale-110 z-30'
                    : isFocused
                    ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-200 shadow-xl scale-110 z-30 font-semibold'
                    : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700 hover:border-cyan-400 shadow-md'
                }`}
              >
                <PersonAvatar person={person} size={isCenter ? 'lg' : 'sm'} className="shadow-md mb-1" />

                <span className="text-[11px] font-bold truncate max-w-[95px] leading-tight">
                  {person.firstName}
                </span>

                <span className="text-[10px] text-slate-400 font-mono">
                  {person.birthDate ? person.birthDate.slice(-4) : '—'}
                </span>

                {person.spouses.length > 1 && (
                  <span className="text-[9px] text-rose-400 font-bold">2 Wives</span>
                )}
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
};
