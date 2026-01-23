import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { MANEUVER_TYPES, DEFAULT_UNAUTHORIZED_MANEUVERS } from '@/types/site';
import { useSite } from '@/hooks/useSites';
import { 
  ArrowLeft,
  Camera,
  MapPin, 
  Building2,
  Loader2,
  Navigation,
  X,
  Save,
  Phone,
  Mail,
  User,
  Key,
  FileText,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function EditSite() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { site, isLoading: isLoadingSite, error: siteError } = useSite(slug);
  
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
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
    contactPhoneLandline: '',
    contactEmail: '',
    authorizedManeuvers: [] as string[],
    unauthorizedManeuvers: [...DEFAULT_UNAUTHORIZED_MANEUVERS] as string[],
    notes: '',
    conventionNotes: '',
    accessKeys: '',
    recurrence: '',
    specificModalities: '',
    conventionSignedAt: '',
    conventionExpiresAt: '',
  });

  // Initialize form with site data
  useEffect(() => {
    if (site && !isInitialized) {
      setFormData({
        name: site.name || '',
        siteType: (site.siteType as SiteType) || '',
        address: site.address || '',
        commune: site.commune || '',
        postalCode: site.postalCode || '',
        latitude: site.latitude?.toString() || '',
        longitude: site.longitude?.toString() || '',
        contactName: site.contactName || '',
        contactPhone: site.contactPhone || '',
        contactPhoneLandline: site.contactPhoneLandline || '',
        contactEmail: site.contactEmail || '',
        authorizedManeuvers: site.authorizedManeuvers || [],
        unauthorizedManeuvers: site.unauthorizedManeuvers || [...DEFAULT_UNAUTHORIZED_MANEUVERS],
        notes: site.notes || '',
        conventionNotes: site.conventionNotes || '',
        accessKeys: site.accessKeys || '',
        recurrence: site.recurrence || '',
        specificModalities: site.specificModalities || '',
        conventionSignedAt: site.conventionSignedAt || '',
        conventionExpiresAt: site.conventionExpiresAt || '',
      });
      if (site.photoUrl) {
        setPhotoPreview(site.photoUrl);
      }
      if (site.logoUrl) {
        setLogoPreview(site.logoUrl);
      }
      setIsInitialized(true);
    }
  }, [site, isInitialized]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAuthorizedManeuver = (maneuver: string) => {
    setFormData((prev) => ({
      ...prev,
      authorizedManeuvers: prev.authorizedManeuvers.includes(maneuver)
        ? prev.authorizedManeuvers.filter(m => m !== maneuver)
        : [...prev.authorizedManeuvers, maneuver]
    }));
  };

  const toggleUnauthorizedManeuver = (maneuver: string) => {
    setFormData((prev) => ({
      ...prev,
      unauthorizedManeuvers: prev.unauthorizedManeuvers.includes(maneuver)
        ? prev.unauthorizedManeuvers.filter(m => m !== maneuver)
        : [...prev.unauthorizedManeuvers, maneuver]
    }));
  };

  const addCustomUnauthorized = (value: string) => {
    if (value.trim() && !formData.unauthorizedManeuvers.includes(value.trim())) {
      setFormData((prev) => ({
        ...prev,
        unauthorizedManeuvers: [...prev.unauthorizedManeuvers, value.trim()]
      }));
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
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
    if (!canSave() || !site) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setIsSaving(true);
    
    try {
      // Upload new photo if present
      let photoUrl = site.photoUrl;
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `sites/${site.slug}/photo-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('msp-photos')
          .upload(fileName, photoFile);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('msp-photos')
            .getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }
      }

      // Upload new logo if present
      let logoUrl = site.logoUrl;
      if (logoFile) {
        const logoExt = logoFile.name.split('.').pop();
        const logoFileName = `sites/${site.slug}/logo-${Date.now()}.${logoExt}`;
        
        const { error: logoUploadError } = await supabase.storage
          .from('msp-photos')
          .upload(logoFileName, logoFile);
        
        if (!logoUploadError) {
          const { data: logoUrlData } = supabase.storage
            .from('msp-photos')
            .getPublicUrl(logoFileName);
          logoUrl = logoUrlData.publicUrl;
        }
      }

      // Update site
      const { error } = await supabase
        .from('sites_conventionnes')
        .update({
          name: formData.name,
          site_type: formData.siteType,
          address: formData.address,
          commune: formData.commune,
          postal_code: formData.postalCode || null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          contact_name: formData.contactName || null,
          contact_phone: formData.contactPhone || null,
          contact_phone_landline: formData.contactPhoneLandline || null,
          contact_email: formData.contactEmail || null,
          authorized_maneuvers: formData.authorizedManeuvers,
          unauthorized_maneuvers: formData.unauthorizedManeuvers,
          access_keys: formData.accessKeys || null,
          recurrence: formData.recurrence || null,
          specific_modalities: formData.specificModalities || null,
          notes: formData.notes || null,
          convention_notes: formData.conventionNotes || null,
          convention_signed_at: formData.conventionSignedAt || null,
          convention_expires_at: formData.conventionExpiresAt || null,
          photo_url: photoUrl,
          logo_url: logoUrl,
        })
        .eq('id', site.id);

      if (error) {
        console.error('Error updating site:', error);
        toast.error('Erreur lors de la sauvegarde');
        return;
      }

      toast.success('Site mis à jour avec succès !');
      navigate(`/sites/${site.slug}`);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Une erreur inattendue s\'est produite');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingSite) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (siteError || !site) {
    return (
      <Layout>
        <div className="px-4 py-8 text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Site non trouvé</h1>
          <p className="text-muted-foreground mb-4">Le site demandé n'existe pas.</p>
          <Button onClick={() => navigate('/sites')}>Retour aux sites</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-4 space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/sites/${site.slug}`)}>
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

        <h1 className="text-xl font-bold text-foreground">Modifier le site</h1>

        {/* Logo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Logo du partenaire
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleLogoCapture}
              className="hidden"
            />
            
            {logoPreview ? (
              <div className="relative w-32 h-32 mx-auto">
                <img 
                  src={logoPreview} 
                  alt="Logo" 
                  className="w-full h-full object-contain rounded-xl border border-border bg-white p-2"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={removeLogo}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div 
                className="h-32 w-32 mx-auto border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => logoInputRef.current?.click()}
              >
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground text-center">Ajouter un logo</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Photo du site
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
            
            {photoPreview ? (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Site" 
                  className="w-full h-48 object-cover rounded-xl"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ajouter une photo</span>
              </div>
            )}
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
              <Label htmlFor="contactPhone">Téléphone mobile</Label>
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
              <Label htmlFor="contactPhoneLandline">Téléphone fixe</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contactPhoneLandline"
                  placeholder="04 67 12 34 56"
                  value={formData.contactPhoneLandline}
                  onChange={(e) => updateField('contactPhoneLandline', e.target.value)}
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

        {/* Access / Keys */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="w-4 h-4" />
              Accès / Clés
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="Ex: Clés à récupérer à l'accueil, digicode 1234A..."
              value={formData.accessKeys}
              onChange={(e) => updateField('accessKeys', e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Recurrence */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Récurrence
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="Ex: Disponible tous les lundis et mercredis..."
              value={formData.recurrence}
              onChange={(e) => updateField('recurrence', e.target.value)}
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Authorized Maneuvers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Manœuvres autorisées
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {MANEUVER_TYPES.map((maneuver) => (
                <Button
                  key={maneuver}
                  type="button"
                  variant={formData.authorizedManeuvers.includes(maneuver) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleAuthorizedManeuver(maneuver)}
                  className={formData.authorizedManeuvers.includes(maneuver) ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {maneuver}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unauthorized Maneuvers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Manœuvres non autorisées
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.unauthorizedManeuvers.map((maneuver) => (
                <Button
                  key={maneuver}
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => toggleUnauthorizedManeuver(maneuver)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {maneuver} ×
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une restriction..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomUnauthorized((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Specific Modalities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Modalités spécifiques
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="Ex: Prévenir 48h à l'avance, port du casque obligatoire..."
              value={formData.specificModalities}
              onChange={(e) => updateField('specificModalities', e.target.value)}
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