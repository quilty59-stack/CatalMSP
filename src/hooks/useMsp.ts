import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mockMspData } from '@/data/mockMsp';
import { MSP, Theme, Status, SiteType } from '@/types/msp';

export function useMsp(slug: string | undefined) {
  const [msp, setMsp] = useState<MSP | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const loadMsp = async () => {
      try {
        // First check mock data
        const mockMsp = mockMspData.find((m) => m.slug === slug);
        if (mockMsp) {
          setMsp(mockMsp);
          setIsLoading(false);
          return;
        }

        // Then check database
        const { data, error: dbError } = await supabase
          .from('msp')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (dbError) {
          console.error('Error loading MSP:', dbError);
          setError('Erreur lors du chargement');
          setIsLoading(false);
          return;
        }

        if (data) {
          const transformed: MSP = {
            id: data.id,
            slug: data.slug,
            title: data.title,
            theme: data.theme as Theme,
            status: data.status as Status,
            difficulty: data.difficulty as 1 | 2 | 3,
            siteName: data.site_name,
            siteType: data.site_type as SiteType,
            commune: data.commune,
            address: data.address || '',
            mapsLink: data.maps_link || '',
            siteNotes: data.site_notes || '',
            competences: data.competences || '',
            objectives: data.objectives || '',
            situation: data.situation || '',
            missionReason: data.mission_reason || '',
            difficultyFacilitator: data.difficulty_facilitator || '',
            difficultyInitial: data.difficulty_initial || '',
            difficultyComplex: data.difficulty_complex || '',
            instructions: data.instructions || '',
            expectedActivities: data.expected_activities || '',
            cognitiveEffects: data.cognitive_effects || '',
            reservationDetails: data.reservation_details || '',
            hasWaterPoint: data.has_water_point || false,
            waterPointDetails: data.water_point_details || '',
            authorizations: data.authorizations || '',
            constraints: data.constraints || '',
            safetyBriefing: data.safety_briefing || '',
            equipment: data.equipment || [],
            otherEquipment: data.other_equipment || '',
            photos: [],
            publicUrl: data.public_url || '',
            createdBy: data.created_by || undefined,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
          setMsp(transformed);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Erreur inattendue');
        setIsLoading(false);
      }
    };

    loadMsp();
  }, [slug]);

  return { msp, isLoading, error };
}
