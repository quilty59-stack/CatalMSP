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
  contactEmail?: string;
  domains: string[];
  notes?: string;
  photoUrl?: string;
  conventionNotes?: string;
  openingHours?: string;
  conventionSignedAt?: string;
  conventionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const DOMAINS = [
  'Incendie',
  'Secours',
  'Risques chimiques',
  'Risques industriels',
  'Sauvetage',
  'Formation initiale',
  'Formation continue',
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
  contactEmail: record.contact_email,
  domains: record.domains || [],
  notes: record.notes,
  photoUrl: record.photo_url,
  conventionNotes: record.convention_notes,
  openingHours: record.opening_hours,
  conventionSignedAt: record.convention_signed_at,
  conventionExpiresAt: record.convention_expires_at,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});
