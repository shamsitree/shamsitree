/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../../types/family';
import { PersonAvatar } from '../PersonAvatar';

interface TimelineTreeProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export const TimelineFamilyTree: React.FC<TimelineTreeProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
}) => {
  const memberList = Object.values(members);

  // Time parameters
  const minYear = 1910;
  const maxYear = 2030;
  const totalYears = maxYear - minYear;
  const timelineWidth = 1400;
  const yearToX = (y: number) => ((y - minYear) / totalYears) * (timelineWidth - 100) + 50;

  // Sort members by birth year
  const parseYear = (p: Person) => {
    if (p.birthDate) {
      const match = p.birthDate.match(/\d{4}/);
      if (match) return parseInt(match[0], 10);
    }
    return 1940 + (p.generation || 1) * 20;
  };

  const sorted = [...memberList].sort((a, b) => parseYear(a) - parseYear(b));

  const decades = [1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030];
  const rowHeight = 52;
  const totalHeight = Math.max(sorted.length * rowHeight + 120, 600);

  return (
    <div className="relative w-full h-full min-h-[750px] bg-slate-900 text-slate-100 overflow-x-auto select-none p-4">
      <svg className="min-w-[1400px] w-full" height={totalHeight}>
        <defs>
          <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        {/* Decade Vertical Gridlines & Ruler */}
        {decades.map((yr) => {
          const x = yearToX(yr);
          return (
            <g key={`decade-${yr}`}>
              <line x1={x} y1={40} x2={x} y2={totalHeight} stroke="#334155" strokeWidth="1" strokeDasharray="2 4" />
              <text x={x} y={30} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600" className="font-mono">
                {yr}
              </text>
            </g>
          );
        })}

        {/* Member Lifespan Bars & Links */}
        {sorted.map((person, idx) => {
          const birthYr = parseYear(person);
          const deathYr = person.deathDate
            ? parseInt(person.deathDate.match(/\d{4}/)?.[0] || '2000', 10)
            : 2026;
          const startX = yearToX(birthYr);
          const endX = yearToX(Math.min(deathYr, 2030));
          const barW = Math.max(endX - startX, 40);
          const y = 60 + idx * rowHeight;
          const isSelected = selectedPersonId === person.id;

          return (
            <g
              key={`timeline-row-${person.id}`}
              onClick={() => onSelectPerson(person)}
              className="cursor-pointer group"
            >
              {/* Row hover highlight */}
              <rect
                x="20"
                y={y - 6}
                width={timelineWidth}
                height={rowHeight - 6}
                rx="6"
                fill={isSelected ? '#1e293b' : 'transparent'}
                className="group-hover:fill-slate-800/60 transition-colors"
              />

              {/* Lifespan Bar */}
              <rect
                x={startX}
                y={y}
                width={barW}
                height="24"
                rx="12"
                fill={isSelected ? '#38bdf8' : 'url(#barGrad)'}
                fillOpacity={person.isLiving ? '0.9' : '0.6'}
                className="transition-all duration-200 group-hover:brightness-125"
              />

              {/* Label inside / next to bar */}
              <text
                x={startX + 12}
                y={y + 16}
                fill="#0f172a"
                fontSize="11"
                fontWeight="bold"
                className="pointer-events-none select-none font-sans"
              >
                {person.firstName} {person.lastName.split(' ')[0]}
              </text>

              {/* Birth - Death dates text */}
              <text
                x={startX + barW + 10}
                y={y + 16}
                fill="#cbd5e1"
                fontSize="10"
                className="font-mono pointer-events-none select-none"
              >
                {birthYr} — {person.isLiving ? 'Present' : deathYr} (Gen {person.generation})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
