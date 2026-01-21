import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SiteConventionne, transformDbToSite } from '@/types/site';

export function useSites() {
  const [sites, setSites] = useState<SiteConventionne[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites_conventionnes')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading sites:', error);
        setError(error.message);
        return;
      }

      if (data) {
        setSites(data.map(transformDbToSite));
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  return { sites, isLoading, error, refetch: loadSites };
}

export function useSite(slug: string | undefined) {
  const [site, setSite] = useState<SiteConventionne | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    loadSite();
  }, [slug]);

  const loadSite = async () => {
    if (!slug) return;
    
    try {
      const { data, error } = await supabase
        .from('sites_conventionnes')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error loading site:', error);
        setError(error.message);
        return;
      }

      if (data) {
        setSite(transformDbToSite(data));
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  return { site, isLoading, error, refetch: loadSite };
}

export function useSitesByCommune(commune: string) {
  const [sites, setSites] = useState<SiteConventionne[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!commune || commune.length < 2) {
      setSites([]);
      return;
    }

    loadSitesByCommune();
  }, [commune]);

  const loadSitesByCommune = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sites_conventionnes')
        .select('*')
        .ilike('commune', `%${commune}%`)
        .limit(5);

      if (error) {
        console.error('Error loading sites by commune:', error);
        return;
      }

      if (data) {
        setSites(data.map(transformDbToSite));
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { sites, isLoading };
}
