/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShamsiTree Unified 7.8 — Family Tree Viewer & 13-Style Design Studio
 */

import React, { useEffect, useId, useMemo, useState, useRef } from 'react';
import type {
  FamilyMember,
  FamilyUnion,
  FamilyChild,
  SupportedLanguage,
  Person,
  TreeStyleId,
  TreeViewFilter,
  CustomTreeView,
} from '../types/family';
import { photoFor } from '../utils/photoStorage';
import { indexFamily, familyScene, type FamilyIndex } from '../utils/familyViewModel';
import { toStudioMap } from '../utils/studioAdapter';
import { SAMPLE_MEMBERS, getCore50MemberIds } from '../data/sampleFamily';
import { getFilteredMembers } from '../utils/treeLayout';
import { TREE_STYLES } from './tree-styles/styleRegistry';
import { exportTreeToPNG, printTree, exportFamilyDataJSON } from '../utils/exportTree';

// 13 Distinct Visual Tree Styles
import { ClassicGenealogyTree } from './tree-styles/ClassicGenealogyTree';
import { NaturalLivingTree } from './tree-styles/NaturalLivingTree';
import { RoyalHeritageTree } from './tree-styles/RoyalHeritageTree';
import { PhotoAlbumTree } from './tree-styles/PhotoAlbumTree';
import { CircularAncestryTree } from './tree-styles/CircularAncestryTree';
import { FanChartTree } from './tree-styles/FanChartTree';
import { ModernMinimalistTree } from './tree-styles/ModernMinimalistTree';
import { TimelineFamilyTree } from './tree-styles/TimelineFamilyTree';
import { IslamicGeometricTree } from './tree-styles/IslamicGeometricTree';
import { StarryNightTree } from './tree-styles/StarryNightTree';
import { VintageScrollTree } from './tree-styles/VintageScrollTree';
import { HorizontalLineageTree } from './tree-styles/HorizontalLineageTree';
import { InteractiveNetworkTree } from './tree-styles/InteractiveNetworkTree';

// Modals
import { StyleGalleryModal } from './StyleGalleryModal';
import { CustomizeTreeModal } from './CustomizeTreeModal';
import { MemberProfileModal } from './MemberProfileModal';

import {
  Printer,
  Plus,
  TreePine,
  Images,
  GitBranch,
  Leaf,
  Heart,
  Sliders,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Sparkles,
  Users,
  ChevronDown,
  Layers,
} from 'lucide-react';

type Mode = 'classic' | 'heritage' | 'album';

interface Props {
  members: FamilyMember[];
  unions: FamilyUnion[];
  children: FamilyChild[];
  currentUserId?: string;
  treeId?: string;
  language: SupportedLanguage;
  onSelectMember: (member: FamilyMember) => void;
  onAddRelative: (
    member: FamilyMember,
    kind: 'father' | 'mother' | 'spouse' | 'child',
    union?: FamilyUnion
  ) => void;
  onOpenAddMember: () => void;
}

interface CardProps {
  member: FamilyMember;
  focus?: boolean;
  label?: string;
  onChoose: (member: FamilyMember) => void;
  mode: Mode;
}

function PersonCard({ member, focus, label, onChoose, mode }: CardProps) {
  return (
    <div
      className={`person-card ${member.gender} ${focus ? 'focus-card' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`${focus ? 'View details for' : 'Explore'} ${member.full_name}`}
      onClick={() => onChoose(member)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChoose(member);
        }
      }}
    >
      {label && <span className="person-relation">{label}</span>}
      <img src={photoFor(member)} alt="" loading="lazy" decoding="async" />
      <div className="person-copy">
        <div className="person-name">{member.full_name}</div>
        <small>{member.biradari || 'Shamsi'}</small>
        {mode === 'album' && (
          <span className="album-caption">
            {member.date_of_birth ? member.date_of_birth.slice(0, 4) : 'A chapter in our family'}
            {member.date_of_death ? ' — ' + member.date_of_death.slice(0, 4) : ''}
          </span>
        )}
      </div>
    </div>
  );
}

class ViewBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface SceneProps extends Pick<Props, 'onAddRelative'> {
  index: FamilyIndex;
  focusId: string;
  mode: Mode;
  depth: number;
  limit: number;
  simple: boolean;
  onChoose: (member: FamilyMember) => void;
  onMore: () => void;
  branchesId: string;
}

function FamilyScene({
  index,
  focusId,
  mode,
  depth,
  limit,
  simple,
  onChoose,
  onAddRelative,
  onMore,
  branchesId,
}: SceneProps) {
  const scene = useMemo(
    () => familyScene(index, focusId, depth, limit),
    [index, focusId, depth, limit]
  );
  if (!scene.focus) return null;
  const focus = scene.focus;
  const father = scene.parents.find((p) => p.gender === 'male'),
    mother = scene.parents.find((p) => p.gender === 'female');
  const addChild = () => {
    if (scene.branches.length === 1) onAddRelative(focus, 'child', scene.branches[0].union);
    else if (scene.branches.length > 1 && typeof document !== 'undefined')
      document.getElementById(branchesId)?.scrollIntoView({ behavior: 'auto', block: 'center' });
    else onAddRelative(focus, 'child');
  };
  return (
    <section
      className={`family-canvas view-${mode} ${simple ? 'simple-decoration' : ''}`}
      data-view={mode}
      aria-label={`${mode === 'album' ? 'Family Album' : mode === 'heritage' ? 'Heritage' : 'Classic'} family tree`}
    >
      <div className="scene-heading">
        <span>
          {mode === 'heritage'
            ? 'ROOTED IN LOVE'
            : mode === 'album'
            ? 'THE FAMILY COLLECTION'
            : 'FAMILY LINEAGE'}
        </span>
        <h3>
          {mode === 'heritage'
            ? 'Every branch, a story'
            : mode === 'album'
            ? 'A lifetime of belonging'
            : 'Our connected generations'}
        </h3>
        <p>
          {mode === 'heritage'
            ? 'From deep roots to new beginnings.'
            : mode === 'album'
            ? 'People, portraits and the chapters we share.'
            : 'Choose a relative to explore. Choose the focus card to open details.'}
        </p>
      </div>
      <div className="tree-content">
        {scene.elders.length > 0 && (
          <div className="elder-section">
            <h4>Earlier generations</h4>
            <div className="elder-row">
              {scene.elders.map(({ member, via }) => (
                <PersonCard
                  key={member.id}
                  member={member}
                  label={`Parent of ${via}`}
                  mode={mode}
                  onChoose={onChoose}
                />
              ))}
            </div>
          </div>
        )}
        <div className="parents-section">
          <h4>{mode === 'album' ? 'The previous chapter' : 'Parents'}</h4>
          <div className="parents-row">
            {scene.parents.map((p) => (
              <PersonCard
                key={p.id}
                member={p}
                label={p.gender === 'male' ? 'Father' : p.gender === 'female' ? 'Mother' : 'Parent'}
                onChoose={onChoose}
                mode={mode}
              />
            ))}
            {!father && (
              <button className="add-parent" onClick={() => onAddRelative(focus, 'father')}>
                + Add Father
              </button>
            )}
            {!mother && (
              <button className="add-parent" onClick={() => onAddRelative(focus, 'mother')}>
                + Add Mother
              </button>
            )}
          </div>
          <div className="root-connector" aria-hidden="true" />
        </div>
        <div className="focus-section">
          <PersonCard member={focus} focus label="★ Focus person" mode={mode} onChoose={onChoose} />
          <div className="root-actions">
            <button onClick={() => onAddRelative(focus, 'spouse')}>
              <Heart size={14} />
              <span>+ Add Spouse</span>
            </button>
            <button onClick={addChild}>
              <Plus size={14} />
              <span>{scene.branches.length > 1 ? 'Choose child branch' : '+ Add Child'}</span>
            </button>
          </div>
        </div>
        <div className="root-connector" aria-hidden="true" />
        <div className="branch-section" id={branchesId}>
          <h4>{mode === 'album' ? 'Household albums' : 'Marriage & child branches'}</h4>
          <p className="branch-help">
            Add a child inside the correct household to keep marriage branches separate.
          </p>
          <div className="marriage-grid">
            {scene.branches.map((branch) => (
              <article
                className="marriage-branch"
                key={branch.union.id}
                data-union-id={branch.union.id}
                aria-label={
                  branch.spouse
                    ? `Family with ${branch.spouse.full_name}`
                    : 'Other recorded child branch'
                }
              >
                <div className="branch-heading">
                  <span>
                    {branch.spouse
                      ? mode === 'album'
                        ? 'A shared chapter'
                        : branch.spouse.gender === 'female'
                        ? 'Wife'
                        : 'Spouse'
                      : 'Other recorded children'}
                  </span>
                  <span>
                    {branch.total} {branch.total === 1 ? 'child' : 'children'}
                  </span>
                </div>
                {branch.spouse && (
                  <PersonCard member={branch.spouse} mode={mode} onChoose={onChoose} />
                )}
                <div className="children-connector" aria-hidden="true" />
                <div className="branch-children">
                  {branch.kids.map(({ member, kind }) => (
                    <div className="descendant-group" key={member.id}>
                      <PersonCard
                        member={member}
                        label={`${kind !== 'biological' ? kind + ' ' : ''}${member.gender === 'male' ? 'Son' : member.gender === 'female' ? 'Daughter' : 'Child'}`}
                        mode={mode}
                        onChoose={onChoose}
                      />
                      {depth > 1 &&
                        (index.unionsByPerson.get(member.id) || []).some(
                          (u) => (index.linksByUnion.get(u.id) || []).length > 0
                        ) && (
                          <div className="next-generation">
                            <span>Next generation</span>
                            {(index.unionsByPerson.get(member.id) || [])
                              .flatMap((u) =>
                                index.offspring(u.id).slice(0, 4).map(({ member: k }) => (
                                  <button key={u.id + k.id} onClick={() => onChoose(k)}>
                                    {k.full_name}
                                  </button>
                                ))
                              )}
                            <small>Explore this child to continue their branches.</small>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
                {!branch.total && (
                  <p className="empty-branch">
                    A new chapter is waiting. No children recorded here.
                  </p>
                )}
                {branch.total > branch.kids.length && (
                  <button className="show-more" onClick={onMore}>
                    Show more children ({branch.total - branch.kids.length} remaining)
                  </button>
                )}
                <button
                  className="branch-add"
                  onClick={() => onAddRelative(focus, 'child', branch.union)}
                >
                  <Plus size={14} />
                  <span>{branch.spouse ? 'Add Child' : 'Add another child'}</span>
                </button>
              </article>
            ))}
          </div>
          {!scene.branches.length && (
            <p className="empty-branch">
              No children added yet. Add a spouse or child to extend this family.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export const FamilyTreeViewer: React.FC<Props> = ({
  members,
  unions,
  children,
  currentUserId, treeId,
  language,
  onSelectMember,
  onAddRelative,
  onOpenAddMember,
}) => {
  // Legacy Household Scene state
  const [mode, setMode] = useState<Mode>('classic');
  const [focusId, setFocusId] = useState(
    () =>
      members.find(
        (m) =>
          currentUserId &&
          m.created_by === currentUserId &&
          /\[Family Role:\s*Self\]/i.test(m.notes || '')
      )?.id ||
      members[0]?.id ||
      ''
  );
  const [depth, setDepth] = useState(2);
  const [limit, setLimit] = useState(20);
  const [lowPower, setLowPower] = useState(false);
  const [minimal, setMinimal] = useState(false);
  const branchesId = useId();

  // Design Studio 13-Styles State
  const [viewEngine, setViewEngine] = useState<'studio' | 'scene'>('studio');
  const [useSample100, setUseSample100] = useState<boolean>(false); // Real authorized data is the default.
  const [selectedStyle, setSelectedStyle] = useState<TreeStyleId>('classic');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedStudioPerson, setSelectedStudioPerson] = useState<Person | null>(null);

  // Zoom & Pan for Studio Canvas
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Convert real live members to studio people
  const liveStudioMap = useMemo(() => {
    return toStudioMap(members, unions, children);
  }, [members, unions, children]);

  // Active dataset for studio: either 100-member benchmark or live Supabase members
  const studioSourceMap = useMemo(() => {
    if (useSample100) return SAMPLE_MEMBERS;
    return liveStudioMap;
  }, [useSample100, liveStudioMap]);

  // Tree Selection Filter State
  const blankFilter = (): TreeViewFilter => ({startPersonId:'',selectedMemberIds:Object.keys(studioSourceMap),generationLimit:'all',activeMarriageBranches:{},includeSpouses:false,includeBridgeAncestors:false});
  const [filter,setFilter]=useState<TreeViewFilter>(blankFilter);
  const scopeKey='shamsitree.views.v1:'+encodeURIComponent(currentUserId||'anonymous')+':'+encodeURIComponent(treeId||members[0]?.tree_id||'empty')+':'+(useSample100?'demo':'real');
  const [savedViews,setSavedViews]=useState<CustomTreeView[]>([]);
  const [loadedScope,setLoadedScope]=useState('');
  const [storageError,setStorageError]=useState('');
  useEffect(()=>{setFilter(blankFilter());try{const v=JSON.parse(localStorage.getItem(scopeKey)||'[]');setSavedViews(Array.isArray(v)?v.filter(x=>x&&typeof x.name==='string'&&Array.isArray(x.selectedMemberIds)):[]);}catch{setSavedViews([]);setStorageError('Saved views could not be read.');}setLoadedScope(scopeKey);},[scopeKey]);
  useEffect(()=>{if(loadedScope!==scopeKey)return;try{localStorage.setItem(scopeKey,JSON.stringify(savedViews));}catch{setStorageError('Browser storage is unavailable or full. View was not persisted.');}},[savedViews,scopeKey,loadedScope]);
  // Filtered members for studio
  const { filtered: visibleStudioMembers, bridgeIds, isDisconnected } = useMemo(() => {
    return getFilteredMembers(studioSourceMap, filter);
  }, [studioSourceMap, filter]);

  const totalMembersCount = Object.keys(studioSourceMap).length;
  const visibleMembersCount = Object.keys(visibleStudioMembers).filter(
    (id) => !bridgeIds.has(id)
  ).length;

  const index = useMemo(() => indexFamily(members, unions, children), [members, unions, children]);
  const focus = index.people.get(focusId) || members[0];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () =>
      setLowPower(
        (typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4) || !!media?.matches
      );
    update();
    media?.addEventListener?.('change', update);
    return () => media?.removeEventListener?.('change', update);
  }, []);

  if (!focus && members.length === 0 && !useSample100) {
    return (
      <section className="empty-tree"><button onClick={()=>setUseSample100(true)}>Open labelled Demo Mode</button>
        <TreePine size={40} />
        <h3>Your Family Tree is Empty</h3>
        <p>Add your first family member to start your unified tree.</p>
        <button onClick={onOpenAddMember}>Add First Member</button>
      </section>
    );
  }

  const choose = (m: FamilyMember) => {
    if (focus && m.id === focus.id) onSelectMember(m);
    else {
      setFocusId(m.id);
      setLimit(20);
    }
  };

  const shared = {
    index,
    focusId: focus ? focus.id : members[0]?.id || '',
    depth,
    limit,
    simple: minimal || lowPower || members.length > 120,
    onChoose: choose,
    onAddRelative,
    onMore: () => setLimit((n) => n + 20),
    branchesId,
  };

  const fallback = (
    <>
      <p role="alert">This decorative view could not load. Classic is available below.</p>
      <FamilyScene {...shared} mode="classic" />
    </>
  );

  // Pan handlers for Studio Canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('foreignObject') ||
      (e.target as HTMLElement).closest('button')
    )
      return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Studio Person Click: Bridge to Universal Member Modal if live member exists
  const handleStudioPersonClick = (p: Person) => {
    const liveMember = members.find((m) => m.id === p.id);
    if (liveMember) {
      onSelectMember(liveMember);
    } else {
      setSelectedStudioPerson(p);
    }
  };

  const currentStyleInfo =
    TREE_STYLES.find((s) => s.id === selectedStyle) || TREE_STYLES[0];

  return (
    <div className="phase5-tree relative flex flex-col w-full h-full" lang={language}>
      {/* =========================================================================
          CONTROL TOOLBAR: 13 STYLES, CUSTOMIZE STUDIO & SCENE SWITCHER
          ========================================================================= */}
      <div className="tree-toolbar flex flex-wrap items-center justify-between gap-3 p-3 bg-white border-b border-gray-200 shadow-2xs">
        {/* Left: Focus Person & View Engine Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="focus-control flex items-center gap-2">
            <label htmlFor={`${branchesId}-focus`} className="text-xs font-semibold text-gray-700">
              Focus Person:
            </label>
            <select
              id={`${branchesId}-focus`}
              aria-label="Focus Person"
              value={focus ? focus.id : ''}
              onChange={(e) => {
                setFocusId(e.target.value);
                setLimit(20);
              }}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-800"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.gender})
                </option>
              ))}
            </select>
          </div>

          {/* Engine Switcher: 13-Style Design Studio vs Classic Scene */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewEngine('studio')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                viewEngine === 'studio'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Design Studio (13 Styles)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewEngine('scene')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                viewEngine === 'scene'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers size={14} />
              <span>Household Scene</span>
            </button>
          </div>
        </div>

        {/* Center: Style Gallery & Customize My Tree Triggers */}
        {viewEngine === 'studio' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold transition"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentStyleInfo.accentColor }}
              />
              <span>Style: {currentStyleInfo.name}</span>
              <ChevronDown size={14} />
            </button>

            <button
              type="button"
              onClick={() => setIsCustomizeOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Sliders size={14} />
              <span>Customize My Tree</span>{storageError&&<span role="alert">{storageError}</span>}
              <span className="bg-emerald-900 text-[11px] font-mono px-1.5 py-0.2 rounded">
                {visibleMembersCount}/{totalMembersCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUseSample100(true);
                setFilter((prev) => ({
                  ...prev,
                  selectedMemberIds: getCore50MemberIds(),
                  generationLimit: 'all',
                  endPersonId: undefined,
                }));
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition"
              title="Demonstrate selecting exactly 50 of 100 members"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>Demo Mode: 50 of 100</span>
            </button>
          </div>
        )}

        {/* Right: Existing Legacy View Tabs & Actions (Always rendered for automated test compatibility) */}
        <div className="flex items-center gap-2">
          {/* Legacy View Tabs Required for Phase 5 / Unified Tests */}
          <div className="view-tabs flex items-center gap-1" role="group" aria-label="Family tree design">
            {([
              ['classic', 'Classic', GitBranch],
              ['heritage', 'Heritage', Leaf],
              ['album', 'Family Album', Images],
            ] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                aria-pressed={mode === value}
                onClick={() => {
                  setMode(value);
                  setViewEngine('scene');
                }}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1 transition ${
                  mode === value && viewEngine === 'scene'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <button
            className="print-tree flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
            title="Print Tree"
            onClick={() => window.print()}
          >
            <Printer size={15} />
            <span>Print Tree</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: 13-STYLE FAMILY TREE DESIGN STUDIO CANVAS
          ========================================================================= */}
      {viewEngine === 'studio' && (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-100 min-h-[750px]">
          {/* Sub-bar: Dataset source & Zoom toolbar */}
          <div className="no-print flex items-center justify-between px-6 py-2 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Family Dataset:</span>
              <button
                type="button"
                onClick={() => {
                  setUseSample100(false);
                  setFilter((prev) => ({
                    ...prev,
                    selectedMemberIds: Object.keys(liveStudioMap),
                  }));
                }}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  !useSample100
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                Live Family Records ({members.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseSample100(true);
                  setFilter((prev) => ({
                    ...prev,
                    selectedMemberIds: Object.keys(SAMPLE_MEMBERS),
                  }));
                }}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  useSample100
                    ? 'bg-indigo-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                100-Member Benchmark Family
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Zoom controls */}
              <div className="flex items-center bg-white rounded-lg border border-slate-200 divide-x divide-slate-100">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
                  className="p-1.5 text-slate-600 hover:bg-slate-50"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="px-2 text-[11px] font-mono text-slate-600">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
                  className="p-1.5 text-slate-600 hover:bg-slate-50"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-1.5 text-slate-600 hover:bg-slate-50"
                  title="Reset View"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* PNG Export */}
              <button
                type="button"
                onClick={() =>
                  exportTreeToPNG(treeContainerRef.current, `shamsitree-${selectedStyle}.png`)
                }
                className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
              >
                <Download size={14} />
                <span>Save PNG</span>
              </button>
            </div>
          </div>

          {/* Interactive Zoom/Pan Canvas */}
          <div
            ref={treeContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`flex-1 relative overflow-auto tree-canvas-container ${
              isPanning ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                width: '100%',
                height: '100%',
              }}
              className="w-full h-full"
            >
              {selectedStyle === 'classic' && (
                <ClassicGenealogyTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
              {selectedStyle === 'natural-living' && (
                <NaturalLivingTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
              {selectedStyle === 'royal-heritage' && (
                <RoyalHeritageTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
              {selectedStyle === 'photo-album' && (
                <PhotoAlbumTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
              {selectedStyle === 'circular-radial' && (
                <CircularAncestryTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                  rootPersonId={filter.startPersonId}
                />
              )}
              {selectedStyle === 'fan-chart' && (
                <FanChartTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
              {selectedStyle === 'modern-minimalist' && (
                <ModernMinimalistTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
              {selectedStyle === 'timeline' && (
                <TimelineFamilyTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
              {selectedStyle === 'islamic-geometric' && (
                <IslamicGeometricTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
              {selectedStyle === 'starry-night' && (
                <StarryNightTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
              {selectedStyle === 'vintage-scroll' && (
                <VintageScrollTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
              {selectedStyle === 'horizontal-lineage' && (
                <HorizontalLineageTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
              {selectedStyle === 'interactive-network' && (
                <InteractiveNetworkTree
                  members={visibleStudioMembers}
                  bridgeIds={bridgeIds}
                  onSelectPerson={handleStudioPersonClick}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: HOUSEHOLD SCENE (Preserves 100% Phase 5 Test Compatibility)
          ========================================================================= */}
      <div
        className={viewEngine === 'scene' ? 'block' : 'hidden'}
        aria-hidden={viewEngine !== 'scene'}
      >
        <div className="tree-options p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-700">
          <label className="flex items-center gap-2">
            Generations
            <select
              aria-label="Visible generations"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
            >
              <option value="1">Parents & children</option>
              <option value="2">Include grandparents</option>
              <option value="3">More ancestors</option>
            </select>
          </label>
          {mode === 'heritage' && (
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={minimal}
                onChange={(e) => setMinimal(e.target.checked)}
              />
              Minimal decoration
            </label>
          )}
          <span className="text-gray-500">
            Explore any card to continue through a large family.
          </span>
        </div>
        <ViewBoundary key={mode} fallback={fallback}>
          <FamilyScene {...shared} mode={mode} />
        </ViewBoundary>
      </div>

      {/* =========================================================================
          STUDIO MODALS
          ========================================================================= */}
      {/* 1. Style Gallery Modal */}
      <StyleGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        currentStyleId={selectedStyle}
        onSelectStyle={(id) => {
          setSelectedStyle(id);
          setViewEngine('studio');
        }}
      />

      {/* 2. Customize My Tree Selection Studio Panel */}
      <CustomizeTreeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        allMembers={studioSourceMap}
        filter={filter}
        onFilterChange={setFilter}
        savedViews={savedViews}
        onSaveView={(name, desc) => {
          const newV: CustomTreeView = {
            id: `v-${Date.now()}`,
            name,
            description: desc,
            styleId: selectedStyle,
            includeSpouses: filter.includeSpouses,
            minGeneration: filter.minGeneration,
            maxGeneration: filter.maxGeneration,
            startPersonId: filter.startPersonId,
            endPersonId: filter.endPersonId,
            selectedMemberIds: [...filter.selectedMemberIds],
            generationLimit: filter.generationLimit,
            activeMarriageBranches: { ...filter.activeMarriageBranches },
            includeBridgeAncestors: filter.includeBridgeAncestors,
            createdAt: new Date().toISOString().split('T')[0],
          };
          setSavedViews([newV, ...savedViews]);
        }}
        onLoadView={(v) => {
          setFilter({
            startPersonId: v.startPersonId,
            endPersonId: v.endPersonId,
            selectedMemberIds: v.selectedMemberIds,
            minGeneration:v.minGeneration, maxGeneration:v.maxGeneration,
            generationLimit: v.generationLimit,
            activeMarriageBranches: v.activeMarriageBranches || {},
            includeSpouses: v.includeSpouses ?? false,
            includeBridgeAncestors: v.includeBridgeAncestors ?? true,
          });
          if (v.styleId) setSelectedStyle(v.styleId);
        }}
        onDeleteView={(id) => setSavedViews(savedViews.filter((v) => v.id !== id))}
        visibleCount={visibleMembersCount}
        totalCount={totalMembersCount}
        bridgeCount={bridgeIds.size}
        isDisconnected={isDisconnected}
      />

      {/* 3. Member Profile / Dynamic Form Modal */}
      <MemberProfileModal
        isOpen={!!selectedStudioPerson}
        onClose={() => setSelectedStudioPerson(null)}
        person={selectedStudioPerson}
        allMembers={studioSourceMap}
        onUpdatePerson={(updated) => {
          // Update in benchmark if editing
          setSelectedStudioPerson(updated);
        }}
      />
    </div>
  );
};
