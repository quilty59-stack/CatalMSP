export interface SiteConventionne {
  id: string;
  slug: string;
  name: string;
  siteType: string;
  address: string;
  commune: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
  contactPhoneLandline?: string;
  contactEmail?: string;
  authorizedManeuvers: string[];
  unauthorizedManeuvers: string[];
  notes?: string;
  photoUrl?: string;
  conventionNotes?: string;
  accessKeys?: string;
  recurrence?: string;
  specificModalities?: string;
  conventionSignedAt?: string;
  conventionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const MANEUVER_TYPES = [
  'Incendie',
  'Secours',
  'Risques chimiques',
  'Risques industriels',
  'Sauvetage',
  'Formation initiale',
  'Formation continue',
];

export const DEFAULT_UNAUTHORIZED_MANEUVERS = [
  'Pas de feu réel',
  'Pas d\'eau',
];

export const transformDbToSite = (record: any): SiteConventionne => ({
  id: record.id,
  slug: record.slug,
  name: record.name,
  siteType: record.site_type,
  address: record.address,
  commune: record.commune,
  postalCode: record.postal_code,
  latitude: record.latitude ? Number(record.latitude) : undefined,
  longitude: record.longitude ? Number(record.longitude) : undefined,
  contactName: record.contact_name,
  contactPhone: record.contact_phone,
  contactPhoneLandline: record.contact_phone_landline,
  contactEmail: record.contact_email,
  authorizedManeuvers: record.authorized_maneuvers || [],
  unauthorizedManeuvers: record.unauthorized_maneuvers || DEFAULT_UNAUTHORIZED_MANEUVERS,
  notes: record.notes,
  photoUrl: record.photo_url,
  conventionNotes: record.convention_notes,
  accessKeys: record.access_keys,
  recurrence: record.recurrence,
  specificModalities: record.specific_modalities,
  conventionSignedAt: record.convention_signed_at,
  conventionExpiresAt: record.convention_expires_at,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});
