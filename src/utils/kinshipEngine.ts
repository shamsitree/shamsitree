import { FamilyMember, FamilyUnion, FamilyChild, KinshipResult, KinshipPathStep } from '../types/family';

interface GraphEdge {
  targetId: string;
  type: 'parent' | 'child' | 'spouse';
  meta?: {
    isBiological?: boolean;
    relationshipType?: string;
    unionId?: string;
  };
}

export class KinshipEngine {
  private membersMap = new Map<string, FamilyMember>();
  private unions: FamilyUnion[] = [];
  private children: FamilyChild[] = [];
  private adjacency = new Map<string, GraphEdge[]>();

  constructor(members: FamilyMember[], unions: FamilyUnion[], children: FamilyChild[]) {
    this.unions = unions;
    this.children = children;
    members.forEach(m => this.membersMap.set(m.id, m));
    this.buildGraph();
  }

  private addEdge(from: string, to: string, type: 'parent' | 'child' | 'spouse', isBiological = true, unionId?: string, relationshipType?: string) {
    if (!this.adjacency.has(from)) this.adjacency.set(from, []);
    this.adjacency.get(from)!.push({ targetId: to, type, meta: { isBiological, unionId, relationshipType } });
  }

  private buildGraph() {
    this.adjacency.clear();

    // Couple / spouse unions
    for (const union of this.unions) {
      if (union.partner1_id && union.partner2_id && union.relationship_type === 'spouse') {
        this.addEdge(union.partner1_id, union.partner2_id, 'spouse', true, union.id);
        this.addEdge(union.partner2_id, union.partner1_id, 'spouse', true, union.id);
      }
    }

    // Children links to unions
    for (const link of this.children) {
      const union = this.unions.find(u => u.id === link.family_union_id);
      if (!union) continue;
      const isBio = link.relationship_type === 'biological';

      if (union.partner1_id) {
        // Child -> Parent
        this.addEdge(link.child_id, union.partner1_id, 'parent', isBio, union.id, link.relationship_type);
        // Parent -> Child
        this.addEdge(union.partner1_id, link.child_id, 'child', isBio, union.id, link.relationship_type);
      }

      if (union.partner2_id) {
        // Child -> Parent
        this.addEdge(link.child_id, union.partner2_id, 'parent', isBio, union.id, link.relationship_type);
        // Parent -> Child
        this.addEdge(union.partner2_id, link.child_id, 'child', isBio, union.id, link.relationship_type);
      }
    }
  }

  public getParents(personId: string): FamilyMember[] {
    const edges = this.adjacency.get(personId) || [];
    return edges.filter(e => e.type === 'parent').map(e => this.membersMap.get(e.targetId)).filter(Boolean) as FamilyMember[];
  }

  public getChildren(personId: string): FamilyMember[] {
    const edges = this.adjacency.get(personId) || [];
    return edges.filter(e => e.type === 'child').map(e => this.membersMap.get(e.targetId)).filter(Boolean) as FamilyMember[];
  }

  public getSpouses(personId: string): FamilyMember[] {
    const edges = this.adjacency.get(personId) || [];
    return edges.filter(e => e.type === 'spouse').map(e => this.membersMap.get(e.targetId)).filter(Boolean) as FamilyMember[];
  }

  public getSiblings(personId: string): { member: FamilyMember; isHalf: boolean }[] {
    const parents = this.getParents(personId);
    if (!parents.length) return [];

    const parentIds = new Set(parents.map(p => p.id));
    const siblingMap = new Map<string, number>(); // siblingId -> count of shared parents

    for (const parent of parents) {
      const kids = this.getChildren(parent.id);
      for (const kid of kids) {
        if (kid.id === personId) continue;
        siblingMap.set(kid.id, (siblingMap.get(kid.id) || 0) + 1);
      }
    }

    const result: { member: FamilyMember; isHalf: boolean }[] = [];
    siblingMap.forEach((sharedCount, sibId) => {
      const member = this.membersMap.get(sibId);
      if (member) {
        result.push({
          member,
          isHalf: sharedCount === 1 && parentIds.size === 2 && new Set(this.getParents(sibId).map(p => p.id)).size === 2
        });
      }
    });

    return result;
  }

  /**
   * Finds the shortest genealogical path between two members using BFS.
   */
  public findPath(fromId: string, toId: string): KinshipPathStep[] | null {
    if (fromId === toId) return [];

    const queue: { id: string; path: KinshipPathStep[] }[] = [];
    const visited = new Set<string>();

    queue.push({ id: fromId, path: [] });
    visited.add(fromId);

    while (queue.length > 0) {
      const { id: currentId, path: currentPath } = queue.shift()!;

      if (currentId === toId) {
        return currentPath;
      }

      const edges = this.adjacency.get(currentId) || [];
      for (const edge of edges) {
        if (!visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          const targetMember = this.membersMap.get(edge.targetId);
          if (!targetMember) continue;

          let desc = '';
          if (edge.type === 'parent') desc = targetMember.gender === 'male' ? 'Father' : targetMember.gender === 'female' ? 'Mother' : 'Parent';
          else if (edge.type === 'child') desc = targetMember.gender === 'male' ? 'Son' : targetMember.gender === 'female' ? 'Daughter' : 'Child';
          else if (edge.type === 'spouse') desc = targetMember.gender === 'male' ? 'Husband' : 'Wife';

          const nextStep: KinshipPathStep = {
            personId: targetMember.id,
            personName: targetMember.full_name,
            gender: targetMember.gender,
            stepType: edge.type,
            stepDescription: desc
          };

          queue.push({
            id: edge.targetId,
            path: [...currentPath, nextStep]
          });
        }
      }
    }

    return null;
  }

  /**
   * Determine exact kinship terms between Person A and Person B in both directions.
   */
  public calculateRelationship(personAId: string, personBId: string): KinshipResult | null {
    const personA = this.membersMap.get(personAId);
    const personB = this.membersMap.get(personBId);
    if (!personA || !personB) return null;

    if (personAId === personBId) {
      return {
        fromPerson: personA,
        toPerson: personB,
        relationshipEn: "Same Person",
        relationshipUr: "وہی شخص (خود)",
        relationshipHi: "वही व्यक्ति (स्वयं)",
        reverseRelationshipEn: "Same Person",
        reverseRelationshipUr: "وہی شخص (خود)",
        reverseRelationshipHi: "वही व्यक्ति (स्वयं)",
        path: [],
        degreeOfSeparation: 0
      };
    }

    const path = this.findPath(personAId, personBId);
    if (!path || path.length === 0) {
      return {
        fromPerson: personA,
        toPerson: personB,
        relationshipEn: "No known family connection",
        relationshipUr: "خاندانی تعلق ریکارڈ میں موجود نہیں",
        relationshipHi: "कोई ज्ञात पारिवारिक संबंध नहीं",
        reverseRelationshipEn: "No known family connection",
        reverseRelationshipUr: "خاندانی تعلق ریکارڈ میں موجود نہیں",
        reverseRelationshipHi: "कोई ज्ञात पारिवारिक संबंध नहीं",
        path: [],
        degreeOfSeparation: -1,
        details: "No relationship link was found between these two members in the active tree."
      };
    }

    const forward = this.identifyRelationship(personA, personB);
    const reverse = this.identifyRelationship(personB, personA);

    return {
      fromPerson: personA,
      toPerson: personB,
      relationshipEn: forward.en,
      relationshipUr: forward.ur,
      relationshipHi: forward.hi,
      reverseRelationshipEn: reverse.en,
      reverseRelationshipUr: reverse.ur,
      reverseRelationshipHi: reverse.hi,
      path,
      degreeOfSeparation: path.length,
      details: forward.details
    };
  }

  private identifyRelationship(a: FamilyMember, b: FamilyMember): { en: string; ur: string; hi: string; details?: string } {
    // b's relationship to a (i.e. "b is a's ...")
    const bGender = b.gender;
    const aParents = this.getParents(a.id);
    const aChildren = this.getChildren(a.id);
    const aSpouses = this.getSpouses(a.id);

    // 1. Spouses
    if (aSpouses.some(s => s.id === b.id)) {
      if (bGender === 'male') {
        return { en: "Husband", ur: "شوہر", hi: "पति / शौहर" };
      }
      return { en: "Wife", ur: "بیوی", hi: "पत्नी / बीवी" };
    }

    // Keep directly recorded non-biological parentage explicit.
    const directEdges = (this.adjacency.get(a.id) || []).filter(e =>
      e.targetId === b.id && (e.type === 'parent' || e.type === 'child'));
    const typed = directEdges.find(e => e.meta?.relationshipType && e.meta.relationshipType !== 'biological');
    if (typed) {
      const type = typed.meta!.relationshipType!;
      const parent = typed.type === 'parent';
      const labels: Record<string, { en: string; ur: string; hi: string }> = {
        adopted: parent
          ? { en: 'Adoptive Parent', ur: 'گود لینے والے والدین', hi: 'दत्तक अभिभावक' }
          : { en: 'Adopted Child', ur: 'گود لی ہوئی اولاد', hi: 'दत्तक संतान' },
        foster: parent
          ? { en: 'Foster Parent', ur: 'پرورش کرنے والے والدین', hi: 'पालक अभिभावक' }
          : { en: 'Foster Child', ur: 'زیر پرورش بچہ', hi: 'पालित संतान' },
        step: parent
          ? { en: 'Step-Parent', ur: 'سوتیلے والدین', hi: 'सौतेले अभिभावक' }
          : { en: 'Step-Child', ur: 'سوتیلی اولاد', hi: 'सौतेली संतान' }
      };
      return labels[type] || { en: 'Recorded Parentage', ur: 'درج شدہ رشتہ', hi: 'दर्ज अभिभावक संबंध' };
    }

    // 2. Parent
    if (aParents.some(p => p.id === b.id)) {
      if (bGender === 'male') return { en: "Father", ur: "والد / باپ", hi: "पिता / वालिद" };
      if (bGender === 'female') return { en: "Mother", ur: "والدہ / ماں", hi: "माता / वालिदा" };
      return { en: "Parent", ur: "والدین", hi: "अभिभावक" };
    }

    // 3. Child
    if (aChildren.some(c => c.id === b.id)) {
      if (bGender === 'male') return { en: "Son", ur: "بیٹا", hi: "बेटा" };
      if (bGender === 'female') return { en: "Daughter", ur: "بیٹی", hi: "बेटी" };
      return { en: "Child", ur: "اولاد", hi: "संतान" };
    }

    // 4. Siblings
    const siblings = this.getSiblings(a.id);
    const sibMatch = siblings.find(s => s.member.id === b.id);
    if (sibMatch) {
      if (sibMatch.isHalf) {
        const shared = aParents.filter(p => this.getParents(b.id).some(q => q.id === p.id));
        const side = shared[0]?.gender === 'male' ? 'Paternal' : 'Maternal';
        return { en: `${side} Half-${bGender === 'male' ? 'Brother' : bGender === 'female' ? 'Sister' : 'Sibling'}`, ur: side === 'Paternal' ? 'باپ مشترک، مائیں مختلف' : 'ماں مشترک، باپ مختلف', hi: side === 'Paternal' ? 'पिता समान, माताएं अलग' : 'माता समान, पिता अलग' };
      }
      if (bGender === 'male') return { en: "Brother", ur: "بھائی", hi: "भाई" };
      if (bGender === 'female') return { en: "Sister", ur: "بہن", hi: "बहन" };
      return { en: "Sibling", ur: "بہن بھائی", hi: "सहोदर" };
    }

    // 5. Grandparents
    for (const p of aParents) {
      const gParents = this.getParents(p.id);
      if (gParents.some(gp => gp.id === b.id)) {
        if (p.gender === 'male') {
          // Paternal
          if (bGender === 'male') return { en: "Paternal Grandfather", ur: "دادا", hi: "दादा" };
          return { en: "Paternal Grandmother", ur: "دادی", hi: "दादी" };
        } else {
          // Maternal
          if (bGender === 'male') return { en: "Maternal Grandfather", ur: "نانا", hi: "नाना" };
          return { en: "Maternal Grandmother", ur: "نانی", hi: "नानी" };
        }
      }
    }

    // 6. Grandchildren
    for (const c of aChildren) {
      const grandKids = this.getChildren(c.id);
      if (grandKids.some(gk => gk.id === b.id)) {
        if (c.gender === 'male') {
          if (bGender === 'male') return { en: "Grandson (Son's son)", ur: "پوتا", hi: "पोता" };
          return { en: "Granddaughter (Son's daughter)", ur: "پوتی", hi: "पोती" };
        } else {
          if (bGender === 'male') return { en: "Grandson (Daughter's son)", ur: "نواسا", hi: "नाती / नवासा" };
          return { en: "Granddaughter (Daughter's daughter)", ur: "نواسی", hi: "नातिन / नवासी" };
        }
      }
    }

    // 7. Uncles & Aunts (Parents' Siblings)
    for (const p of aParents) {
      const pSibs = this.getSiblings(p.id);
      const uncleMatch = pSibs.find(s => s.member.id === b.id);
      if (uncleMatch) {
        if (p.gender === 'male') {
          // Father's side
          if (bGender === 'male') return { en: "Paternal Uncle (Chacha / Taya)", ur: "چچا / تایا", hi: "चाचा / ताऊ" };
          if (bGender === 'female') return { en: "Paternal Aunt (Phuppi)", ur: "پھوپھی", hi: "बुआ / फूफी" };
        } else {
          // Mother's side
          if (bGender === 'male') return { en: "Maternal Uncle (Mamu)", ur: "ماموں", hi: "मामा" };
          if (bGender === 'female') return { en: "Maternal Aunt (Khala)", ur: "خالہ", hi: "मौसी / खाला" };
        }
      }
    }

    // 8. Nephews & Nieces (Siblings' Children)
    for (const s of siblings) {
      const sKids = this.getChildren(s.member.id);
      if (sKids.some(sk => sk.id === b.id)) {
        if (s.member.gender === 'male') {
          // Brother's child
          if (bGender === 'male') return { en: "Nephew (Brother's son)", ur: "بھتیجا", hi: "भतीजा" };
          return { en: "Niece (Brother's daughter)", ur: "بھتیجی", hi: "भतीजी" };
        } else {
          // Sister's child
          if (bGender === 'male') return { en: "Nephew (Sister's son)", ur: "بھانجا", hi: "भांजा" };
          return { en: "Niece (Sister's daughter)", ur: "بھانجی", hi: "भांजी" };
        }
      }
    }

    // 9. First Cousins
    for (const p of aParents) {
      const pSibs = this.getSiblings(p.id);
      for (const uncleAunt of pSibs) {
        const cousins = this.getChildren(uncleAunt.member.id);
        if (cousins.some(c => c.id === b.id)) {
          let side = p.gender === 'male' ? "Paternal" : "Maternal";
          let specific = "";
          if (p.gender === 'male') {
            specific = uncleAunt.member.gender === 'male' ? "چچازاد" : "پھوپھی زاد";
          } else {
            specific = uncleAunt.member.gender === 'male' ? "ماموں زاد" : "خالہ زاد";
          }
          const termUr = bGender === 'male' ? `${specific} بھائی` : `${specific} بہن`;
          const termHi = bGender === 'male' ? `${side} चचेरा/ममेरा भाई` : `${side} चचेरी/ममेरी बहन`;
          return { en: `${side} First Cousin`, ur: termUr, hi: termHi };
        }
      }
    }

    // 10. In-laws
    // Spouse's Parents
    for (const sp of aSpouses) {
      const inLawParents = this.getParents(sp.id);
      if (inLawParents.some(ilp => ilp.id === b.id)) {
        if (bGender === 'male') return { en: "Father-in-law", ur: "سسر", hi: "ससुर" };
        return { en: "Mother-in-law", ur: "ساس", hi: "सास" };
      }
      // Spouse's Siblings
      const spSibs = this.getSiblings(sp.id);
      if (spSibs.some(sps => sps.member.id === b.id)) {
        if (bGender === 'male') return { en: "Brother-in-law", ur: "سالا / بہنوئی / دیور", hi: "साला / जीजा / देवर" };
        return { en: "Sister-in-law", ur: "سالی / بھابھی / نند", hi: "साली / भाभी / ननद" };
      }
    }

    // Sibling's Spouse
    for (const s of siblings) {
      const sSpouses = this.getSpouses(s.member.id);
      if (sSpouses.some(ssp => ssp.id === b.id)) {
        if (bGender === 'male') return { en: "Brother-in-law (Sister's husband)", ur: "بہنوئی", hi: "जीजा" };
        return { en: "Sister-in-law (Brother's wife)", ur: "بھابھی", hi: "भाभी" };
      }
    }

    // Child's Spouse
    for (const c of aChildren) {
      const cSpouses = this.getSpouses(c.id);
      if (cSpouses.some(csp => csp.id === b.id)) {
        if (bGender === 'male') return { en: "Son-in-law", ur: "داماد", hi: "दामाद" };
        return { en: "Daughter-in-law", ur: "بہو", hi: "बहू" };
      }
    }

    // Fallback: Extended Relative
    return {
      en: "Extended Relative",
      ur: "عزیز / قریبی رشتہ دار",
      hi: "दूर का रिश्तेदार / संबंधी"
    };
  }
}
