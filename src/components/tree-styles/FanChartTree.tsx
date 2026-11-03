/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person } from '../../types/family';

interface FanChartProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export const FanChartTree: React.FC<FanChartProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const memberList = Object.values(members);
  const maxGeneration=Math.max(1,...memberList.map(p=>p.generation||1));
  const width = Math.max(1200,(70+maxGeneration*110)*2+80);
  const height = Math.max(750,70+maxGeneration*110+80);
  const originX = width / 2;
  const originY = height - 40;

  // Group by generation
  const genGroups: Record<number, Person[]> = {};
  memberList.forEach((m) => {
    const g = m.generation || 1;
    if (!genGroups[g]) genGroups[g] = [];
    genGroups[g].push(m);
  });

  const gens = Array.from({length:maxGeneration},(_,i)=>i+1);
  const innerR = 70;
  const bandWidth = 110;
  // Span from 195 degrees to 345 degrees (150-degree fan) or 180 to 360 (180 semicircle)
  const startAngle = Math.PI; // 180 deg
  const endAngle = 2 * Math.PI; // 360 deg
  const totalAngle = endAngle - startAngle;

  // Color generator for generation arcs
  const getSectorColor = (gen: number, idx: number, count: number, isSelected: boolean) => {
    if (isSelected) return '#3b82f6';
    const hues = [
      '#0284c7', // Gen 1 deep sky
      '#0d9488', // Gen 2 teal
      '#16a34a', // Gen 3 green
      '#ca8a04', // Gen 4 amber
      '#ea580c', // Gen 5 orange
    ];
    return hues[(gen - 1) % hues.length];
  };

  return (
    <div className="relative w-full h-full min-h-[800px] bg-white flex flex-col items-center justify-center p-4 select-none">
      <svg className="w-full h-full max-w-[1200px]" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id="fanShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Outer Fan Backdrop Arc */}
        <path
          d={`M ${originX - 580} ${originY} A 580 580 0 0 1 ${originX + 580} ${originY} L ${originX} ${originY} Z`}
          fill="#f8fafc"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />

        {/* Generate Slices */}
        {gens.map((gen) => {
          const list = genGroups[gen] || [];
          const count = list.length;
          if (count === 0) return null;

          const rIn = innerR + (gen - 1) * bandWidth;
          const rOut = rIn + bandWidth;
          const angleStep = totalAngle / count;

          return list.map((person, idx) => {
            const a1 = startAngle + idx * angleStep;
            const a2 = a1 + angleStep;
            const midA = (a1 + a2) / 2;

            // Arc coordinates
            const x1In = originX + rIn * Math.cos(a1);
            const y1In = originY + rIn * Math.sin(a1);
            const x2In = originX + rIn * Math.cos(a2);
            const y2In = originY + rIn * Math.sin(a2);

            const x1Out = originX + rOut * Math.cos(a1);
            const y1Out = originY + rOut * Math.sin(a1);
            const x2Out = originX + rOut * Math.cos(a2);
            const y2Out = originY + rOut * Math.sin(a2);

            // Mid text coord
            const textR = (rIn + rOut) / 2;
            const textX = originX + textR * Math.cos(midA);
            const textY = originY + textR * Math.sin(midA);

            const isHovered = hoveredId === person.id;
            const isSelected = selectedPersonId === person.id;
            const rotDeg = (midA * 180) / Math.PI + 90;

            const pathD = `
              M ${x1In} ${y1In}
              L ${x1Out} ${y1Out}
              A ${rOut} ${rOut} 0 0 1 ${x2Out} ${y2Out}
              L ${x2In} ${y2In}
              A ${rIn} ${rIn} 0 0 0 ${x1In} ${y1In}
              Z
            `;

            return (
              <g
                key={`fan-slice-${person.id}`}
                onClick={() => onSelectPerson(person)}
                onMouseEnter={() => setHoveredId(person.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer transition-all duration-200"
              >
                <path
                  d={pathD}
                  fill={getSectorColor(gen, idx, count, isSelected || isHovered)}
                  fillOpacity={isSelected ? 1 : isHovered ? 0.9 : 0.75}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-colors duration-200"
                />

                {/* Text along arc orientation */}
                <g transform={`translate(${textX}, ${textY}) rotate(${rotDeg > 90 && rotDeg < 270 ? rotDeg + 180 : rotDeg})`}>
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize={count > 16 ? '9' : '11'}
                    fontWeight="700"
                    className="pointer-events-none drop-shadow-xs select-none"
                  >
                    {person.firstName} {person.lastName.split(' ')[0]}
                  </text>
                  <text
                    y="12"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#e2e8f0"
                    fontSize="8"
                    className="font-mono pointer-events-none select-none opacity-90"
                  >
                    {person.birthDate ? person.birthDate.slice(-4) : ''}
                  </text>
                </g>
              </g>
            );
          });
        })}

        {/* Central Hub (Anchor) */}
        <circle cx={originX} cy={originY} r={innerR} fill="#0f172a" stroke="#fff" strokeWidth="3" />
        <text
          x={originX}
          y={originY - 14}
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="11"
          fontWeight="bold"
          className="uppercase tracking-widest font-mono"
        >
          Progenitor
        </text>
      </svg>
    </div>
  );
};
