import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalMsp: number;
  validatedMsp: number;
  draftMsp: number;
  totalSites: number;
  isLoading: boolean;
}

export function useDashboardStats(): DashboardStats {
  const [stats, setStats] = useState<DashboardStats>({
    totalMsp: 0,
    validatedMsp: 0,
    draftMsp: 0,
    totalSites: 0,
    isLoading: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load MSP stats
      const { data: mspData, error: mspError } = await supabase
        .from('msp')
        .select('status');

      if (mspError) {
        console.error('Error loading MSP stats:', mspError);
      }

      // Load Sites count
      const { count: sitesCount, error: sitesError } = await supabase
        .from('sites_conventionnes')
        .select('*', { count: 'exact', head: true });

      if (sitesError) {
        console.error('Error loading sites count:', sitesError);
      }

      const totalMsp = mspData?.length || 0;
      const validatedMsp = mspData?.filter(m => m.status === 'validee').length || 0;
      const draftMsp = mspData?.filter(m => m.status === 'brouillon').length || 0;

      setStats({
        totalMsp,
        validatedMsp,
        draftMsp,
        totalSites: sitesCount || 0,
        isLoading: false,
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  return stats;
}
