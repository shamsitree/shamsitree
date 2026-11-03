/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../../types/family';
import { computeHierarchicalLayout } from '../../utils/treeLayout';
import { PersonAvatar } from '../PersonAvatar';
import { Image, Heart, Bookmark } from 'lucide-react';

interface PhotoAlbumTreeProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

export const PhotoAlbumTree: React.FC<PhotoAlbumTreeProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
}) => {
  const layout = computeHierarchicalLayout(members, bridgeIds, {
    nodeWidth: 210,
    nodeHeight: 180, // Taller portrait card for large photos
    horizontalGap: 50,
    verticalGap: 100,
  });

  const { minX, minY, width, height } = layout.bounds;
  const padding = 130;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <div className="relative w-full h-full min-h-[850px] bg-[#f4ebe1] select-none">
      {/* Textured Linen Canvas Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#d6c7b2_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <svg className="w-full h-full" viewBox={viewBox} width={width + padding * 2} height={height + padding * 2} style={{width:width + padding * 2,height:height + padding * 2,maxWidth:'none'}}>
        <defs>
          <filter id="albumDropShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="2" dy="6" stdDeviation="5" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Vintage Album Ribbon Connectors */}
        {layout.connections.map((conn) => {
          const midY = (conn.fromY + conn.toY) / 2;
          const pathD =
            conn.type === 'spouse'
              ? `M ${conn.fromX} ${conn.fromY} L ${conn.toX} ${conn.toY}`
              : `M ${conn.fromX} ${conn.fromY} C ${conn.fromX} ${midY}, ${conn.toX} ${midY}, ${conn.toX} ${conn.toY}`;

          return (
            <g key={conn.id}>
              {/* Silk ribbon shadow */}
              <path d={pathD} fill="none" stroke="#78350f" strokeWidth="5" strokeOpacity="0.15" />
              {/* Ribbon line */}
              <path
                d={pathD}
                fill="none"
                stroke={conn.type === 'spouse' ? '#e11d48' : '#b45309'}
                strokeWidth={conn.type === 'spouse' ? '3' : '2'}
                strokeDasharray={conn.type === 'bridge' ? '6 4' : undefined}
              />
            </g>
          );
        })}

        {/* Photo Mount Frames */}
        {layout.nodes.map((node) => {
          const isFocused = selectedPersonId === node.person.id;
          const isBridge = node.isBridge;
          // slight artistic rotation for scrapbook polaroid feel
          const rotation = ((parseInt(node.person.id.replace(/\D/g, '') || '0', 10) % 5) - 2) * 1.2;

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
                className={`relative flex flex-col items-center justify-between p-3 rounded-sm transition-all duration-300 cursor-pointer ${
                  isFocused
                    ? 'bg-white shadow-2xl ring-4 ring-amber-500 scale-105 z-30'
                    : isBridge
                    ? 'bg-white/60 opacity-60'
                    : 'bg-[#fffefb] hover:bg-white hover:scale-105 shadow-md'
                }`}
                style={{
                  filter: 'url(#albumDropShadow)',
                  transform: `rotate(${isFocused ? 0 : rotation}deg)`,
                }}
              >
                {/* Washi Tape Corner Accents */}
                <div className="absolute -top-2 left-3 w-8 h-3.5 bg-amber-200/80 -rotate-12 border border-amber-300/60 shadow-xs pointer-events-none" />
                <div className="absolute -top-2 right-3 w-8 h-3.5 bg-rose-200/80 rotate-12 border border-rose-300/60 shadow-xs pointer-events-none" />

                {/* Portrait Photo Frame */}
                <div className="relative w-20 h-20 mt-1 rounded-sm overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
                  <PersonAvatar person={node.person} size="lg" className="rounded-none w-full h-full" />
                </div>

                {/* Handwritten Style Caption */}
                <div className="w-full text-center mt-2 px-1">
                  <h4 className="font-serif font-bold text-xs text-stone-800 tracking-tight truncate">
                    {node.person.firstName} {node.person.lastName}
                  </h4>

                  {node.person.arabicName && (
                    <span className="block text-[10px] text-stone-600 font-serif truncate" dir="rtl">
                      {node.person.arabicName}
                    </span>
                  )}

                  <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px] text-stone-500 font-mono border-t border-dashed border-stone-200 pt-1">
                    <span>{node.person.birthDate ? node.person.birthDate.slice(-4) : '—'}</span>
                    {node.person.spouses.length > 1 && (
                      <span className="text-rose-700 font-semibold flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5 fill-rose-500" /> 2
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
