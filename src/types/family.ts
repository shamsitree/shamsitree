/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShamsiTree Unified 7.8 — Core & Family Tree Design Studio Type Definitions
 */

export type Gender = 'male' | 'female' | 'other';
export type MarriageStatus = 'married' | 'divorced' | 'widowed' | 'unknown';
export type ChildRelationshipType = 'biological' | 'adopted' | 'foster' | 'step';
export type UnionRelationshipType = 'spouse' | 'single_parent';
export type RelationshipType = 'biological' | 'adopted' | 'foster';
export type SupportedLanguage = 'en' | 'hi' | 'ur';

/* Database & Persistence Schema */
export interface FamilyTree {
  id: string;
  owner_user_id: string;
  name: string;
  tree_code?: string;
  created_at?: string;
}

export interface FamilyMember {
  id: string;
  tree_id: string;
  created_by?: string;
  full_name: string;
  gender: Gender;
  date_of_birth?: string | null;
  date_of_death?: string | null;
  phone?: string | null;
  biradari?: string | null;
  birthplace?: string | null;
  current_residence?: string | null;
  location?: string | null;
  profile_photo?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface FamilyUnion {
  id: string;
  tree_id: string;
  partner1_id: string;
  partner2_id: string | null;
  relationship_type: UnionRelationshipType;
  marriage_status: MarriageStatus | string;
  created_at?: string;
}

export interface FamilyChild {
  id: string;
  tree_id: string;
  family_union_id: string;
  child_id: string;
  relationship_type: ChildRelationshipType | string;
  created_at?: string;
}

export interface VirtualRelationship {
  id: string;
  tree_id: string;
  person_id: string;
  related_person_id: string;
  relation_type: 'parent' | 'spouse' | 'child' | 'sibling';
  family_union_id?: string;
  child_relationship_type?: ChildRelationshipType | string;
}

export interface KinshipPathStep {
  personId: string;
  personName: string;
  gender: Gender;
  stepType: 'parent' | 'child' | 'spouse' | 'sibling';
  stepDescription: string;
}

export interface KinshipResult {
  fromPerson: FamilyMember;
  toPerson: FamilyMember;
  relationshipEn: string;
  relationshipUr: string;
  relationshipHi: string;
  reverseRelationshipEn: string;
  reverseRelationshipUr: string;
  reverseRelationshipHi: string;
  path: KinshipPathStep[];
  degreeOfSeparation: number;
  details?: string;
}

export interface FamilyMemory {
  id: string;
  title: string;
  notes: string;
  photo_path?: string | null;
  created_at: string;
}

/* Family Tree Design Studio Visual Models */
export interface SpouseRelationship {
  spouseId: string;
  marriageDate?: string;
  marriagePlace?: string;
  marriageStatus?: 'current' | 'divorced' | 'widowed';
  order: number;
  notes?: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  arabicName?: string;
  gender: Gender;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  isLiving: boolean;
  avatarUrl?: string;
  avatarColor?: string;
  generation: number;
  bio?: string;
  occupation?: string;
  spouses: SpouseRelationship[];
  parentIds: string[];
  motherId?: string;
  fatherId?: string;
  marriageBranchId?: string;
  relationshipType?: RelationshipType;
  tags?: string[];
  notes?: string;
}

/** Read-only bridge alias for Design Studio */
export type StudioPerson = Person;

export type TreeStyleId =
  | 'classic'
  | 'natural-living'
  | 'royal-heritage'
  | 'photo-album'
  | 'circular-radial'
  | 'fan-chart'
  | 'modern-minimalist'
  | 'timeline'
  | 'islamic-geometric'
  | 'starry-night'
  | 'vintage-scroll'
  | 'horizontal-lineage'
  | 'interactive-network';

export interface TreeStyleInfo {
  id: TreeStyleId;
  name: string;
  shortDesc: string;
  visualTheme: string;
  iconName: string;
  badgeText: string;
  accentColor: string;
}

export interface TreeViewFilter {
  startPersonId: string;
  endPersonId?: string;
  selectedMemberIds: string[];
  generationLimit: number | 'all';
  minGeneration?: number;
  maxGeneration?: number;
  activeMarriageBranches: Record<string, string[]>;
  includeSpouses?: boolean;
  includeBridgeAncestors: boolean;
}

export interface CustomTreeView {
  id: string;
  name: string;
  description: string;
  styleId: TreeStyleId;
  startPersonId: string;
  endPersonId?: string;
  selectedMemberIds: string[];
  generationLimit: number | 'all';
  activeMarriageBranches: Record<string, string[]>;
  includeBridgeAncestors: boolean;
  createdAt: string;
}
