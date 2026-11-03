/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../../types/family';
import { computeHierarchicalLayout } from '../../utils/treeLayout';
import { PersonAvatar } from '../PersonAvatar';
import { Sparkles, Moon } from 'lucide-react';

interface StarryNightProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export const StarryNightTree: React.FC<StarryNightProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
}) => {
  const layout = computeHierarchicalLayout(members, bridgeIds, {
    nodeWidth: 200,
    nodeHeight: 100,
    horizontalGap: 60,
    verticalGap: 130,
  });

  const { minX, minY, width, height } = layout.bounds;
  const padding = 130;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  // Procedural twinkling background stars
  const bgStars = Array.from({ length: 70 }, (_, i) => ({
    x: minX - padding + ((i * 137) % (width + padding * 2)),
    y: minY - padding + ((i * 229) % (height + padding * 2)),
    r: (i % 3) * 0.8 + 0.6,
    opacity: 0.3 + (i % 5) * 0.15,
  }));

  return (
    <div className="relative w-full h-full min-h-[800px] bg-[#020617] text-slate-100 select-none overflow-hidden">
      {/* Cosmic Nebula Cloud Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-950/20 to-slate-950 pointer-events-none" />

      <svg className="w-full h-full" viewBox={viewBox}>
        <defs>
          <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Moon & Constellation Stars */}
        <g className="opacity-40 pointer-events-none">
          <circle cx={minX + 60} cy={minY + 40} r="28" fill="#f8fafc" />
          <circle cx={minX + 72} cy={minY + 36} r="25" fill="#020617" />
        </g>

        {bgStars.map((s, i) => (
          <circle key={`bg-star-${i}`} cx={s.x} cy={s.y} r={s.r} fill="#e2e8f0" opacity={s.opacity} />
        ))}

        {/* Constellation Lines */}
        {layout.connections.map((conn) => {
          const midY = (conn.fromY + conn.toY) / 2;
          const pathD =
            conn.type === 'spouse'
              ? `M ${conn.fromX} ${conn.fromY} L ${conn.toX} ${conn.toY}`
              : `M ${conn.fromX} ${conn.fromY} C ${conn.fromX} ${midY}, ${conn.toX} ${midY}, ${conn.toX} ${conn.toY}`;

          return (
            <g key={conn.id}>
              {/* Outer stardust glow */}
              <path
                d={pathD}
                fill="none"
                stroke={conn.type === 'spouse' ? '#f43f5e' : '#38bdf8'}
                strokeWidth="4"
                strokeOpacity="0.25"
                filter="url(#starGlow)"
              />
              {/* Inner crisp constellation line */}
              <path
                d={pathD}
                fill="none"
                stroke={conn.type === 'spouse' ? '#fb7185' : '#7dd3fc'}
                strokeWidth="1.5"
                strokeDasharray={conn.type === 'bridge' ? '4 6' : undefined}
                strokeOpacity="0.8"
              />
              {/* Star Node Intersection */}
              <circle cx={(conn.fromX + conn.toX) / 2} cy={midY} r="2.5" fill="#ffffff" />
            </g>
          );
        })}

        {/* Constellation Star Member Nodes */}
        {layout.nodes.map((node) => {
          const isFocused = selectedPersonId === node.person.id;
          const isBridge = node.isBridge;

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
                className={`relative flex items-center gap-3 p-3 rounded-full border transition-all duration-300 cursor-pointer backdrop-blur-md ${
                  isFocused
                    ? 'bg-indigo-900/90 border-2 border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.5)] scale-110 z-30 ring-4 ring-cyan-500/30'
                    : isBridge
                    ? 'bg-slate-900/60 border border-dashed border-slate-700 opacity-50'
                    : 'bg-slate-900/80 border border-slate-700 hover:border-cyan-400/80 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:scale-105'
                }`}
              >
                {/* Glowing Star Orb Avatar */}
                <div className="relative">
                  <PersonAvatar person={node.person} size="md" className="ring-2 ring-cyan-300" />
                  <span className="absolute -top-1 -right-1 text-cyan-300 text-xs animate-pulse">✦</span>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs text-white truncate">
                    {node.person.firstName} {node.person.lastName.split(' ')[0]}
                  </h4>

                  {node.person.arabicName && (
                    <span className="block text-[10px] text-cyan-300 font-serif truncate" dir="rtl">
                      {node.person.arabicName}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>{node.person.birthDate ? node.person.birthDate.slice(-4) : '—'}</span>
                    {node.person.spouses.length > 1 && (
                      <span className="text-pink-400 font-bold">2 Stars</span>
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
