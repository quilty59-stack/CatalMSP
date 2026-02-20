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

export function useSiteMsps(siteId: string | undefined) {
  const [site, setSite] = useState<SiteConventionne | null>(null);
  const [msps, setMsps] = useState<MspSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId) {
      setIsLoading(false);
      return;
    }
    loadData();
  }, [siteId]);

  const loadData = async () => {
    if (!siteId) return;
    try {
      const [siteRes, mspRes] = await Promise.all([
        supabase.from('sites_conventionnes').select('*').eq('id', siteId).single(),
        supabase.from('msp').select('id, slug, title, theme, status, site_conventionne_id, updated_at')
          .eq('site_conventionne_id', siteId)
          .order('updated_at', { ascending: false }),
      ]);

      if (siteRes.error) throw siteRes.error;
      if (mspRes.error) throw mspRes.error;

      setSite(transformDbToSite(siteRes.data));
      setMsps(
        (mspRes.data || []).map((row) => ({
          id: row.id,
          slug: row.slug,
          title: row.title,
          theme: row.theme,
          status: row.status,
          siteConventionneId: row.site_conventionne_id!,
          updatedAt: row.updated_at,
        }))
      );
    } catch (err: any) {
      console.error('Error loading site msps:', err);
      setError(err.message || 'Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  return { site, msps, isLoading, error };
}
