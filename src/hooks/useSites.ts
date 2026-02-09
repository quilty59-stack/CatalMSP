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

// Haversine distance in km between two GPS points
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useSitesByProximity(address: string, commune: string) {
  const [sites, setSites] = useState<SiteConventionne[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchQuery = address || commune;

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSites([]);
      return;
    }

    const timer = setTimeout(() => {
      loadSitesByProximity();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadSitesByProximity = async () => {
    setIsLoading(true);
    try {
      // Load all sites (small dataset)
      const { data, error } = await supabase
        .from('sites_conventionnes')
        .select('*');

      if (error || !data) {
        console.error('Error loading sites:', error);
        setIsLoading(false);
        return;
      }

      const allSites = data.map(transformDbToSite);

      // Try to geocode the search query for proximity sorting
      let userLat: number | null = null;
      let userLon: number | null = null;

      try {
        const geoQuery = address ? `${address}, ${commune}` : commune;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geoQuery)}&limit=1&countrycodes=fr`,
          { headers: { 'Accept': 'application/json' } }
        );
        const geoData = await response.json();
        if (geoData?.length > 0) {
          userLat = parseFloat(geoData[0].lat);
          userLon = parseFloat(geoData[0].lon);
        }
      } catch {
        // Geocoding failed, fall back to text matching
      }

      let sorted: SiteConventionne[];

      if (userLat !== null && userLon !== null) {
        // Sort by GPS distance
        sorted = allSites
          .filter(s => s.latitude && s.longitude)
          .map(s => ({
            site: s,
            distance: haversineDistance(userLat!, userLon!, s.latitude!, s.longitude!)
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5)
          .map(s => s.site);
      } else {
        // Fallback: text matching on commune
        sorted = allSites
          .filter(s => s.commune.toLowerCase().includes(commune.toLowerCase()))
          .slice(0, 5);
      }

      setSites(sorted);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { sites, isLoading };
}

// Keep backward compatibility
export function useSitesByCommune(commune: string) {
  return useSitesByProximity('', commune);
}
