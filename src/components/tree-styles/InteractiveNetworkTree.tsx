/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Person } from '../../types/family';
import { PersonAvatar } from '../PersonAvatar';

interface InteractiveNetworkProps {
  members: Record<string, Person>;
  bridgeIds: Set<string>;
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string;
}

interface SimNode {
  id: string;
  person: Person;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const InteractiveNetworkTree: React.FC<InteractiveNetworkProps> = ({
  members,
  bridgeIds,
  onSelectPerson,
  selectedPersonId,
}) => {
  const memberList = Object.values(members);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Initialize nodes around circle with generation radius
  useEffect(() => {
    const w = 900;
    const h = 700;
    const initialNodes: SimNode[] = memberList.map((p, i) => {
      const angle = (i / memberList.length) * 2 * Math.PI;
      const r = 80 + (p.generation || 1) * 70;
      return {
        id: p.id,
        person: p,
        x: w / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 40,
        y: h / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
      };
    });
    setNodes(initialNodes);
  }, [members]);

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    setDraggingId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingId ? { ...n, x, y, vx: 0, vy: 0 } : n))
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggingId(null);
  };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-full min-h-[750px] bg-slate-900 overflow-hidden select-none"
    >
      <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
        Drag nodes to reorganize your family graph
      </div>

      <svg className="w-full h-full min-h-[750px]">
        {/* Connection links */}
        {memberList.map((person) => {
          const src = nodeMap.get(person.id);
          if (!src) return null;

          return person.parentIds.map((pId) => {
            const tgt = nodeMap.get(pId);
            if (!tgt) return null;

            return (
              <line
                key={`net-link-${person.id}-${pId}`}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
            );
          });
        })}

        {/* Spouse links */}
        {memberList.map((person) => {
          const src = nodeMap.get(person.id);
          if (!src) return null;

          return person.spouses.map((sp) => {
            if (sp.spouseId < person.id) return null;
            const tgt = nodeMap.get(sp.spouseId);
            if (!tgt) return null;

            return (
              <line
                key={`net-spouse-${person.id}-${sp.spouseId}`}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeDasharray="3 3"
              />
            );
          });
        })}

        {/* Draggable Nodes */}
        {nodes.map((n) => {
          const isSelected = selectedPersonId === n.id;

          return (
            <foreignObject
              key={`net-obj-${n.id}`}
              x={n.x - 45}
              y={n.y - 45}
              width={90}
              height={90}
              className="overflow-visible"
            >
              <div
                onPointerDown={(e) => handlePointerDown(n.id, e)}
                onClick={() => onSelectPerson(n.person)}
                className={`flex flex-col items-center justify-center w-[90px] h-[90px] rounded-full cursor-grab active:cursor-grabbing transition-transform ${
                  isSelected
                    ? 'ring-4 ring-cyan-400 scale-110 shadow-[0_0_20px_rgba(56,189,248,0.6)] z-30'
                    : 'hover:scale-105'
                }`}
              >
                <PersonAvatar person={n.person} size="md" className="shadow-lg" />
                <span className="text-[10px] font-bold text-white bg-slate-800/90 px-1.5 py-0.5 rounded-full mt-1 truncate max-w-[80px]">
                  {n.person.firstName}
                </span>
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
};
