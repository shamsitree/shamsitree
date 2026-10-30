/**
 * ShamsiTree 7.8 Unified — Core Type Definitions
 */

export type Gender = 'male' | 'female' | 'other';
export type MarriageStatus = 'married' | 'divorced' | 'widowed' | 'unknown';
export type ChildRelationshipType = 'biological' | 'adopted' | 'foster' | 'step';
export type UnionRelationshipType = 'spouse' | 'single_parent';

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

export type SupportedLanguage = 'en' | 'hi' | 'ur';
