/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Person, TreeViewFilter } from '../types/family';
import { getAncestorIds, getDescendantIds, getLineagePath } from '../data/sampleFamily';

export interface LayoutNode {
  person: Person;
  x: number;
  y: number;
  width: number;
  height: number;
  isBridge: boolean; // whether this is an unselected connector ancestor
  isSelected: boolean;
  spouseNodes?: LayoutNode[];
  children?: LayoutNode[];
  marriageBranches?: Array<{
    spouse: Person;
    branchId: string;
    order: number;
    children: LayoutNode[];
    isActive: boolean;
  }>;
  halfSiblings?: string[];
}

export interface TreeLayoutResult {
  nodes: LayoutNode[];
  connections: Array<{
    id: string;
    fromId: string;
    toId: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    type: 'parent-child' | 'spouse' | 'marriage-junction' | 'bridge';
    label?: string;
  }>;
  bounds: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number };
  visibleCount: number;
  totalCount: number;
  bridgeCount: number;
  hasDisconnectedGroups: boolean;
  activeMarriageCount: number;
}

/**
 * Filter members based on user selection, generation range, and marriage branch filter
 */
export function getFilteredMembers(
  allMembers: Record<string, Person>,
  filter: TreeViewFilter
): {
  filtered: Record<string, Person>;
  bridgeIds: Set<string>;
  isDisconnected: boolean;
} {
  const allList = Object.values(allMembers);
  const selectedSet = new Set<string>(filter.selectedMemberIds);
  const bridgeIds = new Set<string>();

  // 1. Lineage Path Restriction (Start -> End Person)
  if (filter.startPersonId && filter.endPersonId && filter.startPersonId !== filter.endPersonId) {
    const path = getLineagePath(filter.startPersonId, filter.endPersonId, allMembers);
    const pathSet = new Set(path);
    const result: Record<string, Person> = {};

    path.forEach((id) => {
      if (allMembers[id]) {
        result[id] = allMembers[id];
      }
    });

    // Also include spouses of people along path if permitted
    if (filter.includeSpouses) {
      path.forEach((id) => {
        const p = allMembers[id];
        if (p) {
          p.spouses.forEach((sp) => {
            if (allMembers[sp.spouseId]) {
              result[sp.spouseId] = allMembers[sp.spouseId];
            }
          });
        }
      });
    }

    return { filtered: result, bridgeIds, isDisconnected: false };
  }

  // 2. Start Person Subtree
  let candidateIds = new Set<string>();
  if (filter.startPersonId && allMembers[filter.startPersonId]) {
    const rootPerson = allMembers[filter.startPersonId];
    candidateIds.add(filter.startPersonId);

    // Get descendants within generation limit
    const maxGenDepth = filter.generationLimit === 'all' ? 99 : Number(filter.generationLimit);
    const desc = getDescendantIds(filter.startPersonId, allMembers, maxGenDepth);
    desc.forEach((id) => candidateIds.add(id));

    // Also add root person's ancestors if generation range allows
    if (filter.generationLimit === 'all' || filter.generationLimit >= 4) {
      const ancs = getAncestorIds(filter.startPersonId, allMembers);
      ancs.forEach((id) => candidateIds.add(id));
    }
  } else {
    // All members candidate pool
    allList.forEach((m) => candidateIds.add(m.id));
  }

  // 3. Intersect with user's selectedMemberIds
  const activeIds = new Set<string>();
  candidateIds.forEach((id) => {
    if (selectedSet.has(id)) {
      activeIds.add(id);
    }
  });

  // 4. Generation range bounds
  if (filter.minGeneration !== undefined || filter.maxGeneration !== undefined) {
    const minG = filter.minGeneration ?? 1;
    const maxG = filter.maxGeneration ?? 99;
    activeIds.forEach((id) => {
      const m = allMembers[id];
      if (m && (m.generation < minG || m.generation > maxG)) {
        activeIds.delete(id);
      }
    });
  }

  // 5. Marriage Branch Filtering (e.g. Anwar Kamal's marriages)
  // If activeMarriageBranches[personId] is provided, check if child belongs to excluded marriage
  activeIds.forEach((id) => {
    const person = allMembers[id];
    if (!person) return;

    // Check if father has marriage filters
    if (person.fatherId && filter.activeMarriageBranches[person.fatherId]) {
      const allowedSpouses = filter.activeMarriageBranches[person.fatherId];
      if (person.motherId && !allowedSpouses.includes(person.motherId)) {
        activeIds.delete(id);
        return;
      }
    }

    // Check if mother has marriage filters
    if (person.motherId && filter.activeMarriageBranches[person.motherId]) {
      const allowedSpouses = filter.activeMarriageBranches[person.motherId];
      if (person.fatherId && !allowedSpouses.includes(person.fatherId)) {
        activeIds.delete(id);
        return;
      }
    }

    // Check if person itself is an excluded spouse
    for (const [pId, allowedList] of Object.entries(filter.activeMarriageBranches)) {
      const basePerson = allMembers[pId];
      if (basePerson && basePerson.spouses.some((s) => s.spouseId === id)) {
        const list = (allowedList || []) as string[];
        if (!list.includes(id)) {
          activeIds.delete(id);
        }
      }
    }
  });

  // 6. Bridge Ancestors (connect disjoint selected members)
  if (filter.includeBridgeAncestors) {
    const activeArr = Array.from(activeIds);
    for (let i = 0; i < activeArr.length; i++) {
      for (let j = i + 1; j < activeArr.length; j++) {
        const path = getLineagePath(activeArr[i], activeArr[j], allMembers);
        if (path.length > 0 && path.length <= 4) {
          path.forEach((pathId) => {
            if (!activeIds.has(pathId)) {
              bridgeIds.add(pathId);
            }
          });
        }
      }
    }
  }

  // Combine active and bridges
  const finalFiltered: Record<string, Person> = {};
  activeIds.forEach((id) => {
    if (allMembers[id]) finalFiltered[id] = allMembers[id];
  });
  bridgeIds.forEach((id) => {
    if (allMembers[id]) finalFiltered[id] = allMembers[id];
  });

  // Check if disconnected
  let isDisconnected = false;
  if (activeIds.size > 1) {
    const ids = Array.from(activeIds);
    const root = ids[0];
    const reachable = new Set<string>([root]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const id of ids) {
        if (reachable.has(id)) {
          const m = allMembers[id];
          if (m) {
            for (const pid of m.parentIds) {
              if (activeIds.has(pid) && !reachable.has(pid)) {
                reachable.add(pid);
                grew = true;
              }
            }
            for (const sp of m.spouses) {
              if (activeIds.has(sp.spouseId) && !reachable.has(sp.spouseId)) {
                reachable.add(sp.spouseId);
                grew = true;
              }
            }
          }
        }
      }
    }
    if (reachable.size < activeIds.size) {
      isDisconnected = true;
    }
  }

  return { filtered: finalFiltered, bridgeIds, isDisconnected };
}

/**
 * Identify half-siblings for a given person
 */
export function findHalfSiblings(person: Person, allMembers: Record<string, Person>): string[] {
  const halfSibs = new Set<string>();
  const fatherId = person.fatherId;
  const motherId = person.motherId;

  if (!fatherId && !motherId) return [];

  for (const other of Object.values(allMembers)) {
    if (other.id === person.id) continue;
    const sameFather = fatherId && other.fatherId === fatherId;
    const sameMother = motherId && other.motherId === motherId;

    // Half sibling: shares exactly one parent, not both
    if ((sameFather && !sameMother && other.motherId) || (sameMother && !sameFather && other.fatherId)) {
      halfSibs.add(other.id);
    }
  }

  return Array.from(halfSibs);
}

/**
 * Standard Hierarchical Layout (Used by Classic, Royal, Photo Album, Minimalist, Islamic)
 */
export function computeHierarchicalLayout(
  members: Record<string, Person>,
  bridgeIds: Set<string>,
  options: {
    nodeWidth?: number;
    nodeHeight?: number;
    horizontalGap?: number;
    verticalGap?: number;
  } = {}
): TreeLayoutResult {
  const nodeWidth = options.nodeWidth ?? 200;
  const nodeHeight = options.nodeHeight ?? 110;
  const horizontalGap = options.horizontalGap ?? 50;
  const verticalGap = options.verticalGap ?? 120;

  // Group members by generation
  const genGroups: Record<number, Person[]> = {};
  Object.values(members).forEach((p) => {
    const gen = p.generation || 1;
    if (!genGroups[gen]) genGroups[gen] = [];
    genGroups[gen].push(p);
  });

  const sortedGens = Object.keys(genGroups)
    .map(Number)
    .sort((a, b) => a - b);

  const nodes: LayoutNode[] = [];
  const connections: TreeLayoutResult['connections'] = [];
  const nodeMap = new Map<string, LayoutNode>();

  let globalMinX = Infinity;
  let globalMaxX = -Infinity;
  let globalMinY = Infinity;
  let globalMaxY = -Infinity;

  sortedGens.forEach((gen, genIndex) => {
    const personList = genGroups[gen];
    const count = personList.length;
    const totalRowWidth = count * nodeWidth + (count - 1) * horizontalGap;
    const startX = -totalRowWidth / 2;
    const y = genIndex * (nodeHeight + verticalGap);

    personList.forEach((person, colIndex) => {
      const x = startX + colIndex * (nodeWidth + horizontalGap);
      const isBridge = bridgeIds.has(person.id);
      const halfSibs = findHalfSiblings(person, members);

      const node: LayoutNode = {
        person,
        x,
        y,
        width: nodeWidth,
        height: nodeHeight,
        isBridge,
        isSelected: !isBridge,
        halfSiblings: halfSibs,
      };

      nodes.push(node);
      nodeMap.set(person.id, node);

      globalMinX = Math.min(globalMinX, x);
      globalMaxX = Math.max(globalMaxX, x + nodeWidth);
      globalMinY = Math.min(globalMinY, y);
      globalMaxY = Math.max(globalMaxY, y + nodeHeight);
    });
  });

  // Calculate connections
  nodes.forEach((childNode) => {
    const child = childNode.person;

    // Connect to parents
    child.parentIds.forEach((parentId) => {
      const parentNode = nodeMap.get(parentId);
      if (parentNode) {
        connections.push({
          id: `${parentId}->${child.id}`,
          fromId: parentId,
          toId: child.id,
          fromX: parentNode.x + parentNode.width / 2,
          fromY: parentNode.y + parentNode.height,
          toX: childNode.x + childNode.width / 2,
          toY: childNode.y,
          type: childNode.isBridge || parentNode.isBridge ? 'bridge' : 'parent-child',
          label: child.relationshipType === 'adopted' ? 'Adopted' : child.relationshipType === 'foster' ? 'Foster' : undefined,
        });
      }
    });

    // Connect to spouses (prevent duplicate lines by checking order or id)
    child.spouses.forEach((sp) => {
      if (sp.spouseId < child.id) return; // single link per couple
      const spouseNode = nodeMap.get(sp.spouseId);
      if (spouseNode) {
        connections.push({
          id: `spouse:${child.id}<->${sp.spouseId}`,
          fromId: child.id,
          toId: sp.spouseId,
          fromX: childNode.x + childNode.width,
          fromY: childNode.y + childNode.height / 2,
          toX: spouseNode.x,
          toY: spouseNode.y + spouseNode.height / 2,
          type: 'spouse',
          label: sp.order > 1 ? `Marriage #${sp.order}` : undefined,
        });
      }
    });
  });

  const width = Math.max(globalMaxX - globalMinX, 600);
  const height = Math.max(globalMaxY - globalMinY, 400);

  return {
    nodes,
    connections,
    bounds: {
      minX: globalMinX === Infinity ? 0 : globalMinX,
      maxX: globalMaxX === -Infinity ? 600 : globalMaxX,
      minY: globalMinY === Infinity ? 0 : globalMinY,
      maxY: globalMaxY === -Infinity ? 400 : globalMaxY,
      width,
      height,
    },
    visibleCount: nodes.filter((n) => !n.isBridge).length,
    totalCount: Object.keys(members).length,
    bridgeCount: bridgeIds.size,
    hasDisconnectedGroups: false,
    activeMarriageCount: nodes.reduce((sum, n) => sum + n.person.spouses.length, 0) / 2,
  };
}
