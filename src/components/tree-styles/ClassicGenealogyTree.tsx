/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../../types/family';
import { computeHierarchicalLayout } from '../../utils/treeLayout';
import { PersonAvatar } from '../PersonAvatar';
import { Heart, Users } from 'lucide-react';

interface ClassicTreeProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export const ClassicGenealogyTree: React.FC<ClassicTreeProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
}) => {
  const layout = computeHierarchicalLayout(members, bridgeIds, {
    nodeWidth: 230,
    nodeHeight: 115,
    horizontalGap: 55,
    verticalGap: 130,
  });

  const { minX, minY, width, height } = layout.bounds;
  const padding = 120;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <div className="relative w-full h-full select-none">
      <svg className="w-full h-full min-h-[750px]" viewBox={viewBox} width={width + padding * 2} height={height + padding * 2} style={{width:width + padding * 2,height:height + padding * 2,maxWidth:'none'}}>
        <defs>
          <linearGradient id="classicConnector" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.8" />
          </linearGradient>
          <filter id="classicShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Orthogonal Generation Guide Lines */}
        {[1, 2, 3, 4, 5].map((gen) => {
          const y = (gen - 1) * (115 + 130) + 57;
          return (
            <g key={`gen-guide-${gen}`} className="opacity-30">
              <line
                x1={minX - padding}
                y1={y}
                x2={minX + width + padding}
                y2={y}
                stroke="#cbd5e1"
                strokeDasharray="4 6"
                strokeWidth="1"
              />
              <text
                x={minX - padding + 20}
                y={y - 8}
                fill="#64748b"
                fontSize="12"
                fontWeight="600"
                className="font-mono uppercase"
              >
                Generation {gen}
              </text>
            </g>
          );
        })}

        {/* Connector Lines */}
        {layout.connections.map((conn) => {
          const midY = (conn.fromY + conn.toY) / 2;
          const pathD =
            conn.type === 'spouse'
              ? `M ${conn.fromX} ${conn.fromY} L ${conn.toX} ${conn.toY}`
              : `M ${conn.fromX} ${conn.fromY} C ${conn.fromX} ${midY}, ${conn.toX} ${midY}, ${conn.toX} ${conn.toY}`;

          return (
            <g key={conn.id}>
              <path
                d={pathD}
                fill="none"
                stroke={
                  conn.type === 'bridge'
                    ? '#cbd5e1'
                    : conn.type === 'spouse'
                    ? '#ec4899'
                    : 'url(#classicConnector)'
                }
                strokeWidth={conn.type === 'spouse' ? '2.5' : conn.type === 'bridge' ? '1.5' : '2'}
                strokeDasharray={conn.type === 'bridge' ? '5 5' : undefined}
                className="transition-all duration-300"
              />
              {conn.type === 'spouse' && (
                <circle
                  cx={(conn.fromX + conn.toX) / 2}
                  cy={(conn.fromY + conn.toY) / 2}
                  r="7"
                  fill="#fff"
                  stroke="#ec4899"
                  strokeWidth="2"
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {layout.nodes.map((node) => {
          const isFocused = selectedPersonId === node.person.id;
          const isFemale = node.person.gender === 'female';
          const halfSibsCount = node.halfSiblings?.length || 0;

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
                className={`group relative flex flex-col justify-between h-full p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  node.isBridge
                    ? 'bg-slate-50/80 border-dashed border-slate-300 opacity-60 hover:opacity-100'
                    : isFocused
                    ? 'bg-blue-50/90 border-2 border-blue-600 shadow-lg scale-[1.03] z-20 ring-4 ring-blue-100'
                    : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                }`}
                style={{ filter: 'url(#classicShadow)' }}
              >
                {/* Header: Avatar, Name & Arabic */}
                <div className="flex items-start gap-2.5">
                  <PersonAvatar person={node.person} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {node.person.firstName} {node.person.lastName}
                      </span>
                    </div>

                    {node.person.arabicName && (
                      <span className="block text-[11px] text-slate-500 font-serif truncate" dir="rtl">
                        {node.person.arabicName}
                      </span>
                    )}

                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {node.person.occupation || (node.person.isLiving ? 'Living' : 'Deceased')}
                    </p>
                  </div>
                </div>

                {/* Footer: Dates & Indicators */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 mt-1 font-mono">
                  <span>{node.person.birthDate ? `b. ${node.person.birthDate}` : 'Date unknown'}</span>

                  <div className="flex items-center gap-1">
                    {node.person.spouses.length > 1 && (
                      <span
                        title={`${node.person.spouses.length} Marriages`}
                        className="flex items-center gap-0.5 text-rose-600 font-semibold bg-rose-50 px-1 rounded text-[10px]"
                      >
                        <Heart className="w-2.5 h-2.5 fill-rose-500" />
                        {node.person.spouses.length}
                      </span>
                    )}

                    {halfSibsCount > 0 && (
                      <span
                        title={`Has ${halfSibsCount} half-sibling(s)`}
                        className="flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1 rounded text-[10px]"
                      >
                        <Users className="w-2.5 h-2.5" />
                        Half-sib
                      </span>
                    )}

                    {node.isBridge && (
                      <span className="text-[10px] text-slate-400 font-sans italic">Bridge</span>
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
