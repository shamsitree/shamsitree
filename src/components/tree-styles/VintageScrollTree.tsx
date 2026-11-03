/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../../types/family';
import { computeHierarchicalLayout } from '../../utils/treeLayout';
import { PersonAvatar } from '../PersonAvatar';

interface VintageScrollProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export const VintageScrollTree: React.FC<VintageScrollProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
}) => {
  const layout = computeHierarchicalLayout(members, bridgeIds, {
    nodeWidth: 220,
    nodeHeight: 110,
    horizontalGap: 55,
    verticalGap: 125,
  });

  const { minX, minY, width, height } = layout.bounds;
  const padding = 140;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <div className="relative w-full h-full min-h-[800px] bg-[#e8d8be] select-none p-4">
      {/* Scroll Roll Edges & Texture */}
      <svg className="w-full h-full" viewBox={viewBox}>
        <defs>
          <filter id="inkBleed" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Parchment Scroll Sheet */}
        <rect
          x={minX - padding + 20}
          y={minY - padding + 20}
          width={width + padding * 2 - 40}
          height={height + padding * 2 - 40}
          rx="12"
          fill="#f4e8d3"
          stroke="#b89768"
          strokeWidth="3"
        />

        {/* Sepia Ink Connectors */}
        {layout.connections.map((conn) => {
          const midY = (conn.fromY + conn.toY) / 2;
          const pathD =
            conn.type === 'spouse'
              ? `M ${conn.fromX} ${conn.fromY} L ${conn.toX} ${conn.toY}`
              : `M ${conn.fromX} ${conn.fromY} C ${conn.fromX} ${midY}, ${conn.toX} ${midY}, ${conn.toX} ${conn.toY}`;

          return (
            <path
              key={conn.id}
              d={pathD}
              fill="none"
              stroke="#5c3818"
              strokeWidth="2.2"
              strokeDasharray={conn.type === 'bridge' ? '4 4' : undefined}
              filter="url(#inkBleed)"
            />
          );
        })}

        {/* Scroll Calligraphic Nodes */}
        {layout.nodes.map((node) => {
          const isFocused = selectedPersonId === node.person.id;

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
                className={`relative flex flex-col justify-between h-full p-2.5 rounded border border-[#a88252] transition-all cursor-pointer ${
                  isFocused
                    ? 'bg-[#fffbf0] border-2 border-red-800 shadow-xl scale-105 z-30'
                    : 'bg-[#faf0dc] hover:bg-[#fff9ed] shadow-xs'
                }`}
              >
                {/* Wax Seal Accent */}
                <div className="absolute -top-2.5 -right-2 w-5 h-5 rounded-full bg-red-800 border border-red-950 flex items-center justify-center text-[8px] text-amber-200 font-bold shadow-xs">
                  S
                </div>

                <div className="flex items-start gap-2">
                  <PersonAvatar person={node.person} size="sm" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif font-bold text-xs text-[#3b220c] truncate">
                      {node.person.firstName} {node.person.lastName}
                    </h4>
                    {node.person.arabicName && (
                      <span className="block text-[10px] text-[#6b421a] font-serif truncate" dir="rtl">
                        {node.person.arabicName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#6e4620] font-serif border-t border-[#d8be97] pt-1">
                  <span>{node.person.birthDate ? `b. ${node.person.birthDate.slice(-4)}` : '—'}</span>
                  <span>Gen {node.person.generation}</span>
                </div>
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
};
