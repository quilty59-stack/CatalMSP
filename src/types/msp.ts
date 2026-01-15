export type SiteType = 'industriel' | 'erp' | 'habitation' | 'chantier' | 'exterieur';
export type Theme = 'incendie' | 'gaz' | 'chimique' | 'secours' | 'autre';
export type Status = 'brouillon' | 'validee' | 'a_ajuster';
export type Difficulty = 1 | 2 | 3;

export interface MSPPhoto {
  id: string;
  mspId: string;
  category: 'site_generale' | 'acces' | 'zones' | 'mannequin' | 'feu' | 'autre_prepa';
  imageUrl: string;
  comment?: string;
}

export interface MSP {
  id: string;
  slug: string;
  title: string;
  theme: Theme;
  status: Status;
  difficulty: Difficulty;
  
  // Site identification
  siteName: string;
  siteType: SiteType;
  commune: string;
  address: string;
  mapsLink?: string;
  siteNotes?: string;
  
  // Pedagogical core
  competences: string;
  objectives: string;
  situation: string;
  missionReason: string;
  
  // Difficulty levels
  difficultyFacilitator?: string;
  difficultyInitial?: string;
  difficultyComplex?: string;
  
  // Instructions
  instructions?: string;
  expectedActivities?: string;
  cognitiveEffects?: string;
  
  // Organization
  reservationDetails?: string;
  hasWaterPoint: boolean;
  waterPointDetails?: string;
  authorizations?: string;
  constraints?: string;
  safetyBriefing?: string;
  
  // Equipment
  equipment: string[];
  otherEquipment?: string;
  
  // Photos
  photos: MSPPhoto[];
  
  // Sharing
  publicUrl?: string;
  qrCodeImage?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const SITE_TYPES: Record<SiteType, string> = {
  industriel: 'Industriel',
  erp: 'ERP',
  habitation: 'Habitation',
  chantier: 'Chantier',
  exterieur: 'Extérieur',
};

export const THEMES: Record<Theme, string> = {
  incendie: 'Incendie',
  gaz: 'Gaz',
  chimique: 'Chimique',
  secours: 'Secours',
  autre: 'Autre',
};

export const STATUSES: Record<Status, string> = {
  brouillon: 'Brouillon',
  validee: 'Validée',
  a_ajuster: 'À ajuster',
};

export const EQUIPMENT_LIST = [
  'ARI',
  'Lampes',
  'Radios',
  'LDV',
  'Ventilation',
  'Mannequin',
  'Fumée',
  'LED feu',
  'Extincteur',
  'Brancard',
];
