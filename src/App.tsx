import { StandaloneBuilder } from './components/StandaloneBuilder';
import { saveToGraph } from './utils/familyGraph';
import { createMemberOnce } from './utils/createMemberOnce';
import { safeMemberDelete } from './utils/safeMemberDelete';
import { validateParentage } from './utils/validateParentage';
import { loadAllRows } from './utils/loadAllRows';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './utils/supabaseClient';
import {
  FamilyTree,
  FamilyMember,
  FamilyUnion,
  FamilyChild,
  SupportedLanguage,
  ChildRelationshipType
} from './types/family';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { FamilyTreeViewer } from './components/FamilyTreeViewer';
import { MemberModal } from './components/MemberModal';
import { MemberDetailModal } from './components/MemberDetailModal';
import { KinshipFinder } from './components/KinshipFinder';
import { MemoriesManager } from './components/MemoriesManager';
import { TestRunner } from './components/TestRunner';
import { photoFor } from './utils/photoStorage';
import { Search, Plus, Eye, Edit2, Trash2, Download, AlertCircle, RefreshCw, KeyRound, Mail, User } from 'lucide-react';

export default function App() {
  const [standalone, setStandalone] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTree, setCurrentTree] = useState<FamilyTree | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [unions, setUnions] = useState<FamilyUnion[]>([]);
  const [children, setChildren] = useState<FamilyChild[]>([]);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [selectedDetailMember, setSelectedDetailMember] = useState<FamilyMember | null>(null);
  const [defaultRelation, setDefaultRelation] = useState<{ targetMember: FamilyMember; relationType: 'father' | 'mother' | 'spouse' | 'child'; union?: FamilyUnion } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  // Auth UI state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Initial session check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        setCurrentUser(data.session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load tree and data when user signs in
  const loadTreeAndData = useCallback(async () => {
    if (!currentUser) return;

    try {
      // 1. Fetch or create tree
      let { data: trees, error: treeErr } = await supabase
        .from('family_trees')
        .select('*')
        .eq('owner_user_id', currentUser.id)
        .order('created_at', { ascending: true });

      if (treeErr) throw treeErr;

      let chosenTree: FamilyTree | null = null;
      let bestCount = -1;

      // Find tree with most member records
      if (trees && trees.length > 0) {
        for (const t of trees) {
          const mRes = await supabase.from('family_members').select('id', { count: 'exact', head: true }).eq('tree_id', t.id);
          if (mRes.error) throw mRes.error;
          const count = mRes.count || 0;
          if (count > bestCount) {
            bestCount = count;
            chosenTree = t;
          }
        }
      }

      if (!chosenTree) {
        // Fallback check if user created members in a legacy tree
        const legacy = await supabase.from('family_members').select('tree_id').eq('created_by', currentUser.id);
        if (legacy.data && legacy.data.length > 0) {
          const tId = legacy.data[0].tree_id;
          const tRes = await supabase.from('family_trees').select('*').eq('id', tId).maybeSingle();
          if (tRes.data) chosenTree = tRes.data;
        }
      }

      if (!chosenTree) {
        throw new Error('No existing tree found. Cloud creation awaits the database safety migration; use independent Form B meanwhile.');

      }

      setCurrentTree(chosenTree);

      // 2. Load members, unions, children
      if (chosenTree) {
        const [loadedMembers, loadedUnions, loadedChildren] = await Promise.all([
          loadAllRows<FamilyMember>(() => supabase.from('family_members').select('*').eq('tree_id', chosenTree!.id)),
          loadAllRows<FamilyUnion>(() => supabase.from('family_unions').select('*').eq('tree_id', chosenTree!.id)),
          loadAllRows<FamilyChild>(() => supabase.from('family_children').select('*').eq('tree_id', chosenTree!.id))
        ]);
        setMembers(loadedMembers.sort((a, b) => a.full_name.localeCompare(b.full_name)));
        setUnions(loadedUnions);
        setChildren(loadedChildren);
      }
    } catch (err: any) {
      console.error('Data load error:', err);
      alert('Could not load complete family data. Please retry: ' + (err.message || String(err)));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadTreeAndData();
    } else {
      setCurrentTree(null);
      setMembers([]);
      setUnions([]);
      setChildren([]);
    }
  }, [currentUser, loadTreeAndData]);

  // Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsAuthLoading(true);

    try {
      if (authMode === 'register') {
        if (!authFullName.trim()) throw new Error('Please enter your full name.');
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: { data: { display_name: authFullName.trim() } }
        });
        if (error) throw error;
        if (data.session) {
          setCurrentUser(data.session.user);
        } else {
          setAuthSuccess('Account created! Please check your email for confirmation or log in.');
          setAuthMode('login');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword
        });
        if (error) throw error;
        setCurrentUser(data.session.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  // Unified Save Member (handles both create and edit, and assigns relationships)
  const handleSaveMember = async (
    memberData: Partial<FamilyMember>,
    parentage?: { fatherId?: string; motherId?: string; spouseId?: string; relationshipType?: ChildRelationshipType }
  ) => {
    if (!currentUser || !currentTree) throw new Error('Tree not initialized.');

    // Inspect a fresh, complete snapshot before any write. Never upgrade a shared union.
    const [freshMembers, freshUnions, freshChildren] = await Promise.all([
      loadAllRows<FamilyMember>(() => supabase.from('family_members').select('*').eq('tree_id', currentTree.id)),
      loadAllRows<FamilyUnion>(() => supabase.from('family_unions').select('*').eq('tree_id', currentTree.id)),
      loadAllRows<FamilyChild>(() => supabase.from('family_children').select('*').eq('tree_id', currentTree.id))
    ]);
    const graph = {members: freshMembers, unions: freshUnions, children: freshChildren};
    const id = editingMember?.id || memberData.id;
    if (!id) throw new Error('Missing stable draft ID. Reopen the form.');
    const existing = freshMembers.find(m => m.id === id);
    const person = {...existing, ...memberData, id, tree_id: currentTree.id,
      created_by: existing?.created_by || currentUser.id} as FamilyMember;
    saveToGraph(graph, person, parentage, defaultRelation);
    // Live RLS inspection found unrestricted relationship and photo writes.
    // This release deliberately has no client flag capable of bypassing this gate.
    throw new Error('Cloud editing is paused pending the reviewed database safety migration. Your draft is still open. Form B can be saved independently on this device.');
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!currentTree) return;
    alert('Cloud deletion is paused pending the reviewed database safety migration.');
  };

  const handleAddRelative = (targetMember: FamilyMember, relationType: 'father' | 'mother' | 'spouse' | 'child', union?: FamilyUnion) => {
    setDefaultRelation({ targetMember, relationType, union });
    setEditingMember(null);
    setIsMemberModalOpen(true);
  };

  const handleDownloadStandaloneHTML = () => {
    alert('Historical HTML versions are preserved in the repository archives. Use Form B Export backup to save your current independent tree.');
  };

  // Filter members
  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = [
      m.full_name,
      m.biradari,
      m.location,
      m.current_residence,
      m.birthplace,
      m.notes
    ].some(field => field?.toLowerCase().includes(q));

    const matchesGender = genderFilter === 'all' || m.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  if (standalone) return <StandaloneBuilder onExit={() => setStandalone(false)} />;

  // Render Login screen if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-emerald-100">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🌳</div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">ShamsiTree</h1>
            <p className="text-xs text-emerald-800 font-medium mt-1">
              Unified Family System • خاندانی شجرہ نسب
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold mb-5">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${authMode === 'login' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-500'}`}
            >
              Log In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${authMode === 'register' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-500'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs sm:text-sm">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="e.g. Mohammad Asim Shamsi"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 outline-none text-gray-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 outline-none text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 outline-none text-gray-900"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">
                {authSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isAuthLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{authMode === 'login' ? 'Log In to ShamsiTree' : 'Create My Account'}</span>
            </button>
          </form>

          <button className="mt-5 w-full rounded-xl border border-emerald-700 p-3 text-emerald-800 font-bold" onClick={() => setStandalone(true)}>Open Form B — standalone tree</button>
          <p className="mt-3 text-xs text-gray-600">Cloud family data is view-only while database access policies are reviewed. Form B saves on this device.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-800 font-sans">
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onChangeLanguage={setLanguage}
        userEmail={currentUser?.email}
        onLogout={handleLogout}
        onExportHTML={handleDownloadStandaloneHTML}
      />

      <div className="bg-amber-50 border-b border-amber-200 p-3 text-sm text-center no-print">Form A — cloud viewing available; editing and uploads await database safety approval. <button className="underline font-bold" onClick={() => setStandalone(true)}>Open independent Form B</button></div>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* DASHBOARD TAB */}
        {currentTab === 'dashboard' && (
          <Dashboard
            tree={currentTree}
            members={members}
            unions={unions}
            language={language}
            onOpenAddMember={() => {
              setEditingMember(null);
              setDefaultRelation(null);
              setIsMemberModalOpen(true);
            }}
            onNavigateTab={setCurrentTab}
          />
        )}

        {/* UNIFIED FAMILY TREE TAB */}
        {currentTab === 'tree' && (
          <FamilyTreeViewer
            members={members}
            unions={unions}
            children={children}
            currentUserId={currentUser?.id}
            language={language}
            onSelectMember={(m) => setSelectedDetailMember(m)}
            onAddRelative={handleAddRelative}
            onOpenAddMember={() => {
              setEditingMember(null);
              setDefaultRelation(null);
              setIsMemberModalOpen(true);
            }}
          />
        )}

        {/* MEMBERS DIRECTORY TAB */}
        {currentTab === 'members' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Family Members Directory</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Browse, search, edit, and organize all family members in one place.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingMember(null);
                  setDefaultRelation(null);
                  setIsMemberModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Family Member</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, Biradari, location, residence, notes..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm outline-none"
                />
              </div>

              <div className="flex bg-white border border-gray-300 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setGenderFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${genderFilter === 'all' ? 'bg-emerald-100 text-emerald-900' : 'text-gray-600'}`}
                >
                  All ({members.length})
                </button>
                <button
                  onClick={() => setGenderFilter('male')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${genderFilter === 'male' ? 'bg-blue-100 text-blue-900' : 'text-gray-600'}`}
                >
                  Men ({members.filter(m => m.gender === 'male').length})
                </button>
                <button
                  onClick={() => setGenderFilter('female')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${genderFilter === 'female' ? 'bg-pink-100 text-pink-900' : 'text-gray-600'}`}
                >
                  Women ({members.filter(m => m.gender === 'female').length})
                </button>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Date of Birth</th>
                      <th className="py-3 px-4">Biradari</th>
                      <th className="py-3 px-4">Residence / City</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50/60 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={photoFor(m)}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              />
                              <div>
                                <div className="font-bold text-gray-900">{m.full_name}</div>
                                {m.date_of_death && (
                                  <span className="text-[10px] text-gray-400">Deceased (مرحوم)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 capitalize">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                m.gender === 'male'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-pink-50 text-pink-700 border border-pink-200'
                              }`}
                            >
                              {m.gender}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {m.date_of_birth || '-'}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-700">
                            {m.biradari || "Shamsi"}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {m.current_residence || m.location || '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedDetailMember(m)}
                                title="View Details"
                                className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMember(m);
                                  setDefaultRelation(null);
                                  setIsMemberModalOpen(true);
                                }}
                                title="Edit"
                                className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(m.id)}
                                title="Delete"
                                className="p-1.5 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-gray-400 text-xs">
                          No matching family members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* KINSHIP FINDER TAB */}
        {currentTab === 'kinship' && (
          <KinshipFinder
            members={members}
            unions={unions}
            children={children}
            language={language}
          />
        )}

        {/* MEMORIES & HERITAGE TAB */}
        {currentTab === 'memories' && (
          <div className="p-5 bg-white rounded-xl">Memories uploads are paused pending photo ownership policy approval. Existing memory records remain unchanged.</div>
        )}

        {/* INTEGRITY TESTS TAB */}
        {currentTab === 'tests' && (
          <TestRunner
            tree={currentTree}
            members={members}
            unions={unions}
            children={children}
            onRefreshData={loadTreeAndData}
          />
        )}

        {/* SETTINGS TAB */}
        {currentTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Application Settings & Exports</h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Interface Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="en">English</option>
                  <option value="ur">اردو (Urdu)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="font-bold text-gray-900 mb-1">Tree Metadata</div>
                <div className="text-xs text-gray-600">
                  Tree ID Code: <b className="font-mono">{currentTree?.tree_code || 'Not assigned'}</b>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Owner Email: <b>{currentUser?.email}</b>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="font-bold text-emerald-950 mb-1">Historical HTML Archives</div>
                <p className="text-xs text-emerald-900 mb-3">
                  Older 7.7 and 7.8 HTML versions are preserved in GitHub archives. They are not served here because their database writes have not passed the current safety review.
                </p>
                <button
                  onClick={handleDownloadStandaloneHTML}
                  className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>About historical versions</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
          setDefaultRelation(null);
        }}
        member={editingMember}
        allMembers={members}
        onSave={handleSaveMember}
        cloudReadOnly
        userId={currentUser?.id}
        defaultRelation={defaultRelation}
      />

      <MemberDetailModal
        member={selectedDetailMember}
        onClose={() => setSelectedDetailMember(null)}
        onEdit={(m) => {
          setEditingMember(m);
          setDefaultRelation(null);
          setIsMemberModalOpen(true);
        }}
        onDelete={handleDeleteMember}
        allMembers={members}
        unions={unions}
        children={children}
      />
    </div>
  );
}
