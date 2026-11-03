/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../../types/family';
import { computeHierarchicalLayout } from '../../utils/treeLayout';

interface ModernMinimalistProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export const ModernMinimalistTree: React.FC<ModernMinimalistProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
}) => {
  const layout = computeHierarchicalLayout(members, bridgeIds, {
    nodeWidth: 220,
    nodeHeight: 90,
    horizontalGap: 60,
    verticalGap: 100,
  });

  const { minX, minY, width, height } = layout.bounds;
  const padding = 100;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <div className="relative w-full h-full min-h-[750px] bg-slate-50 select-none">
      {/* Precision Grid Blueprint */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />

      <svg className="w-full h-full" viewBox={viewBox} width={width + padding * 2} height={height + padding * 2} style={{width:width + padding * 2,height:height + padding * 2,maxWidth:'none'}}>
        {/* Orthogonal Metro-style Connector Lines */}
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
                stroke={conn.type === 'spouse' ? '#f43f5e' : '#0f172a'}
                strokeWidth={conn.type === 'spouse' ? '2' : '1.5'}
                strokeDasharray={conn.type === 'bridge' ? '4 4' : undefined}
              />
              {/* Circuit Junction Dot */}
              <circle cx={conn.fromX} cy={midY} r="3" fill="#0f172a" />
              <circle cx={conn.toX} cy={midY} r="3" fill="#0f172a" />
            </g>
          );
        })}

        {/* Minimalist Cards */}
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
                className={`relative flex flex-col justify-between h-full p-2.5 bg-white transition-all duration-200 cursor-pointer ${
                  isFocused
                    ? 'ring-2 ring-slate-900 border-slate-900 shadow-lg scale-105 z-20'
                    : isBridge
                    ? 'border border-dashed border-slate-300 opacity-50'
                    : 'border border-slate-300 hover:border-slate-800 shadow-xs'
                }`}
              >
                {/* Generation Index Accent */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  <span>GEN {node.person.generation || 1}</span>
                  <span>{node.person.birthDate ? node.person.birthDate.slice(-4) : '—'}</span>
                </div>

                {/* Name */}
                <div className="my-0.5">
                  <h4 className="font-semibold text-xs text-slate-900 tracking-tight truncate">
                    {node.person.firstName} {node.person.lastName}
                  </h4>
                  {node.person.arabicName && (
                    <span className="block text-[10px] text-slate-600 truncate font-serif" dir="rtl">
                      {node.person.arabicName}
                    </span>
                  )}
                </div>

                {/* Status / Marriages info */}
                <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-100 pt-1 font-mono">
                  <span className="truncate max-w-[120px]">{node.person.occupation || 'Member'}</span>
                  {node.person.spouses.length > 1 && (
                    <span className="text-rose-600 font-bold">2 Unions</span>
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
