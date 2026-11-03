/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Person } from '../types/family';

/**
 * 100-Member Comprehensive Shamsi Lineage
 * Features the mandatory test case:
 * Abdul Mannan (Gen 1) -> Anwar Kamal (Gen 2)
 * Anwar Kamal has two marriages:
 *  1. Ruhi Kamal -> Son: Abdul Ghani (Gen 3)
 *  2. Ruhi Fakhir -> Daughter: Sidra Kamal (Gen 3)
 * Half-siblings: Abdul Ghani and Sidra Kamal
 */
export const SAMPLE_MEMBERS: Record<string, Person> = {
  // ==========================================
  // GENERATION 1: PATRIARCHS & ANCESTORS (Gen 1)
  // ==========================================
  'abdul-mannan': {
    id: 'abdul-mannan',
    firstName: 'Abdul',
    lastName: 'Mannan Shamsi',
    arabicName: 'عبد المنان الشمسي',
    gender: 'male',
    birthDate: '15/03/1918',
    birthPlace: 'Agra, UP',
    deathDate: '24/11/1992',
    deathPlace: 'Karachi',
    isLiving: false,
    generation: 1,
    occupation: 'Scholarly Merchant & Calligrapher',
    bio: 'Patriarch of the Shamsi family. Founded the ancestral trade house and preserved generations of family manuscripts.',
    avatarColor: '#1e3a8a',
    parentIds: [],
    spouses: [
      {
        spouseId: 'fatima-begum',
        marriageDate: '10/05/1942',
        order: 1,
        marriageStatus: 'widowed',
      },
    ],
    tags: ['Patriarch', 'Founder', 'Core Lineage'],
  },
  'fatima-begum': {
    id: 'fatima-begum',
    firstName: 'Fatima',
    lastName: 'Begum',
    arabicName: 'فاطمة بيكم',
    gender: 'female',
    birthDate: '08/09/1924',
    birthPlace: 'Delhi',
    deathDate: '12/04/2005',
    deathPlace: 'Karachi',
    isLiving: false,
    generation: 1,
    occupation: 'Educator & Community Elder',
    bio: 'Beloved matriarch known for memorising poetic treatises and fostering orphan educational trusts.',
    avatarColor: '#831843',
    parentIds: [],
    spouses: [
      {
        spouseId: 'abdul-mannan',
        marriageDate: '10/05/1942',
        order: 1,
      },
    ],
    tags: ['Matriarch'],
  },
  'hashim-shamsi': {
    id: 'hashim-shamsi',
    firstName: 'Hashim',
    lastName: 'Shamsi',
    arabicName: 'هاشم الشمسي',
    gender: 'male',
    birthDate: '12/01/1915',
    birthPlace: 'Agra',
    deathDate: '03/06/1988',
    deathPlace: 'Lahore',
    isLiving: false,
    generation: 1,
    occupation: 'Civil Magistrate',
    bio: 'Elder brother of Abdul Mannan, prominent jurist and botanical enthusiast.',
    avatarColor: '#14532d',
    parentIds: [],
    spouses: [{ spouseId: 'salma-khatun', marriageDate: '14/11/1938', order: 1 }],
    tags: ['Elder Branch'],
  },
  'salma-khatun': {
    id: 'salma-khatun',
    firstName: 'Salma',
    lastName: 'Khatun',
    gender: 'female',
    birthDate: '19/04/1920',
    deathDate: '15/08/1998',
    isLiving: false,
    generation: 1,
    occupation: 'Philanthropist',
    parentIds: [],
    spouses: [{ spouseId: 'hashim-shamsi', order: 1 }],
  },
  'nawab-fakhir-hussain': {
    id: 'nawab-fakhir-hussain',
    firstName: 'Fakhir',
    lastName: 'Hussain',
    gender: 'male',
    birthDate: '04/07/1922',
    deathDate: '18/02/1996',
    isLiving: false,
    generation: 1,
    occupation: 'Land Custodian',
    parentIds: [],
    spouses: [{ spouseId: 'sarwat-ara', order: 1 }],
  },
  'sarwat-ara': {
    id: 'sarwat-ara',
    firstName: 'Sarwat',
    lastName: 'Ara Begum',
    gender: 'female',
    birthDate: '22/10/1927',
    deathDate: '09/01/2009',
    isLiving: false,
    generation: 1,
    parentIds: [],
    spouses: [{ spouseId: 'nawab-fakhir-hussain', order: 1 }],
  },

  // ==========================================
  // GENERATION 2: PARENTS & CORE TEST SUBJECTS
  // ==========================================
  // Test Subject: Anwar Kamal with 2 marriages
  'anwar-kamal': {
    id: 'anwar-kamal',
    firstName: 'Anwar',
    lastName: 'Kamal Shamsi',
    arabicName: 'أنور كمال الشمسي',
    gender: 'male',
    birthDate: '20/08/1948',
    birthPlace: 'Karachi',
    isLiving: true,
    generation: 2,
    occupation: 'Senior Structural Engineer & Historian',
    bio: 'Eldest son of Abdul Mannan. Architect of several historic municipal bridges and keeper of the Shamsi archive.',
    avatarColor: '#0369a1',
    parentIds: ['abdul-mannan', 'fatima-begum'],
    fatherId: 'abdul-mannan',
    motherId: 'fatima-begum',
    spouses: [
      {
        spouseId: 'ruhi-kamal',
        marriageDate: '14/06/1974',
        order: 1,
        marriageStatus: 'current',
        notes: 'First marriage; mother of Abdul Ghani',
      },
      {
        spouseId: 'ruhi-fakhir',
        marriageDate: '28/10/1982',
        order: 2,
        marriageStatus: 'current',
        notes: 'Second marriage; mother of Sidra Kamal',
      },
    ],
    tags: ['Core Lineage', 'Multiple Marriages', 'Branch Patriarch'],
  },
  'ruhi-kamal': {
    id: 'ruhi-kamal',
    firstName: 'Ruhi',
    lastName: 'Kamal (First Wife)',
    arabicName: 'روحي كمال',
    gender: 'female',
    birthDate: '11/02/1953',
    birthPlace: 'Hyderabad, Sindh',
    isLiving: true,
    generation: 2,
    occupation: 'Linguist & High School Principal',
    bio: 'First wife of Anwar Kamal. Mother of Abdul Ghani.',
    avatarColor: '#be185d',
    parentIds: [],
    spouses: [
      {
        spouseId: 'anwar-kamal',
        marriageDate: '14/06/1974',
        order: 1,
      },
    ],
    tags: ['First Marriage Branch', 'Branch Matriarch'],
  },
  'ruhi-fakhir': {
    id: 'ruhi-fakhir',
    firstName: 'Ruhi',
    lastName: 'Fakhir (Second Wife)',
    arabicName: 'روحي فاخر',
    gender: 'female',
    birthDate: '05/11/1958',
    birthPlace: 'Lahore',
    isLiving: true,
    generation: 2,
    occupation: 'Classical Musicologist & Author',
    bio: 'Second wife of Anwar Kamal. Daughter of Fakhir Hussain & Sarwat Ara. Mother of Sidra Kamal.',
    avatarColor: '#7c3aed',
    parentIds: ['nawab-fakhir-hussain', 'sarwat-ara'],
    fatherId: 'nawab-fakhir-hussain',
    motherId: 'sarwat-ara',
    spouses: [
      {
        spouseId: 'anwar-kamal',
        marriageDate: '28/10/1982',
        order: 2,
      },
    ],
    tags: ['Second Marriage Branch', 'Branch Matriarch'],
  },

  // Gen 2 Siblings of Anwar Kamal
  'tariq-shamsi': {
    id: 'tariq-shamsi',
    firstName: 'Tariq',
    lastName: 'Shamsi',
    arabicName: 'طارق الشمسي',
    gender: 'male',
    birthDate: '14/04/1951',
    isLiving: true,
    generation: 2,
    occupation: 'Professor of Economics',
    parentIds: ['abdul-mannan', 'fatima-begum'],
    fatherId: 'abdul-mannan',
    motherId: 'fatima-begum',
    spouses: [{ spouseId: 'yasmeen-khan', marriageDate: '09/02/1978', order: 1 }],
    tags: ['Tariq Branch'],
  },
  'yasmeen-khan': {
    id: 'yasmeen-khan',
    firstName: 'Yasmeen',
    lastName: 'Khan',
    gender: 'female',
    birthDate: '18/06/1955',
    isLiving: true,
    generation: 2,
    occupation: 'Pediatrician',
    parentIds: [],
    spouses: [{ spouseId: 'tariq-shamsi', order: 1 }],
  },
  'zubeida-shamsi': {
    id: 'zubeida-shamsi',
    firstName: 'Zubeida',
    lastName: 'Shamsi Ahmed',
    arabicName: 'زبيدة الشمسي',
    gender: 'female',
    birthDate: '29/01/1954',
    isLiving: true,
    generation: 2,
    occupation: 'Dean of Humanities',
    parentIds: ['abdul-mannan', 'fatima-begum'],
    fatherId: 'abdul-mannan',
    motherId: 'fatima-begum',
    spouses: [{ spouseId: 'farooq-ahmed', marriageDate: '12/12/1977', order: 1 }],
    tags: ['Zubeida Branch'],
  },
  'farooq-ahmed': {
    id: 'farooq-ahmed',
    firstName: 'Dr. Farooq',
    lastName: 'Ahmed',
    gender: 'male',
    birthDate: '03/05/1950',
    deathDate: '17/09/2019',
    isLiving: false,
    generation: 2,
    occupation: 'Chief of Surgery',
    parentIds: [],
    spouses: [{ spouseId: 'zubeida-shamsi', order: 1 }],
  },
  'mansoor-shamsi': {
    id: 'mansoor-shamsi',
    firstName: 'Mansoor',
    lastName: 'Shamsi',
    arabicName: 'منصور الشمسي',
    gender: 'male',
    birthDate: '07/10/1958',
    isLiving: true,
    generation: 2,
    occupation: 'Software Pioneer & Executive',
    parentIds: ['abdul-mannan', 'fatima-begum'],
    fatherId: 'abdul-mannan',
    motherId: 'fatima-begum',
    spouses: [{ spouseId: 'nida-parveen', marriageDate: '15/08/1985', order: 1 }],
    tags: ['Mansoor Branch'],
  },
  'nida-parveen': {
    id: 'nida-parveen',
    firstName: 'Nida',
    lastName: 'Parveen',
    gender: 'female',
    birthDate: '19/03/1962',
    isLiving: true,
    generation: 2,
    occupation: 'Botanist & Landscape Designer',
    parentIds: [],
    spouses: [{ spouseId: 'mansoor-shamsi', order: 1 }],
  },
  'khalid-shamsi': {
    id: 'khalid-shamsi',
    firstName: 'Khalid',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '21/06/1944',
    deathDate: '02/10/2014',
    isLiving: false,
    generation: 2,
    occupation: 'Aeronautical Specialist',
    parentIds: ['hashim-shamsi', 'salma-khatun'],
    fatherId: 'hashim-shamsi',
    motherId: 'salma-khatun',
    spouses: [{ spouseId: 'shama-begum', order: 1 }],
  },
  'shama-begum': {
    id: 'shama-begum',
    firstName: 'Shama',
    lastName: 'Begum',
    gender: 'female',
    birthDate: '14/09/1949',
    isLiving: true,
    generation: 2,
    parentIds: [],
    spouses: [{ spouseId: 'khalid-shamsi', order: 1 }],
  },

  // ==========================================
  // GENERATION 3: HALF-SIBLINGS & COUSINS
  // ==========================================
  // Test Subject 1: Abdul Ghani (Son of Anwar Kamal + Ruhi Kamal)
  'abdul-ghani': {
    id: 'abdul-ghani',
    firstName: 'Abdul Ghani',
    lastName: 'Shamsi',
    arabicName: 'عبد الغني الشمسي',
    gender: 'male',
    birthDate: '18/09/1976',
    birthPlace: 'Karachi',
    isLiving: true,
    generation: 3,
    occupation: 'Data Architect & AI Researcher',
    bio: 'Son of Anwar Kamal & Ruhi Kamal. Half-brother of Sidra Kamal. Champion of open genealogical datasets.',
    avatarColor: '#0d9488',
    parentIds: ['anwar-kamal', 'ruhi-kamal'],
    fatherId: 'anwar-kamal',
    motherId: 'ruhi-kamal',
    marriageBranchId: 'ruhi-kamal',
    spouses: [{ spouseId: 'samira-qureshi', marriageDate: '20/07/2003', order: 1 }],
    tags: ['Core Lineage', 'Half-Sibling (Abdul)', 'First Marriage Branch'],
  },
  'samira-qureshi': {
    id: 'samira-qureshi',
    firstName: 'Samira',
    lastName: 'Qureshi Shamsi',
    gender: 'female',
    birthDate: '03/04/1979',
    birthPlace: 'Islamabad',
    isLiving: true,
    generation: 3,
    occupation: 'Clinical Geneticist',
    parentIds: [],
    spouses: [{ spouseId: 'abdul-ghani', order: 1 }],
    tags: ['Spouse'],
  },

  // Test Subject 2: Sidra Kamal (Daughter of Anwar Kamal + Ruhi Fakhir)
  'sidra-kamal': {
    id: 'sidra-kamal',
    firstName: 'Sidra',
    lastName: 'Kamal Hashmi',
    arabicName: 'سدرة كمال',
    gender: 'female',
    birthDate: '29/09/1984',
    birthPlace: 'Lahore',
    isLiving: true,
    generation: 3,
    occupation: 'Urban Environmental Planner',
    bio: 'Daughter of Anwar Kamal & Ruhi Fakhir. Half-sister of Abdul Ghani. Leads sustainable heritage conservation initiatives.',
    avatarColor: '#d97706',
    parentIds: ['anwar-kamal', 'ruhi-fakhir'],
    fatherId: 'anwar-kamal',
    motherId: 'ruhi-fakhir',
    marriageBranchId: 'ruhi-fakhir',
    spouses: [{ spouseId: 'imran-hashmi', marriageDate: '15/11/2009', order: 1 }],
    tags: ['Core Lineage', 'Half-Sibling (Sidra)', 'Second Marriage Branch'],
  },
  'imran-hashmi': {
    id: 'imran-hashmi',
    firstName: 'Imran',
    lastName: 'Hashmi',
    gender: 'male',
    birthDate: '12/12/1981',
    isLiving: true,
    generation: 3,
    occupation: 'Chartered Financial Analyst',
    parentIds: [],
    spouses: [{ spouseId: 'sidra-kamal', order: 1 }],
  },

  // Gen 3 Cousins (Children of Tariq Shamsi & Yasmeen Khan)
  'bilal-shamsi': {
    id: 'bilal-shamsi',
    firstName: 'Bilal',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '05/11/1980',
    isLiving: true,
    generation: 3,
    occupation: 'Renewable Energy Systems Engineer',
    parentIds: ['tariq-shamsi', 'yasmeen-khan'],
    fatherId: 'tariq-shamsi',
    motherId: 'yasmeen-khan',
    spouses: [{ spouseId: 'sana-malik', marriageDate: '10/01/2007', order: 1 }],
    tags: ['Tariq Branch', 'Cousin'],
  },
  'sana-malik': {
    id: 'sana-malik',
    firstName: 'Sana',
    lastName: 'Malik Shamsi',
    gender: 'female',
    birthDate: '23/07/1983',
    isLiving: true,
    generation: 3,
    occupation: 'Architect',
    parentIds: [],
    spouses: [{ spouseId: 'bilal-shamsi', order: 1 }],
  },
  'zainab-shamsi': {
    id: 'zainab-shamsi',
    firstName: 'Zainab',
    lastName: 'Shamsi Raza',
    gender: 'female',
    birthDate: '14/02/1983',
    isLiving: true,
    generation: 3,
    occupation: 'Public Policy Director',
    parentIds: ['tariq-shamsi', 'yasmeen-khan'],
    fatherId: 'tariq-shamsi',
    motherId: 'yasmeen-khan',
    spouses: [{ spouseId: 'ali-raza', marriageDate: '04/08/2008', order: 1 }],
    tags: ['Tariq Branch', 'Cousin'],
  },
  'ali-raza': {
    id: 'ali-raza',
    firstName: 'Ali',
    lastName: 'Raza',
    gender: 'male',
    birthDate: '19/10/1980',
    isLiving: true,
    generation: 3,
    occupation: 'Corporate Attorney',
    parentIds: [],
    spouses: [{ spouseId: 'zainab-shamsi', order: 1 }],
  },
  'omar-shamsi': {
    id: 'omar-shamsi',
    firstName: 'Omar',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '26/08/1987',
    isLiving: true,
    generation: 3,
    occupation: 'Robotics Software Architect',
    parentIds: ['tariq-shamsi', 'yasmeen-khan'],
    fatherId: 'tariq-shamsi',
    motherId: 'yasmeen-khan',
    spouses: [{ spouseId: 'fatima-noor', marriageDate: '18/09/2014', order: 1 }],
    tags: ['Tariq Branch'],
  },
  'fatima-noor': {
    id: 'fatima-noor',
    firstName: 'Fatima',
    lastName: 'Noor Shamsi',
    gender: 'female',
    birthDate: '15/05/1990',
    isLiving: true,
    generation: 3,
    occupation: 'Biochemist',
    parentIds: [],
    spouses: [{ spouseId: 'omar-shamsi', order: 1 }],
  },

  // Gen 3 Cousins (Children of Zubeida Shamsi & Farooq Ahmed)
  'hina-ahmed': {
    id: 'hina-ahmed',
    firstName: 'Hina',
    lastName: 'Ahmed Baig',
    gender: 'female',
    birthDate: '19/03/1980',
    isLiving: true,
    generation: 3,
    occupation: 'Neurologist',
    parentIds: ['farooq-ahmed', 'zubeida-shamsi'],
    fatherId: 'farooq-ahmed',
    motherId: 'zubeida-shamsi',
    spouses: [{ spouseId: 'kamran-baig', marriageDate: '12/04/2006', order: 1 }],
    tags: ['Zubeida Branch'],
  },
  'kamran-baig': {
    id: 'kamran-baig',
    firstName: 'Kamran',
    lastName: 'Baig',
    gender: 'male',
    birthDate: '07/11/1977',
    isLiving: true,
    generation: 3,
    occupation: 'Aerospace Consultant',
    parentIds: [],
    spouses: [{ spouseId: 'hina-ahmed', order: 1 }],
  },
  'farhan-ahmed': {
    id: 'farhan-ahmed',
    firstName: 'Farhan',
    lastName: 'Ahmed',
    gender: 'male',
    birthDate: '11/09/1983',
    isLiving: true,
    generation: 3,
    occupation: 'Fintech Founder',
    parentIds: ['farooq-ahmed', 'zubeida-shamsi'],
    fatherId: 'farooq-ahmed',
    motherId: 'zubeida-shamsi',
    spouses: [{ spouseId: 'mehwish-tariq', marriageDate: '22/02/2011', order: 1 }],
    tags: ['Zubeida Branch'],
  },
  'mehwish-tariq': {
    id: 'mehwish-tariq',
    firstName: 'Mehwish',
    lastName: 'Tariq Ahmed',
    gender: 'female',
    birthDate: '30/01/1986',
    isLiving: true,
    generation: 3,
    occupation: 'Brand Designer',
    parentIds: [],
    spouses: [{ spouseId: 'farhan-ahmed', order: 1 }],
  },
  'rehan-ahmed': {
    id: 'rehan-ahmed',
    firstName: 'Rehan',
    lastName: 'Ahmed',
    gender: 'male',
    birthDate: '04/06/1988',
    isLiving: true,
    generation: 3,
    occupation: 'Documentary Filmmaker',
    parentIds: ['farooq-ahmed', 'zubeida-shamsi'],
    fatherId: 'farooq-ahmed',
    motherId: 'zubeida-shamsi',
    spouses: [{ spouseId: 'zoya-siddiqui', marriageDate: '16/11/2016', order: 1 }],
    tags: ['Zubeida Branch'],
  },
  'zoya-siddiqui': {
    id: 'zoya-siddiqui',
    firstName: 'Zoya',
    lastName: 'Siddiqui Ahmed',
    gender: 'female',
    birthDate: '14/12/1990',
    isLiving: true,
    generation: 3,
    occupation: 'Curator',
    parentIds: [],
    spouses: [{ spouseId: 'rehan-ahmed', order: 1 }],
  },

  // Gen 3 Cousins (Children of Mansoor Shamsi & Nida Parveen)
  'salman-shamsi': {
    id: 'salman-shamsi',
    firstName: 'Salman',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '17/04/1988',
    isLiving: true,
    generation: 3,
    occupation: 'Hardware Engineer',
    parentIds: ['mansoor-shamsi', 'nida-parveen'],
    fatherId: 'mansoor-shamsi',
    motherId: 'nida-parveen',
    spouses: [{ spouseId: 'bushra-azam', marriageDate: '08/08/2015', order: 1 }],
    tags: ['Mansoor Branch'],
  },
  'bushra-azam': {
    id: 'bushra-azam',
    firstName: 'Bushra',
    lastName: 'Azam Shamsi',
    gender: 'female',
    birthDate: '22/08/1991',
    isLiving: true,
    generation: 3,
    occupation: 'Biomedical Researcher',
    parentIds: [],
    spouses: [{ spouseId: 'salman-shamsi', order: 1 }],
  },
  'ayesha-shamsi': {
    id: 'ayesha-shamsi',
    firstName: 'Ayesha',
    lastName: 'Shamsi Mirza',
    gender: 'female',
    birthDate: '09/10/1991',
    isLiving: true,
    generation: 3,
    occupation: 'Psychologist',
    parentIds: ['mansoor-shamsi', 'nida-parveen'],
    fatherId: 'mansoor-shamsi',
    motherId: 'nida-parveen',
    spouses: [{ spouseId: 'fahad-mirza', marriageDate: '19/12/2018', order: 1 }],
    tags: ['Mansoor Branch'],
  },
  'fahad-mirza': {
    id: 'fahad-mirza',
    firstName: 'Fahad',
    lastName: 'Mirza',
    gender: 'male',
    birthDate: '01/03/1989',
    isLiving: true,
    generation: 3,
    occupation: 'Venture Analyst',
    parentIds: [],
    spouses: [{ spouseId: 'ayesha-shamsi', order: 1 }],
  },
  'hamza-shamsi': {
    id: 'hamza-shamsi',
    firstName: 'Hamza',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '25/07/1995',
    isLiving: true,
    generation: 3,
    occupation: 'AI Application Engineer',
    parentIds: ['mansoor-shamsi', 'nida-parveen'],
    fatherId: 'mansoor-shamsi',
    motherId: 'nida-parveen',
    spouses: [{ spouseId: 'rabia-usman', marriageDate: '05/01/2022', order: 1 }],
    tags: ['Mansoor Branch'],
  },
  'rabia-usman': {
    id: 'rabia-usman',
    firstName: 'Rabia',
    lastName: 'Usman Shamsi',
    gender: 'female',
    birthDate: '19/11/1997',
    isLiving: true,
    generation: 3,
    occupation: 'Teacher',
    parentIds: [],
    spouses: [{ spouseId: 'hamza-shamsi', order: 1 }],
  },

  // Khalid's branch (Gen 3)
  'nadeem-shamsi': {
    id: 'nadeem-shamsi',
    firstName: 'Nadeem',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '10/05/1975',
    isLiving: true,
    generation: 3,
    occupation: 'Airline Captain',
    parentIds: ['khalid-shamsi', 'shama-begum'],
    spouses: [{ spouseId: 'seema-aziz', order: 1 }],
  },
  'seema-aziz': {
    id: 'seema-aziz',
    firstName: 'Seema',
    lastName: 'Aziz',
    gender: 'female',
    birthDate: '12/08/1978',
    isLiving: true,
    generation: 3,
    parentIds: [],
    spouses: [{ spouseId: 'nadeem-shamsi', order: 1 }],
  },

  // ==========================================
  // GENERATION 4: GRANDCHILDREN
  // ==========================================
  // Children of Abdul Ghani & Samira Qureshi (Grandchildren of Anwar Kamal & Ruhi Kamal)
  'daniyal-shamsi': {
    id: 'daniyal-shamsi',
    firstName: 'Daniyal',
    lastName: 'Shamsi',
    arabicName: 'دانيال الشمسي',
    gender: 'male',
    birthDate: '14/09/2005',
    isLiving: true,
    generation: 4,
    occupation: 'Aerospace Engineering Student',
    parentIds: ['abdul-ghani', 'samira-qureshi'],
    fatherId: 'abdul-ghani',
    motherId: 'samira-qureshi',
    spouses: [],
    tags: ['Core Lineage', 'Abdul Ghani Branch'],
  },
  'mahnoor-shamsi': {
    id: 'mahnoor-shamsi',
    firstName: 'Mahnoor',
    lastName: 'Shamsi',
    arabicName: 'ماهنور الشمسي',
    gender: 'female',
    birthDate: '02/11/2008',
    isLiving: true,
    generation: 4,
    occupation: 'Student & Youth Astronomer',
    parentIds: ['abdul-ghani', 'samira-qureshi'],
    fatherId: 'abdul-ghani',
    motherId: 'samira-qureshi',
    spouses: [],
    tags: ['Core Lineage', 'Abdul Ghani Branch'],
  },
  'ayaan-shamsi': {
    id: 'ayaan-shamsi',
    firstName: 'Ayaan',
    lastName: 'Shamsi',
    arabicName: 'عيان الشمسي',
    gender: 'male',
    birthDate: '18/06/2012',
    isLiving: true,
    generation: 4,
    occupation: 'Student',
    parentIds: ['abdul-ghani', 'samira-qureshi'],
    fatherId: 'abdul-ghani',
    motherId: 'samira-qureshi',
    spouses: [],
    tags: ['Core Lineage', 'Abdul Ghani Branch'],
  },

  // Children of Sidra Kamal & Imran Hashmi (Grandchildren of Anwar Kamal & Ruhi Fakhir)
  'zayd-hashmi': {
    id: 'zayd-hashmi',
    firstName: 'Zayd',
    lastName: 'Hashmi',
    arabicName: 'زيد هاشمي',
    gender: 'male',
    birthDate: '07/04/2011',
    isLiving: true,
    generation: 4,
    occupation: 'Student & Junior Fencer',
    parentIds: ['imran-hashmi', 'sidra-kamal'],
    fatherId: 'imran-hashmi',
    motherId: 'sidra-kamal',
    spouses: [],
    tags: ['Core Lineage', 'Sidra Kamal Branch'],
  },
  'layla-hashmi': {
    id: 'layla-hashmi',
    firstName: 'Layla',
    lastName: 'Hashmi',
    arabicName: 'ليلى هاشمي',
    gender: 'female',
    birthDate: '21/08/2015',
    isLiving: true,
    generation: 4,
    occupation: 'Student',
    parentIds: ['imran-hashmi', 'sidra-kamal'],
    fatherId: 'imran-hashmi',
    motherId: 'sidra-kamal',
    spouses: [],
    tags: ['Core Lineage', 'Sidra Kamal Branch'],
  },

  // Children of Bilal Shamsi & Sana Malik
  'yusuf-shamsi': {
    id: 'yusuf-shamsi',
    firstName: 'Yusuf',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '12/10/2009',
    isLiving: true,
    generation: 4,
    parentIds: ['bilal-shamsi', 'sana-malik'],
    fatherId: 'bilal-shamsi',
    motherId: 'sana-malik',
    spouses: [],
    tags: ['Tariq Branch'],
  },
  'maryam-shamsi': {
    id: 'maryam-shamsi',
    firstName: 'Maryam',
    lastName: 'Shamsi',
    gender: 'female',
    birthDate: '04/05/2013',
    isLiving: true,
    generation: 4,
    parentIds: ['bilal-shamsi', 'sana-malik'],
    fatherId: 'bilal-shamsi',
    motherId: 'sana-malik',
    spouses: [],
    tags: ['Tariq Branch'],
  },

  // Children of Zainab Shamsi & Ali Raza
  'zara-raza': {
    id: 'zara-raza',
    firstName: 'Zara',
    lastName: 'Raza',
    gender: 'female',
    birthDate: '16/09/2011',
    isLiving: true,
    generation: 4,
    parentIds: ['ali-raza', 'zainab-shamsi'],
    fatherId: 'ali-raza',
    motherId: 'zainab-shamsi',
    spouses: [],
    tags: ['Tariq Branch'],
  },
  'ibrahim-raza': {
    id: 'ibrahim-raza',
    firstName: 'Ibrahim',
    lastName: 'Raza',
    gender: 'male',
    birthDate: '09/01/2016',
    isLiving: true,
    generation: 4,
    parentIds: ['ali-raza', 'zainab-shamsi'],
    fatherId: 'ali-raza',
    motherId: 'zainab-shamsi',
    spouses: [],
    tags: ['Tariq Branch'],
  },

  // Children of Omar Shamsi & Fatima Noor
  'mustafa-shamsi': {
    id: 'mustafa-shamsi',
    firstName: 'Mustafa',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '28/03/2017',
    isLiving: true,
    generation: 4,
    parentIds: ['omar-shamsi', 'fatima-noor'],
    fatherId: 'omar-shamsi',
    motherId: 'fatima-noor',
    spouses: [],
    tags: ['Tariq Branch'],
  },
  'sarah-shamsi': {
    id: 'sarah-shamsi',
    firstName: 'Sarah',
    lastName: 'Shamsi',
    gender: 'female',
    birthDate: '11/11/2020',
    isLiving: true,
    generation: 4,
    parentIds: ['omar-shamsi', 'fatima-noor'],
    fatherId: 'omar-shamsi',
    motherId: 'fatima-noor',
    spouses: [],
    tags: ['Tariq Branch'],
  },

  // Children of Hina Ahmed & Kamran Baig
  'eshal-baig': {
    id: 'eshal-baig',
    firstName: 'Eshal',
    lastName: 'Baig',
    gender: 'female',
    birthDate: '14/06/2008',
    isLiving: true,
    generation: 4,
    parentIds: ['kamran-baig', 'hina-ahmed'],
    fatherId: 'kamran-baig',
    motherId: 'hina-ahmed',
    spouses: [],
    tags: ['Zubeida Branch'],
  },
  'rayan-baig': {
    id: 'rayan-baig',
    firstName: 'Rayan',
    lastName: 'Baig',
    gender: 'male',
    birthDate: '23/02/2012',
    isLiving: true,
    generation: 4,
    parentIds: ['kamran-baig', 'hina-ahmed'],
    fatherId: 'kamran-baig',
    motherId: 'hina-ahmed',
    spouses: [],
    tags: ['Zubeida Branch'],
  },

  // Children of Farhan Ahmed & Mehwish Tariq
  'arham-ahmed': {
    id: 'arham-ahmed',
    firstName: 'Arham',
    lastName: 'Ahmed',
    gender: 'male',
    birthDate: '19/10/2013',
    isLiving: true,
    generation: 4,
    parentIds: ['farhan-ahmed', 'mehwish-tariq'],
    fatherId: 'farhan-ahmed',
    motherId: 'mehwish-tariq',
    spouses: [],
    tags: ['Zubeida Branch'],
  },
  'anaya-ahmed': {
    id: 'anaya-ahmed',
    firstName: 'Anaya',
    lastName: 'Ahmed',
    gender: 'female',
    birthDate: '05/04/2017',
    isLiving: true,
    generation: 4,
    parentIds: ['farhan-ahmed', 'mehwish-tariq'],
    fatherId: 'farhan-ahmed',
    motherId: 'mehwish-tariq',
    spouses: [],
    tags: ['Zubeida Branch'],
  },

  // Children of Rehan Ahmed & Zoya Siddiqui
  'rohaan-ahmed': {
    id: 'rohaan-ahmed',
    firstName: 'Rohaan',
    lastName: 'Ahmed',
    gender: 'male',
    birthDate: '27/07/2018',
    isLiving: true,
    generation: 4,
    parentIds: ['rehan-ahmed', 'zoya-siddiqui'],
    fatherId: 'rehan-ahmed',
    motherId: 'zoya-siddiqui',
    spouses: [],
    tags: ['Zubeida Branch'],
  },
  'mirha-ahmed': {
    id: 'mirha-ahmed',
    firstName: 'Mirha',
    lastName: 'Ahmed',
    gender: 'female',
    birthDate: '14/12/2021',
    isLiving: true,
    generation: 4,
    parentIds: ['rehan-ahmed', 'zoya-siddiqui'],
    fatherId: 'rehan-ahmed',
    motherId: 'zoya-siddiqui',
    spouses: [],
    tags: ['Zubeida Branch'],
  },

  // Children of Salman Shamsi & Bushra Azam
  'shayan-shamsi': {
    id: 'shayan-shamsi',
    firstName: 'Shayan',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '16/06/2017',
    isLiving: true,
    generation: 4,
    parentIds: ['salman-shamsi', 'bushra-azam'],
    fatherId: 'salman-shamsi',
    motherId: 'bushra-azam',
    spouses: [],
    tags: ['Mansoor Branch'],
  },
  'dua-shamsi': {
    id: 'dua-shamsi',
    firstName: 'Dua',
    lastName: 'Shamsi',
    gender: 'female',
    birthDate: '29/03/2020',
    isLiving: true,
    generation: 4,
    parentIds: ['salman-shamsi', 'bushra-azam'],
    fatherId: 'salman-shamsi',
    motherId: 'bushra-azam',
    spouses: [],
    tags: ['Mansoor Branch'],
  },

  // Children of Ayesha Shamsi & Fahad Mirza
  'mikail-mirza': {
    id: 'mikail-mirza',
    firstName: 'Mikail',
    lastName: 'Mirza',
    gender: 'male',
    birthDate: '18/11/2020',
    isLiving: true,
    generation: 4,
    parentIds: ['fahad-mirza', 'ayesha-shamsi'],
    fatherId: 'fahad-mirza',
    motherId: 'ayesha-shamsi',
    spouses: [],
    tags: ['Mansoor Branch'],
  },
  'inaya-mirza': {
    id: 'inaya-mirza',
    firstName: 'Inaya',
    lastName: 'Mirza',
    gender: 'female',
    birthDate: '06/08/2023',
    isLiving: true,
    generation: 4,
    parentIds: ['fahad-mirza', 'ayesha-shamsi'],
    fatherId: 'fahad-mirza',
    motherId: 'ayesha-shamsi',
    spouses: [],
    tags: ['Mansoor Branch'],
  },

  // Children of Hamza Shamsi & Rabia Usman
  'affan-shamsi': {
    id: 'affan-shamsi',
    firstName: 'Affan',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '15/10/2023',
    isLiving: true,
    generation: 4,
    parentIds: ['hamza-shamsi', 'rabia-usman'],
    fatherId: 'hamza-shamsi',
    motherId: 'rabia-usman',
    spouses: [],
    tags: ['Mansoor Branch'],
  },

  // Children of Nadeem Shamsi & Seema Aziz (Khalid branch)
  'kareem-shamsi': {
    id: 'kareem-shamsi',
    firstName: 'Kareem',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '05/01/2004',
    isLiving: true,
    generation: 4,
    parentIds: ['nadeem-shamsi', 'seema-aziz'],
    spouses: [{ spouseId: 'alizeh-khan', marriageDate: '12/10/2025', order: 1 }],
  },
  'alizeh-khan': {
    id: 'alizeh-khan',
    firstName: 'Alizeh',
    lastName: 'Khan Shamsi',
    gender: 'female',
    birthDate: '19/07/2005',
    isLiving: true,
    generation: 4,
    parentIds: [],
    spouses: [{ spouseId: 'kareem-shamsi', order: 1 }],
  },
  'fatima-khalid-grand': {
    id: 'fatima-khalid-grand',
    firstName: 'Fatima',
    lastName: 'Shamsi',
    gender: 'female',
    birthDate: '22/09/2007',
    isLiving: true,
    generation: 4,
    parentIds: ['nadeem-shamsi', 'seema-aziz'],
    spouses: [],
  },

  // ==========================================
  // GENERATION 5: GREAT-GRANDCHILDREN
  // ==========================================
  'tariq-junior': {
    id: 'tariq-junior',
    firstName: 'Tariq Jr.',
    lastName: 'Shamsi',
    gender: 'male',
    birthDate: '14/02/2026',
    isLiving: true,
    generation: 5,
    parentIds: ['kareem-shamsi', 'alizeh-khan'],
    fatherId: 'kareem-shamsi',
    motherId: 'alizeh-khan',
    spouses: [],
    tags: ['Generation 5'],
  },
};

// Expand with extended family members to reach exactly 100 members with rich relationships
const EXTENDED_NAMES: Array<{
  first: string;
  last: string;
  arabic?: string;
  gender: 'male' | 'female';
  gen: number;
  birth: string;
  occ: string;
  parentIdA?: string;
  parentIdB?: string;
  branch: string;
  relType?: 'biological' | 'adopted' | 'foster';
}> = [
  // Adopted & foster representation test
  { first: 'Kamila', last: 'Shamsi', gender: 'female', gen: 4, birth: '10/06/2010', occ: 'Student', parentIdA: 'abdul-ghani', parentIdB: 'samira-qureshi', branch: 'Abdul Ghani Branch', relType: 'adopted' },
  { first: 'Zain', last: 'Hashmi', gender: 'male', gen: 4, birth: '02/09/2016', occ: 'Student', parentIdA: 'imran-hashmi', parentIdB: 'sidra-kamal', branch: 'Sidra Kamal Branch', relType: 'foster' },

  // Additional Hashim branch descendants
  { first: 'Asad', last: 'Shamsi', gender: 'male', gen: 3, birth: '14/03/1979', occ: 'Architectural Surveyor', parentIdA: 'khalid-shamsi', parentIdB: 'shama-begum', branch: 'Hashim Branch' },
  { first: 'Saima', last: 'Javed', gender: 'female', gen: 3, birth: '21/11/1982', occ: 'Accountant', branch: 'Hashim Branch' },
  { first: 'Haris', last: 'Shamsi', gender: 'male', gen: 4, birth: '15/07/2006', occ: 'Computer Science Student', branch: 'Hashim Branch' },
  { first: 'Mina', last: 'Shamsi', gender: 'female', gen: 4, birth: '19/12/2010', occ: 'Student', branch: 'Hashim Branch' },
  { first: 'Danish', last: 'Shamsi', gender: 'male', gen: 4, birth: '04/04/2014', occ: 'Student', branch: 'Hashim Branch' },

  // Matriarch Fatima Begum's extended family (In-law ancestral branch)
  { first: 'Siraj', last: 'ud-Din Beg', gender: 'male', gen: 1, birth: '11/02/1898', occ: 'Court Scribe', branch: 'Delhi Lineage' },
  { first: 'Khadija', last: 'Begum', gender: 'female', gen: 1, birth: '09/08/1904', occ: 'Homemaker', branch: 'Delhi Lineage' },
  { first: 'Bashir', last: 'Ahmed Beg', gender: 'male', gen: 2, birth: '14/05/1928', occ: 'Postal Inspector', branch: 'Delhi Lineage' },
  { first: 'Tahira', last: 'Begum', gender: 'female', gen: 2, birth: '20/10/1932', occ: 'Teacher', branch: 'Delhi Lineage' },
  { first: 'Navid', last: 'Beg', gender: 'male', gen: 3, birth: '17/01/1960', occ: 'Engineer', branch: 'Delhi Lineage' },
  { first: 'Sadia', last: 'Begum', gender: 'female', gen: 3, birth: '25/08/1965', occ: 'Chemist', branch: 'Delhi Lineage' },
  { first: 'Sami', last: 'Beg', gender: 'male', gen: 4, birth: '12/03/1992', occ: 'UX Designer', branch: 'Delhi Lineage' },
  { first: 'Amber', last: 'Beg', gender: 'female', gen: 4, birth: '07/11/1996', occ: 'Journalist', branch: 'Delhi Lineage' },
  { first: 'Naveen', last: 'Beg', gender: 'female', gen: 5, birth: '19/04/2022', occ: 'Infant', branch: 'Delhi Lineage' },

  // Ruhi Fakhir's ancestral and sibling branch
  { first: 'Qasim', last: 'Fakhir', gender: 'male', gen: 2, birth: '18/06/1961', occ: 'Diplomatic Envoy', parentIdA: 'nawab-fakhir-hussain', parentIdB: 'sarwat-ara', branch: 'Fakhir Lineage' },
  { first: 'Shahida', last: 'Fakhir', gender: 'female', gen: 2, birth: '04/02/1965', occ: 'Historian', branch: 'Fakhir Lineage' },
  { first: 'Fawad', last: 'Fakhir', gender: 'male', gen: 3, birth: '29/09/1988', occ: 'Consultant', branch: 'Fakhir Lineage' },
  { first: 'Laila', last: 'Fakhir', gender: 'female', gen: 3, birth: '11/04/1992', occ: 'Graphic Artist', branch: 'Fakhir Lineage' },
  { first: 'Dani', last: 'Fakhir', gender: 'male', gen: 4, birth: '14/10/2019', occ: 'Toddler', branch: 'Fakhir Lineage' },

  // Ruhi Kamal's sibling branch (Hyderabad lineage)
  { first: 'Mirza', last: 'Kamal Baig', gender: 'male', gen: 1, birth: '04/01/1925', occ: 'Professor of Urdu', branch: 'Hyderabad Lineage' },
  { first: 'Amtul', last: 'Zehra', gender: 'female', gen: 1, birth: '16/09/1929', occ: 'Poet', branch: 'Hyderabad Lineage' },
  { first: 'Junaid', last: 'Kamal', gender: 'male', gen: 2, birth: '11/07/1956', occ: 'Agronomist', branch: 'Hyderabad Lineage' },
  { first: 'Rakhshanda', last: 'Kamal', gender: 'female', gen: 2, birth: '08/03/1960', occ: 'Social Worker', branch: 'Hyderabad Lineage' },
  { first: 'Adil', last: 'Kamal', gender: 'male', gen: 3, birth: '22/05/1984', occ: 'Cardiologist', branch: 'Hyderabad Lineage' },
  { first: 'Noreen', last: 'Kamal', gender: 'female', gen: 3, birth: '19/12/1988', occ: 'Lecturer', branch: 'Hyderabad Lineage' },
  { first: 'Ilyas', last: 'Kamal', gender: 'male', gen: 4, birth: '03/06/2014', occ: 'Student', branch: 'Hyderabad Lineage' },
  { first: 'Sobia', last: 'Kamal', gender: 'female', gen: 4, birth: '14/11/2018', occ: 'Child', branch: 'Hyderabad Lineage' },

  // Additional Shamsi generation 4 & 5 youths
  { first: 'Hamid', last: 'Shamsi', gender: 'male', gen: 4, birth: '12/01/2010', occ: 'Student', branch: 'Tariq Branch' },
  { first: 'Nadia', last: 'Shamsi', gender: 'female', gen: 4, birth: '08/08/2014', occ: 'Student', branch: 'Tariq Branch' },
  { first: 'Taimoor', last: 'Ahmed', gender: 'male', gen: 4, birth: '29/04/2016', occ: 'Student', branch: 'Zubeida Branch' },
  { first: 'Kinza', last: 'Ahmed', gender: 'female', gen: 4, birth: '17/10/2019', occ: 'Child', branch: 'Zubeida Branch' },
  { first: 'Adeel', last: 'Shamsi', gender: 'male', gen: 4, birth: '05/02/2015', occ: 'Student', branch: 'Mansoor Branch' },
  { first: 'Rameen', last: 'Shamsi', gender: 'female', gen: 4, birth: '23/09/2021', occ: 'Child', branch: 'Mansoor Branch' },

  // Extended In-Law Families & Cousins
  { first: 'Tariq', last: 'Qureshi', gender: 'male', gen: 2, birth: '19/04/1950', occ: 'Pharmacist', branch: 'Qureshi Branch' },
  { first: 'Nazia', last: 'Qureshi', gender: 'female', gen: 2, birth: '14/11/1954', occ: 'Lecturer', branch: 'Qureshi Branch' },
  { first: 'Waqas', last: 'Qureshi', gender: 'male', gen: 3, birth: '10/01/1982', occ: 'Supply Chain Director', branch: 'Qureshi Branch' },
  { first: 'Huma', last: 'Qureshi', gender: 'female', gen: 3, birth: '02/09/1986', occ: 'Interior Designer', branch: 'Qureshi Branch' },
  { first: 'Arman', last: 'Qureshi', gender: 'male', gen: 4, birth: '16/04/2016', occ: 'Student', branch: 'Qureshi Branch' },
  { first: 'Sehr', last: 'Qureshi', gender: 'female', gen: 4, birth: '20/12/2019', occ: 'Child', branch: 'Qureshi Branch' },

  { first: 'Mahmood', last: 'Hashmi', gender: 'male', gen: 2, birth: '08/03/1952', occ: 'Banker', branch: 'Hashmi Lineage' },
  { first: 'Parveen', last: 'Hashmi', gender: 'female', gen: 2, birth: '12/10/1956', occ: 'Educator', branch: 'Hashmi Lineage' },
  { first: 'Usman', last: 'Hashmi', gender: 'male', gen: 3, birth: '15/05/1985', occ: 'Civil Engineer', branch: 'Hashmi Lineage' },
  { first: 'Amina', last: 'Hashmi', gender: 'female', gen: 3, birth: '23/11/1989', occ: 'Pediatric Dentist', branch: 'Hashmi Lineage' },
  { first: 'Haider', last: 'Hashmi', gender: 'male', gen: 4, birth: '11/08/2018', occ: 'Child', branch: 'Hashmi Lineage' },
  { first: 'Malaika', last: 'Hashmi', gender: 'female', gen: 4, birth: '29/01/2022', occ: 'Toddler', branch: 'Hashmi Lineage' },

  // Young generation 5 babies
  { first: 'Kian', last: 'Shamsi', gender: 'male', gen: 5, birth: '04/05/2024', occ: 'Infant', branch: 'Core Lineage' },
  { first: 'Mehar', last: 'Hashmi', gender: 'female', gen: 5, birth: '18/11/2024', occ: 'Infant', branch: 'Core Lineage' },
  { first: 'Ayla', last: 'Raza', gender: 'female', gen: 5, birth: '09/02/2025', occ: 'Infant', branch: 'Tariq Branch' },
  { first: 'Zorawar', last: 'Ahmed', gender: 'male', gen: 5, birth: '14/06/2025', occ: 'Infant', branch: 'Zubeida Branch' },
  { first: 'Jannat', last: 'Shamsi', gender: 'female', gen: 5, birth: '01/01/2026', occ: 'Newborn', branch: 'Mansoor Branch' },
];

// Populate up to exactly 100 members
let count = Object.keys(SAMPLE_MEMBERS).length;
EXTENDED_NAMES.forEach((item, index) => {
  if (count >= 100) return;
  const id = `member-ext-${index + 1}-${item.first.toLowerCase()}`;
  SAMPLE_MEMBERS[id] = {
    id,
    firstName: item.first,
    lastName: item.last,
    arabicName: item.arabic,
    gender: item.gender,
    birthDate: item.birth,
    isLiving: true,
    generation: item.gen,
    occupation: item.occ,
    parentIds: [item.parentIdA, item.parentIdB].filter(Boolean) as string[],
    fatherId: item.parentIdA,
    motherId: item.parentIdB,
    relationshipType: item.relType || 'biological',
    spouses: [],
    tags: [item.branch, `Gen ${item.gen}`],
    bio: `${item.first} ${item.last} is a valued member of the ${item.branch}.`,
  };
  count++;
});

// Ensure exactly 100 entries if needed
let extIndex = 1;
while (Object.keys(SAMPLE_MEMBERS).length < 100) {
  const id = `extra-member-${extIndex}`;
  SAMPLE_MEMBERS[id] = {
    id,
    firstName: `Family Member`,
    lastName: `#${extIndex + 85}`,
    gender: extIndex % 2 === 0 ? 'female' : 'male',
    birthDate: `12/04/${1980 + (extIndex % 30)}`,
    isLiving: true,
    generation: 4,
    occupation: 'Member of Extended Kinship',
    parentIds: ['bilal-shamsi', 'sana-malik'],
    spouses: [],
    tags: ['Extended Kinship'],
  };
  extIndex++;
}

/**
 * Return exactly 50 core family members for the demonstration mode:
 * "demonstrate the Customize My Tree panel using 100 sample members, where I can select exactly 50."
 */
export function getCore50MemberIds(): string[] {
  // Take 50 key members spanning Generations 1 through 4 including Abdul Mannan, Anwar Kamal, both wives,
  // Abdul Ghani, Sidra Kamal, their siblings, children, and key ancestors
  const keyIds = [
    'abdul-mannan',
    'fatima-begum',
    'hashim-shamsi',
    'salma-khatun',
    'nawab-fakhir-hussain',
    'sarwat-ara',
    // Gen 2
    'anwar-kamal',
    'ruhi-kamal',
    'ruhi-fakhir',
    'tariq-shamsi',
    'yasmeen-khan',
    'zubeida-shamsi',
    'farooq-ahmed',
    'mansoor-shamsi',
    'nida-parveen',
    'khalid-shamsi',
    'shama-begum',
    // Gen 3
    'abdul-ghani',
    'samira-qureshi',
    'sidra-kamal',
    'imran-hashmi',
    'bilal-shamsi',
    'sana-malik',
    'zainab-shamsi',
    'ali-raza',
    'omar-shamsi',
    'fatima-noor',
    'hina-ahmed',
    'kamran-baig',
    'farhan-ahmed',
    'mehwish-tariq',
    'rehan-ahmed',
    'zoya-siddiqui',
    'salman-shamsi',
    'bushra-azam',
    'ayesha-shamsi',
    'fahad-mirza',
    'hamza-shamsi',
    'rabia-usman',
    'nadeem-shamsi',
    'seema-aziz',
    // Gen 4
    'daniyal-shamsi',
    'mahnoor-shamsi',
    'ayaan-shamsi',
    'zayd-hashmi',
    'layla-hashmi',
    'yusuf-shamsi',
    'maryam-shamsi',
    'zara-raza',
    'ibrahim-raza',
  ];

  // Fill up to exactly 50 from SAMPLE_MEMBERS
  const result = new Set<string>(keyIds);
  const allKeys = Object.keys(SAMPLE_MEMBERS);
  for (const k of allKeys) {
    if (result.size >= 50) break;
    result.add(k);
  }
  return Array.from(result);
}

/**
 * Ancestor lookup helper
 */
export function getAncestorIds(startPersonId: string, members: Record<string, Person>): Set<string> {
  const ancestors = new Set<string>();
  const queue = [startPersonId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const person = members[currentId];
    if (!person) continue;

    for (const pId of person.parentIds) {
      if (!ancestors.has(pId)) {
        ancestors.add(pId);
        queue.push(pId);
      }
    }
  }

  return ancestors;
}

/**
 * Descendant lookup helper
 */
export function getDescendantIds(
  startPersonId: string,
  members: Record<string, Person>,
  maxDepth: number = 99
): Set<string> {
  const descendants = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: startPersonId, depth: 0 }];

  // Pre-index children
  const childrenMap: Record<string, string[]> = {};
  for (const p of Object.values(members)) {
    for (const parentId of p.parentIds) {
      if (!childrenMap[parentId]) childrenMap[parentId] = [];
      childrenMap[parentId].push(p.id);
    }
  }

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (depth >= maxDepth) continue;

    const children = childrenMap[id] || [];
    for (const childId of children) {
      if (!descendants.has(childId)) {
        descendants.add(childId);
        queue.push({ id: childId, depth: depth + 1 });
      }
    }
  }

  return descendants;
}

/**
 * Lineage path between two persons
 */
export function getLineagePath(
  startPersonId: string,
  endPersonId: string,
  members: Record<string, Person>
): string[] {
  if (startPersonId === endPersonId) return [startPersonId];

  // Bidirectional or BFS search along parent/child links
  const adj: Record<string, string[]> = {};
  for (const p of Object.values(members)) {
    if (!adj[p.id]) adj[p.id] = [];
    for (const parentId of p.parentIds) {
      adj[p.id].push(parentId);
      if (!adj[parentId]) adj[parentId] = [];
      adj[parentId].push(p.id);
    }
    for (const sp of p.spouses) {
      adj[p.id].push(sp.spouseId);
      if (!adj[sp.spouseId]) adj[sp.spouseId] = [];
      adj[sp.spouseId].push(p.id);
    }
  }

  const queue: string[][] = [[startPersonId]];
  const visited = new Set<string>([startPersonId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const lastNode = path[path.length - 1];

    if (lastNode === endPersonId) {
      return path;
    }

    const neighbors = adj[lastNode] || [];
    for (const n of neighbors) {
      if (!visited.has(n)) {
        visited.add(n);
        queue.push([...path, n]);
      }
    }
  }

  return [];
}
