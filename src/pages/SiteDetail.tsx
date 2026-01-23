import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useSite } from '@/hooks/useSites';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapEmbed } from '@/components/MapEmbed';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Clock, 
  Calendar,
  FileText,
  ExternalLink,
  Edit,
  Loader2,
  AlertTriangle,
  Download
} from 'lucide-react';
import { SITE_TYPES } from '@/types/msp';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { MSP, Theme, Status } from '@/types/msp';
import { MSPCard } from '@/components/MSPCard';
import { SiteContactPDF } from '@/components/SiteContactPDF';
import { useGenerateSitePDF } from '@/hooks/useGenerateSitePDF';
import { toast } from 'sonner';

export default function SiteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { site, isLoading, error } = useSite(slug);
  const [linkedMsps, setLinkedMsps] = useState<MSP[]>([]);
  const [loadingMsps, setLoadingMsps] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { contentRef, generatePDF, mapImageBase64 } = useGenerateSitePDF();

  const handleDownloadPDF = async () => {
    if (!site) return;
    
    setIsGeneratingPDF(true);
    try {
      await generatePDF(site);
      toast.success('Fiche contact téléchargée');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Load MSPs linked to this site (by commune matching)
  useEffect(() => {
    if (!site) return;

    const loadLinkedMsps = async () => {
      setLoadingMsps(true);
      try {
        // Get MSPs that match this site's commune
        const { data, error } = await supabase
          .from('msp')
          .select('*')
          .ilike('commune', `%${site.commune}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error loading linked MSPs:', error);
          return;
        }

        if (data) {
          const transformed: MSP[] = data.map((record) => ({
            id: record.id,
            slug: record.slug,
            title: record.title,
            theme: record.theme as Theme,
            status: record.status as Status,
            difficulty: record.difficulty as 1 | 2 | 3,
            siteName: record.site_name,
            siteType: record.site_type as any,
            commune: record.commune,
            address: record.address || '',
            mapsLink: record.maps_link || '',
            siteNotes: record.site_notes || '',
            competences: record.competences || '',
            objectives: record.objectives || '',
            situation: record.situation || '',
            missionReason: record.mission_reason || '',
            difficultyFacilitator: record.difficulty_facilitator || '',
            difficultyInitial: record.difficulty_initial || '',
            difficultyComplex: record.difficulty_complex || '',
            instructions: record.instructions || '',
            expectedActivities: record.expected_activities || '',
            cognitiveEffects: record.cognitive_effects || '',
            reservationDetails: record.reservation_details || '',
            hasWaterPoint: record.has_water_point || false,
            waterPointDetails: record.water_point_details || '',
            authorizations: record.authorizations || '',
            constraints: record.constraints || '',
            safetyBriefing: record.safety_briefing || '',
            equipment: record.equipment || [],
            otherEquipment: record.other_equipment || '',
            photos: [],
            createdAt: record.created_at,
            updatedAt: record.updated_at,
          }));
          setLinkedMsps(transformed);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoadingMsps(false);
      }
    };

    loadLinkedMsps();
  }, [site]);

  const isConventionExpired = site?.conventionExpiresAt 
    ? new Date(site.conventionExpiresAt) < new Date() 
    : false;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !site) {
    return (
      <Layout>
        <div className="px-4 py-8 text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Site non trouvé</h1>
          <p className="text-muted-foreground mb-4">
            Ce site n'existe pas ou a été supprimé.
          </p>
          <Link to="/sites">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour aux sites
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-4 space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/sites">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              PDF
            </Button>
            <Link to={`/sites/${slug}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="w-4 h-4" />
                Modifier
              </Button>
            </Link>
          </div>
        </div>

        {/* Hidden PDF Content for generation */}
        <div className="fixed left-[-9999px] top-0">
          <SiteContactPDF ref={contentRef} site={site} mapImageBase64={mapImageBase64} />
        </div>

        {/* Site Header with Map */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            {/* Photo and Info */}
            <div className="flex gap-4">
              {site.photoUrl ? (
                <img 
                  src={site.photoUrl}
                  alt={site.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground">{site.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{site.commune}</span>
                </div>
                <Badge variant="secondary" className="mt-2">
                  {SITE_TYPES[site.siteType as keyof typeof SITE_TYPES] || site.siteType}
                </Badge>
              </div>
            </div>

            {/* Address */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Adresse</p>
                    <p className="text-sm text-muted-foreground">{site.address}</p>
                    {site.postalCode && (
                      <p className="text-sm text-muted-foreground">{site.postalCode} {site.commune}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Convention Status */}
            {(site.conventionSignedAt || site.conventionExpiresAt) && (
              <Card className={isConventionExpired ? 'border-destructive' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {isConventionExpired ? (
                      <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                    ) : (
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">
                        Convention
                        {isConventionExpired && (
                          <Badge variant="destructive">Expirée</Badge>
                        )}
                      </p>
                      {site.conventionSignedAt && (
                        <p className="text-sm text-muted-foreground">
                          Signée le {formatDate(site.conventionSignedAt)}
                        </p>
                      )}
                      {site.conventionExpiresAt && (
                        <p className="text-sm text-muted-foreground">
                          {isConventionExpired ? 'Expirée le' : 'Expire le'} {formatDate(site.conventionExpiresAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map */}
          <div className="h-[250px] lg:h-full min-h-[250px]">
            <MapEmbed 
              address={`${site.address}, ${site.commune}`}
              latitude={site.latitude}
              longitude={site.longitude}
              className="h-full rounded-xl"
            />
          </div>
        </div>

        {/* Domains */}
        {site.domains.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Domaines d'activité</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {site.domains.map((domain) => (
                  <Badge key={domain} variant="secondary">
                    {domain}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        {(site.contactName || site.contactPhone || site.contactEmail) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {site.contactName && (
                <p className="font-medium text-foreground">{site.contactName}</p>
              )}
              {site.contactPhone && (
                <a 
                  href={`tel:${site.contactPhone}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {site.contactPhone}
                </a>
              )}
              {site.contactEmail && (
                <a 
                  href={`mailto:${site.contactEmail}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {site.contactEmail}
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Opening Hours */}
        {site.openingHours && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horaires d'accès
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {site.openingHours}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {site.notes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {site.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Convention Notes */}
        {site.conventionNotes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes de convention</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {site.conventionNotes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Linked MSPs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              MSP liées ({linkedMsps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingMsps ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : linkedMsps.length > 0 ? (
              <div className="space-y-3">
                {linkedMsps.map((msp, index) => (
                  <MSPCard key={msp.id} msp={msp} index={index} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune MSP liée à ce site pour l'instant
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
