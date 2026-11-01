import {validateGraph, type Graph} from './familyGraph';
export const STORAGE_KEY = 'shamsitree.form-b.v1';
export type SavedTree = Graph & {format: 'shamsitree-form-b'; version: 1; revision: string; treeId: string};
export const emptyTree = (): SavedTree => ({format:'shamsitree-form-b',version:1,revision:'',treeId:crypto.randomUUID(),members:[],unions:[],children:[]});
export function decodeTree(raw: string): SavedTree {
  const s = JSON.parse(raw);
  if (s.format !== 'shamsitree-form-b' || s.version !== 1 || typeof s.treeId !== 'string' || typeof s.revision !== 'string' || !Array.isArray(s.members) || !Array.isArray(s.unions) || !Array.isArray(s.children)) throw new Error('Not a supported Form B backup.');
  validateGraph(s, s.treeId, 3);
  return s;
}
export function persistTree(storage: Pick<Storage,'getItem'|'setItem'>, next: SavedTree, previousRevision: string): SavedTree {
  const raw = storage.getItem(STORAGE_KEY);
  if ((raw ? decodeTree(raw).revision : '') !== previousRevision) throw new Error('This tree changed in another window. Reopen Form B before saving.');
  validateGraph(next, next.treeId, 3);
  const saved = {...next, revision:crypto.randomUUID()};
  storage.setItem(STORAGE_KEY, JSON.stringify(saved)); // Publish UI only after storage succeeds.
  return saved;
}
