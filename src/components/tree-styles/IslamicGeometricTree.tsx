/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../../types/family';
import { computeHierarchicalLayout } from '../../utils/treeLayout';
import { PersonAvatar } from '../PersonAvatar';

interface IslamicGeometricProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export const IslamicGeometricTree: React.FC<IslamicGeometricProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
}) => {
  const layout = computeHierarchicalLayout(members, bridgeIds, {
    nodeWidth: 230,
    nodeHeight: 125,
    horizontalGap: 60,
    verticalGap: 140,
  });

  const { minX, minY, width, height } = layout.bounds;
  const padding = 130;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <div className="relative w-full h-full min-h-[800px] bg-[#032b24] text-amber-50 select-none">
      {/* Islamic Tessellation Arabesque Star Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />

      <svg className="w-full h-full" viewBox={viewBox}>
        <defs>
          <linearGradient id="islamicGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          {/* 8-Pointed Star (Khatam) */}
          <g id="khatamStar">
            <rect x="-6" y="-6" width="12" height="12" fill="url(#islamicGold)" />
            <rect x="-6" y="-6" width="12" height="12" fill="url(#islamicGold)" transform="rotate(45)" />
          </g>
        </defs>

        {/* Geometric Connectors */}
        {layout.connections.map((conn) => {
          const midY = (conn.fromY + conn.toY) / 2;
          const pathD =
            conn.type === 'spouse'
              ? `M ${conn.fromX} ${conn.fromY} L ${conn.toX} ${conn.toY}`
              : `M ${conn.fromX} ${conn.fromY} L ${conn.fromX} ${midY} L ${conn.toX} ${midY} L ${conn.toX} ${conn.toY}`;

          return (
            <g key={conn.id}>
              <path
                d={pathD}
                fill="none"
                stroke="url(#islamicGold)"
                strokeWidth="2"
                strokeDasharray={conn.type === 'bridge' ? '5 5' : undefined}
                opacity="0.8"
              />
              {/* Star Medallion Junction */}
              <use href="#khatamStar" x={conn.fromX} y={midY} />
              <use href="#khatamStar" x={conn.toX} y={midY} />
            </g>
          );
        })}

        {/* Mihrab Arch Member Nodes */}
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
                className={`relative flex flex-col justify-between h-full p-3 rounded-t-2xl rounded-b-md border transition-all duration-300 cursor-pointer ${
                  isFocused
                    ? 'bg-[#064e3b] border-2 border-amber-300 shadow-2xl scale-105 z-30 ring-4 ring-amber-400/40'
                    : isBridge
                    ? 'bg-[#04332b]/80 border-dashed border-amber-600/40 opacity-60'
                    : 'bg-[#044035] border-amber-500/50 hover:border-amber-300 hover:scale-105 shadow-lg'
                }`}
              >
                {/* Mihrab Arch Peak Accent */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-300 text-xs">
                  ۞
                </div>

                {/* Top Row: Arabic Name Calligraphy & Avatar */}
                <div className="flex items-start gap-2.5">
                  <PersonAvatar
                    person={node.person}
                    size="md"
                    className="ring-2 ring-amber-400 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    {node.person.arabicName ? (
                      <span className="block text-sm font-serif font-bold text-amber-200 truncate leading-tight" dir="rtl">
                        {node.person.arabicName}
                      </span>
                    ) : (
                      <span className="block text-xs font-semibold text-amber-100 truncate">
                        {node.person.firstName}
                      </span>
                    )}

                    <h4 className="text-xs font-semibold text-stone-100 truncate mt-0.5">
                      {node.person.firstName} {node.person.lastName}
                    </h4>
                  </div>
                </div>

                {/* Bottom Row: Birth Year & Multiple Marriage Badge */}
                <div className="flex items-center justify-between border-t border-amber-500/30 pt-1 text-[11px] text-amber-300 font-mono">
                  <span>{node.person.birthDate ? node.person.birthDate.slice(-4) : '—'}</span>

                  {node.person.spouses.length > 1 && (
                    <span className="text-[10px] text-amber-200 bg-amber-900/60 px-1.5 py-0.2 rounded border border-amber-400/40">
                      2 Zawjat
                    </span>
                  )}
                </div>
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
};
