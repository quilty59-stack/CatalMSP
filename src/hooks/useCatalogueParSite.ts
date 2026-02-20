import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SiteConventionne, transformDbToSite } from '@/types/site';

interface MspSummary {
  id: string;
  slug: string;
  title: string;
  theme: string;
  status: string;
  siteConventionneId: string;
  updatedAt: string;
}

export function useCatalogueParSite() {
  const [sites, setSites] = useState<SiteConventionne[]>([]);
  const [mspBySite, setMspBySite] = useState<Record<string, MspSummary[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Parallel queries
      const [sitesRes, mspRes] = await Promise.all([
        supabase.from('sites_conventionnes').select('*').order('name'),
        supabase.from('msp').select('id, slug, title, theme, status, site_conventionne_id, updated_at')
          .not('site_conventionne_id', 'is', null),
      ]);

      if (sitesRes.error) throw sitesRes.error;
      if (mspRes.error) throw mspRes.error;

      setSites((sitesRes.data || []).map(transformDbToSite));

      const grouped: Record<string, MspSummary[]> = {};
      for (const row of mspRes.data || []) {
        const siteId = row.site_conventionne_id!;
        if (!grouped[siteId]) grouped[siteId] = [];
        grouped[siteId].push({
          id: row.id,
          slug: row.slug,
          title: row.title,
          theme: row.theme,
          status: row.status,
          siteConventionneId: siteId,
          updatedAt: row.updated_at,
        });
      }
      setMspBySite(grouped);
    } catch (err: any) {
      console.error('Error loading catalogue par site:', err);
      setError(err.message || 'Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  return { sites, mspBySite, isLoading, error };
}
