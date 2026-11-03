/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SAMPLE_MEMBERS, getCore50MemberIds, getLineagePath } from '../data/sampleFamily';
import { findHalfSiblings, getFilteredMembers } from '../utils/treeLayout';
import { isLeapYear, validateDate, normalizeToDDMMYYYY, toISODate } from '../components/SmartDateInput';
import { TREE_STYLES } from '../components/tree-styles/styleRegistry';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('--- RUNNING SHAMSITREE TEST SUITE ---');

// TEST 1: Database Size & Generational Depth
console.log('\n[1] Checking 100-Member Genealogy Database...');
const memberCount = Object.keys(SAMPLE_MEMBERS).length;
assert(memberCount >= 100, `Database contains ${memberCount} members (>= 100 required)`);

const core50 = getCore50MemberIds();
assert(core50.length === 50, `Core demonstration selection returns exactly 50 members (got ${core50.length})`);

// TEST 2: Mandatory Test Family Relationships (Objective 3)
console.log('\n[2] Checking Mandatory Test Family...');
const abdulMannan = SAMPLE_MEMBERS['abdul-mannan'];
assert(!!abdulMannan, 'Patriarch Abdul Mannan exists');

const anwarKamal = SAMPLE_MEMBERS['anwar-kamal'];
assert(!!anwarKamal, 'Anwar Kamal exists');
assert(anwarKamal.parentIds.includes('abdul-mannan'), 'Anwar Kamal has Abdul Mannan as parent');
assert(anwarKamal.spouses.length === 2, `Anwar Kamal has 2 recorded marriages (got ${anwarKamal.spouses.length})`);

const marriage1 = anwarKamal.spouses.find((s) => s.spouseId === 'ruhi-kamal');
const marriage2 = anwarKamal.spouses.find((s) => s.spouseId === 'ruhi-fakhir');
assert(!!marriage1 && marriage1.order === 1, 'Marriage 1 is Ruhi Kamal');
assert(!!marriage2 && marriage2.order === 2, 'Marriage 2 is Ruhi Fakhir');

const abdulGhani = SAMPLE_MEMBERS['abdul-ghani'];
const sidraKamal = SAMPLE_MEMBERS['sidra-kamal'];
assert(!!abdulGhani, 'Abdul Ghani exists');
assert(!!sidraKamal, 'Sidra Kamal exists');

assert(abdulGhani.fatherId === 'anwar-kamal' && abdulGhani.motherId === 'ruhi-kamal',
  'Abdul Ghani correctly attached to father Anwar Kamal and mother Ruhi Kamal');

assert(sidraKamal.fatherId === 'anwar-kamal' && sidraKamal.motherId === 'ruhi-fakhir',
  'Sidra Kamal correctly attached to father Anwar Kamal and mother Ruhi Fakhir');

// Half-Sibling Detection
const ghaniHalfSibs = findHalfSiblings(abdulGhani, SAMPLE_MEMBERS);
assert(ghaniHalfSibs.includes('sidra-kamal'), 'Abdul Ghani correctly identifies Sidra Kamal as half-sibling');

const sidraHalfSibs = findHalfSiblings(sidraKamal, SAMPLE_MEMBERS);
assert(sidraHalfSibs.includes('abdul-ghani'), 'Sidra Kamal correctly identifies Abdul Ghani as half-sibling');

// TEST 3: Marriage Branch Isolation (Objective 2.E)
console.log('\n[3] Testing Marriage Branch Filter...');
const filterMarriage1 = {
  startPersonId: 'anwar-kamal',
  selectedMemberIds: Object.keys(SAMPLE_MEMBERS),
  generationLimit: 'all' as const,
  activeMarriageBranches: {
    'anwar-kamal': ['ruhi-kamal'], // Only Ruhi Kamal branch active
  },
  includeBridgeAncestors: false,
};
const filteredResult1 = getFilteredMembers(SAMPLE_MEMBERS, filterMarriage1);
assert(!!filteredResult1.filtered['abdul-ghani'], 'Abdul Ghani present in Ruhi Kamal branch');
assert(!filteredResult1.filtered['sidra-kamal'], 'Sidra Kamal excluded when only Ruhi Kamal branch active');
assert(!filteredResult1.filtered['ruhi-fakhir'], 'Ruhi Fakhir excluded when only Ruhi Kamal branch active');

const filterMarriage2 = {
  startPersonId: 'anwar-kamal',
  selectedMemberIds: Object.keys(SAMPLE_MEMBERS),
  generationLimit: 'all' as const,
  activeMarriageBranches: {
    'anwar-kamal': ['ruhi-fakhir'], // Only Ruhi Fakhir branch active
  },
  includeBridgeAncestors: false,
};
const filteredResult2 = getFilteredMembers(SAMPLE_MEMBERS, filterMarriage2);
assert(!!filteredResult2.filtered['sidra-kamal'], 'Sidra Kamal present in Ruhi Fakhir branch');
assert(!filteredResult2.filtered['abdul-ghani'], 'Abdul Ghani excluded when only Ruhi Fakhir branch active');
assert(!filteredResult2.filtered['ruhi-kamal'], 'Ruhi Kamal excluded when only Ruhi Fakhir branch active');

// TEST 4: Smart Date Input & Validation (Objective 5)
console.log('\n[4] Testing Smart Date Input...');
assert(isLeapYear(2024), '2024 is recognized as leap year');
assert(!isLeapYear(2023), '2023 is not a leap year');
assert(validateDate(29, 2, 2024).valid, '29/02/2024 is valid');
assert(!validateDate(29, 2, 2023).valid, '29/02/2023 is flagged invalid');

assert(normalizeToDDMMYYYY('1980-08-15') === '15/08/1980', 'ISO 1980-08-15 correctly normalizes to 15/08/1980');
assert(toISODate('15/08/1980') === '1980-08-15', '15/08/1980 correctly converts to ISO 1980-08-15');

// TEST 5: Tree Style Gallery (Objective 1)
console.log('\n[5] Checking Tree Styles Registry (10+ Distinct Styles)...');
assert(TREE_STYLES.length >= 10, `At least 10 styles provided (got ${TREE_STYLES.length})`);
const styleIds = new Set(TREE_STYLES.map((s) => s.id));
assert(styleIds.has('classic'), 'Classic Genealogy Tree exists');
assert(styleIds.has('natural-living'), 'Natural Living Tree exists');
assert(styleIds.has('royal-heritage'), 'Royal Heritage Tree exists');
assert(styleIds.has('photo-album'), 'Family Photo Album exists');
assert(styleIds.has('circular-radial'), 'Circular Ancestry Tree exists');
assert(styleIds.has('fan-chart'), 'Fan Chart exists');
assert(styleIds.has('modern-minimalist'), 'Modern Minimalist Tree exists');
assert(styleIds.has('timeline'), 'Timeline Family Tree exists');
assert(styleIds.has('islamic-geometric'), 'Islamic Geometric Heritage Tree exists');
assert(styleIds.has('starry-night'), 'Starry Night Family Tree exists');
assert(styleIds.has('vintage-scroll'), 'Vintage Family Scroll exists');
assert(styleIds.has('horizontal-lineage'), 'Horizontal Lineage exists');
assert(styleIds.has('interactive-network'), 'Interactive Network Map exists');

console.log('\n🎉 ALL 24 GENEALOGY UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
