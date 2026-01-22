import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  SiteType, 
  SITE_TYPES, 
} from '@/types/msp';
import { DOMAINS } from '@/types/site';
import { 
  ArrowLeft,
  Camera,
  MapPin, 
  Building2,
  Loader2,
  Navigation,
  Save,
  Phone,
  Mail,
  User,
  Clock,
  FileText,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MultiPhotoUpload, UploadedPhoto } from '@/components/MultiPhotoUpload';

export default function CreateSite() {
  const navigate = useNavigate();
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    siteType: '' as SiteType | '',
    address: '',
    commune: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    domains: [] as string[],
    openingHours: '',
    notes: '',
    conventionNotes: '',
    conventionSignedAt: '',
    conventionExpiresAt: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter(d => d !== domain)
        : [...prev.domains, domain]
    }));
  };


  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      toast.error('La géolocalisation n\'est pas supportée');
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        updateField('latitude', latitude.toString());
        updateField('longitude', longitude.toString());
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'fr' } }
          );
          const data = await response.json();
          
          if (data.address) {
            const addr = data.address;
            const addressParts = [
              addr.house_number,
              addr.road,
            ].filter(Boolean);
            
            updateField('address', addressParts.join(' '));
            updateField('commune', addr.city || addr.town || addr.village || addr.municipality || '');
            updateField('postalCode', addr.postcode || '');
          }
          
          toast.success('Position localisée !');
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.success('Coordonnées récupérées');
        }
        
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Impossible d\'obtenir votre position');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const canSave = () => {
    return formData.name && formData.siteType && formData.commune && formData.address;
  };

  const handleSave = async () => {
    if (!canSave()) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setIsSaving(true);
    
    try {
      // Generate slug
      const slug = `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

      // Upload photos if present
      let photoUrl = null;
      if (photos.length > 0) {
        // Upload first photo as main photo
        const firstPhoto = photos[0];
        const fileExt = firstPhoto.file.name.split('.').pop();
        const fileName = `sites/${slug}/photo-main.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('msp-photos')
          .upload(fileName, firstPhoto.file);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('msp-photos')
            .getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }

        // Upload additional photos
        for (let i = 1; i < photos.length; i++) {
          const photo = photos[i];
          const ext = photo.file.name.split('.').pop();
          const additionalFileName = `sites/${slug}/photo-${i}.${ext}`;
          await supabase.storage
            .from('msp-photos')
            .upload(additionalFileName, photo.file);
        }
      }

      // Insert site
      const { data, error } = await supabase
        .from('sites_conventionnes')
        .insert([{
          slug,
          name: formData.name,
          site_type: formData.siteType,
          address: formData.address,
          commune: formData.commune,
          postal_code: formData.postalCode || null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          contact_name: formData.contactName || null,
          contact_phone: formData.contactPhone || null,
          contact_email: formData.contactEmail || null,
          domains: formData.domains,
          opening_hours: formData.openingHours || null,
          notes: formData.notes || null,
          convention_notes: formData.conventionNotes || null,
          convention_signed_at: formData.conventionSignedAt || null,
          convention_expires_at: formData.conventionExpiresAt || null,
          photo_url: photoUrl,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving site:', error);
        toast.error('Erreur lors de la sauvegarde');
        return;
      }

      toast.success('Site créé avec succès !');
      navigate(`/sites/${data.slug}`);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Une erreur inattendue s\'est produite');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-4 space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/sites')}>
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!canSave() || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer
          </Button>
        </div>

        <h1 className="text-xl font-bold text-foreground">Nouveau site conventionné</h1>

        {/* Photo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Photos du site
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MultiPhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={8}
              label=""
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Localisation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleGeolocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Localisation en cours...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Me localiser automatiquement
                </>
              )}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="name">Nom du site *</Label>
              <Input
                id="name"
                placeholder="Ex: Mairie de Montpellier"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Type de site *</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SITE_TYPES) as SiteType[]).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.siteType === type ? 'default' : 'outline'}
                    className="h-auto py-2 px-3 justify-start"
                    onClick={() => updateField('siteType', type)}
                  >
                    <Building2 className="w-4 h-4 mr-2 shrink-0" />
                    <span className="text-sm">{SITE_TYPES[type]}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                placeholder="Adresse complète"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  placeholder="34000"
                  value={formData.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commune">Commune *</Label>
                <Input
                  id="commune"
                  placeholder="Montpellier"
                  value={formData.commune}
                  onChange={(e) => updateField('commune', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  placeholder="43.6108"
                  value={formData.latitude}
                  onChange={(e) => updateField('latitude', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  placeholder="3.8767"
                  value={formData.longitude}
                  onChange={(e) => updateField('longitude', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Nom du contact</Label>
              <Input
                id="contactName"
                placeholder="Jean Dupont"
                value={formData.contactName}
                onChange={(e) => updateField('contactName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contactPhone"
                  placeholder="06 12 34 56 78"
                  value={formData.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@exemple.fr"
                  value={formData.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domains */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Domaines d'activité</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((domain) => (
                <Button
                  key={domain}
                  type="button"
                  variant={formData.domains.includes(domain) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDomain(domain)}
                >
                  {domain}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horaires d'accès
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="Ex: Lundi-Vendredi : 8h-18h&#10;Samedi sur réservation"
              value={formData.openingHours}
              onChange={(e) => updateField('openingHours', e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Convention */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Convention
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conventionSignedAt">Date de signature</Label>
                <Input
                  id="conventionSignedAt"
                  type="date"
                  value={formData.conventionSignedAt}
                  onChange={(e) => updateField('conventionSignedAt', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conventionExpiresAt">Date d'expiration</Label>
                <Input
                  id="conventionExpiresAt"
                  type="date"
                  value={formData.conventionExpiresAt}
                  onChange={(e) => updateField('conventionExpiresAt', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conventionNotes">Notes de convention</Label>
              <Textarea
                id="conventionNotes"
                placeholder="Informations sur la convention..."
                value={formData.conventionNotes}
                onChange={(e) => updateField('conventionNotes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes générales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="Notes et observations..."
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
