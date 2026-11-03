/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../../types/family';
import { computeHierarchicalLayout } from '../../utils/treeLayout';
import { PersonAvatar } from '../PersonAvatar';
import { Crown, Sparkles, Scroll } from 'lucide-react';

interface RoyalHeritageTreeProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export const RoyalHeritageTree: React.FC<RoyalHeritageTreeProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
}) => {
  const layout = computeHierarchicalLayout(members, bridgeIds, {
    nodeWidth: 240,
    nodeHeight: 130,
    horizontalGap: 60,
    verticalGap: 140,
  });

  const { minX, minY, width, height } = layout.bounds;
  const padding = 140;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <div className="relative w-full h-full min-h-[800px] bg-[#fbf6ec] select-none">
      {/* Subtle parchment grain overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <svg className="w-full h-full" viewBox={viewBox}>
        <defs>
          {/* Antique Gold Gradient */}
          <linearGradient id="royalGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bf953f" />
            <stop offset="25%" stopColor="#fcf6ba" />
            <stop offset="50%" stopColor="#b38728" />
            <stop offset="75%" stopColor="#fbf5b7" />
            <stop offset="100%" stopColor="#aa771c" />
          </linearGradient>

          <linearGradient id="crimsonVelvet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>

          <filter id="royalGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#92400e" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Outer Ornamental Charter Border */}
        <rect
          x={minX - padding + 20}
          y={minY - padding + 20}
          width={width + padding * 2 - 40}
          height={height + padding * 2 - 40}
          fill="none"
          stroke="url(#royalGold)"
          strokeWidth="3"
          strokeDasharray="12 4"
        />

        {/* Heraldic Connectors */}
        {layout.connections.map((conn) => {
          const midY = (conn.fromY + conn.toY) / 2;
          const pathD =
            conn.type === 'spouse'
              ? `M ${conn.fromX} ${conn.fromY} L ${conn.toX} ${conn.toY}`
              : `M ${conn.fromX} ${conn.fromY} C ${conn.fromX} ${midY}, ${conn.toX} ${midY}, ${conn.toX} ${conn.toY}`;

          return (
            <g key={conn.id}>
              {/* Gold Ribbon Underlay */}
              <path
                d={pathD}
                fill="none"
                stroke="#d4af37"
                strokeWidth={conn.type === 'spouse' ? '4' : '3'}
                strokeOpacity="0.4"
              />
              {/* Main Line */}
              <path
                d={pathD}
                fill="none"
                stroke={conn.type === 'spouse' ? '#9f1239' : '#854d0e'}
                strokeWidth={conn.type === 'spouse' ? '2.5' : '1.8'}
                strokeDasharray={conn.type === 'bridge' ? '4 4' : undefined}
              />
              {/* Ornate Gold Medallion on junctions */}
              <circle
                cx={(conn.fromX + conn.toX) / 2}
                cy={midY}
                r="5"
                fill="url(#royalGold)"
                stroke="#713f12"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Royal Heritage Member Nodes */}
        {layout.nodes.map((node) => {
          const isFocused = selectedPersonId === node.person.id;
          const isFounder = node.person.generation === 1;

          return (
            <foreignObject
              key={node.person.id}
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              className="overflow-visible"
            >
              <div
                onClick={() => onSelectPerson(node.person)}
                className={`relative flex flex-col justify-between h-full p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                  isFocused
                    ? 'bg-[#fffdf7] border-2 border-amber-600 shadow-2xl scale-105 z-30 ring-4 ring-amber-200'
                    : node.isBridge
                    ? 'bg-[#faf6ee]/70 border-dashed border-amber-300 opacity-65'
                    : 'bg-[#fffdf9] border-amber-300 shadow-md hover:border-amber-500 hover:shadow-xl'
                }`}
                style={{ filter: 'url(#royalGlow)' }}
              >
                {/* Filigree Corner Accents */}
                <span className="absolute top-1 left-1 text-[10px] text-amber-600 font-serif leading-none select-none">
                  ✦
                </span>
                <span className="absolute top-1 right-1 text-[10px] text-amber-600 font-serif leading-none select-none">
                  ✦
                </span>
                <span className="absolute bottom-1 left-1 text-[10px] text-amber-600 font-serif leading-none select-none">
                  ✦
                </span>
                <span className="absolute bottom-1 right-1 text-[10px] text-amber-600 font-serif leading-none select-none">
                  ✦
                </span>

                {/* Top: Avatar & Heraldic Crown */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <PersonAvatar
                      person={node.person}
                      size="md"
                      className="ring-2 ring-amber-500/80 shadow-md"
                    />
                    {isFounder && (
                      <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 text-amber-600 drop-shadow fill-amber-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-bold text-xs text-amber-950 tracking-wide truncate">
                      {node.person.firstName} {node.person.lastName}
                    </h3>

                    {node.person.arabicName && (
                      <span className="block text-[11px] text-amber-800/80 font-serif truncate" dir="rtl">
                        {node.person.arabicName}
                      </span>
                    )}

                    <p className="text-[10px] text-amber-900/70 italic font-serif truncate mt-0.5">
                      {node.person.occupation || 'Royal Descendant'}
                    </p>
                  </div>
                </div>

                {/* Bottom: Parchment dates & Marriage seals */}
                <div className="flex items-center justify-between border-t border-amber-200/60 pt-1.5 text-[11px] text-amber-900 font-serif">
                  <span className="tracking-wide">
                    {node.person.birthDate ? `Anno ${node.person.birthDate.slice(-4)}` : '—'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {node.person.spouses.length > 1 && (
                      <span
                        title="Multiple Marriages Recorded"
                        className="flex items-center gap-0.5 text-rose-800 bg-rose-100/70 px-1 py-0.5 rounded text-[10px] border border-rose-300"
                      >
                        <Crown className="w-2.5 h-2.5" />
                        2 Unions
                      </span>
                    )}
                    {isFounder && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                        Patriarch
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
