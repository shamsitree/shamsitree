import { PREVIEW_ONLY } from '../utils/previewMode';
import { loadAllRows } from '../utils/loadAllRows';
import React, { useState } from 'react';
import { FamilyTree, FamilyMember, FamilyUnion, FamilyChild } from '../types/family';
import { supabase } from '../utils/supabaseClient';
import { KinshipEngine } from '../utils/kinshipEngine';
import { ShieldCheck, Play, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface TestRunnerProps {
  tree: FamilyTree | null;
  members: FamilyMember[];
  unions: FamilyUnion[];
  children: FamilyChild[];
  onRefreshData: () => Promise<void>;
}

interface TestReportItem {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  detail: string;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  tree,
  members,
  unions,
  children,
  onRefreshData
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [reports, setReports] = useState<TestReportItem[]>([]);

  const runAllTests = async () => {
    if (PREVIEW_ONLY) { alert('Live database tests are disabled in this isolated visual preview.'); return; }
    if (!tree) {
      alert('No active family tree loaded.');
      return;
    }

    setIsRunning(true);
    const results: TestReportItem[] = [];

    try {
      // 1. Fetch fresh snapshot from Supabase directly
      const [freshUnions, freshChildren, freshMembers] = await Promise.all([
        loadAllRows<FamilyUnion>(() => supabase.from('family_unions').select('*').eq('tree_id', tree.id)),
        loadAllRows<FamilyChild>(() => supabase.from('family_children').select('*').eq('tree_id', tree.id)),
        loadAllRows<FamilyMember>(() => supabase.from('family_members').select('*').eq('tree_id', tree.id))
      ]);

      const memberIds = new Set(freshMembers.map(m => m.id));
      const unionIds = new Set(freshUnions.map(u => u.id));

      // Test 1: Union Partner References
      const orphanUnions = freshUnions.filter(
        u => (u.partner1_id && !memberIds.has(u.partner1_id)) || (u.partner2_id && !memberIds.has(u.partner2_id))
      );
      results.push({
        name: "Union Partner References",
        status: orphanUnions.length ? 'FAIL' : 'PASS',
        detail: orphanUnions.length
          ? `${orphanUnions.length} union(s) reference missing or deleted member rows.`
          : `All ${freshUnions.length} union(s) reference valid, existing family members.`
      });

      // Test 2: Child Link References
      const orphanChildren = freshChildren.filter(
        fc => !unionIds.has(fc.family_union_id) || !memberIds.has(fc.child_id)
      );
      results.push({
        name: "Child Link References",
        status: orphanChildren.length ? 'FAIL' : 'PASS',
        detail: orphanChildren.length
          ? `${orphanChildren.length} child link(s) are orphaned or missing partner unions.`
          : `All ${freshChildren.length} child link(s) connect to valid unions and member rows.`
      });

      // Test 3: Duplicate Partner Unions
      const pairSeen = new Set<string>();
      const duplicatePairs: string[] = [];
      for (const u of freshUnions) {
        if (!u.partner1_id || !u.partner2_id) continue;
        const key = [u.partner1_id, u.partner2_id].sort().join('|') + '|' + (u.relationship_type || '');
        if (pairSeen.has(key)) duplicatePairs.push(key);
        else pairSeen.add(key);
      }
      results.push({
        name: "Duplicate Partner Unions",
        status: duplicatePairs.length ? 'FAIL' : 'PASS',
        detail: duplicatePairs.length
          ? `${duplicatePairs.length} duplicate spouse pair(s) found in database.`
          : "No duplicate two-partner unions found in this snapshot. Concurrent-write protection was not tested."
      });

      // Test 4: Single Parenting Union per Child
      const childUnionMap = new Map<string, Set<string>>();
      for (const fc of freshChildren) {
        if (!childUnionMap.has(fc.child_id)) childUnionMap.set(fc.child_id, new Set());
        childUnionMap.get(fc.child_id)!.add(fc.family_union_id);
      }
      const multiUnionChildren = [...childUnionMap.entries()].filter(([, set]) => set.size > 1);
      results.push({
        name: "Multi-Union Parenting Constraint",
        status: multiUnionChildren.length ? 'FAIL' : 'PASS',
        detail: multiUnionChildren.length
          ? `${multiUnionChildren.length} child(ren) are linked to multiple parenting unions.`
          : "No child in the loaded links belongs to more than one parenting union. Unlinked members are not checked."
      });

      // Test 5: Kinship Engine Bidirectional Reciprocity Test
      const engine = new KinshipEngine(freshMembers, freshUnions, freshChildren);
      const sample = freshMembers.slice(0, 20);
      let checked = 0;
      const mismatches: string[] = [];
      for (let i = 0; i < sample.length; i++) {
        for (let j = i + 1; j < sample.length; j++) {
          const a = sample[i], b = sample[j];
          const forward = engine.calculateRelationship(a.id, b.id);
          const reverse = engine.calculateRelationship(b.id, a.id);
          checked++;
          if (!forward || !reverse || forward.reverseRelationshipEn !== reverse.relationshipEn ||
              reverse.reverseRelationshipEn !== forward.relationshipEn ||
              forward.degreeOfSeparation !== reverse.degreeOfSeparation) {
            mismatches.push(`${a.id} / ${b.id}`);
          }
        }
      }
      results.push({
        name: 'Kinship Calculation Internal Consistency (sample)',
        status: checked === 0 ? 'SKIP' : mismatches.length ? 'FAIL' : 'PASS',
        detail: `${checked} pairs checked; ${mismatches.length} inconsistent results. This checks internal consistency, not genealogical correctness.`
      });
      results.push({
        name: 'Database Third-Parent / Concurrent Write Rejection',
        status: 'SKIP',
        detail: 'Not executed: requires an isolated test database and verified constraints. Existing two-parent rows do not prove rejection.'
      });

      setReports(results);
      await onRefreshData();
    } catch (err: any) {
      results.push({
        name: "Test Execution Error",
        status: 'FAIL',
        detail: err.message || String(err)
      });
      setReports(results);
    } finally {
      setIsRunning(false);
    }
  };

  const passCount = reports.filter(r => r.status === 'PASS').length;
  const failCount = reports.filter(r => r.status === 'FAIL').length;
  const skipCount = reports.filter(r => r.status === 'SKIP').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Database & Relationship Integrity Tests</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Safe, non-destructive regression checker inspecting Supabase tables and kinship paths.
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Running Tests...' : 'Run Full Integrity Suite'}</span>
        </button>
      </div>

      {/* Summary Pills */}
      {reports.length > 0 && (
        <div className="flex gap-3">
          <span className="bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{passCount} PASSED</span>
          </span>
          {failCount > 0 && (
            <span className="bg-red-100 text-red-900 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-700" />
              <span>{failCount} FAILED</span>
            </span>
          )}
          {skipCount > 0 && (
            <span className="bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>{skipCount} SKIPPED</span>
            </span>
          )}
        </div>
      )}

      {/* Report Rows */}
      {reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((item, idx) => {
            const isPass = item.status === 'PASS';
            const isFail = item.status === 'FAIL';
            const borderCol = isPass ? 'border-l-emerald-600' : isFail ? 'border-l-red-600' : 'border-l-amber-500';
            const badgeBg = isPass ? 'bg-emerald-50 text-emerald-800' : isFail ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800';

            return (
              <div
                key={idx}
                className={`bg-white p-4 rounded-xl border border-gray-200 border-l-4 ${borderCol} shadow-xs space-y-1`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-900">{item.name}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${badgeBg}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{item.detail}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-10 text-center rounded-2xl border border-gray-200 text-gray-400 text-xs">
          Click "Run Full Integrity Suite" to verify Supabase relationship integrity without modifying data.
        </div>
      )}
    </div>
  );
};
