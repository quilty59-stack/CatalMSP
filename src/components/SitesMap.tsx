import { useEffect, useRef, useState } from 'react';
import { SiteConventionne } from '@/types/site';
import { MapPin, Clock, Car, Truck, Bike, Footprints, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Epicenter configuration
const EPICENTER = {
  lat: 46.33764,
  lng: 4.80803,
  address: "Route de Sancé, 71870 Hurigny"
};

// Permanent isochrone configuration - order matters: largest first, smallest last (on top)
const PERMANENT_ISOCHRONES = [
  { minutes: 20, color: '#f97316', fillColor: '#f97316', label: '20 min' }, // Orange - drawn first (bottom)
  { minutes: 15, color: '#3b82f6', fillColor: '#3b82f6', label: '15 min' }, // Blue - drawn last (on top)
];

interface SitesMapProps {
  sites: SiteConventionne[];
  selectedSite?: SiteConventionne | null;
  onSiteSelect?: (site: SiteConventionne) => void;
  className?: string;
  showLabels?: boolean;
  lightMode?: boolean;
}

type TransportProfile = 'driving-car' | 'driving-hgv' | 'cycling-regular' | 'foot-walking';

const TRANSPORT_PROFILES: { value: TransportProfile; label: string; icon: React.ReactNode }[] = [
  { value: 'driving-car', label: 'Voiture', icon: <Car className="w-4 h-4" /> },
  { value: 'driving-hgv', label: 'Camion (VSAV)', icon: <Truck className="w-4 h-4" /> },
  { value: 'cycling-regular', label: 'Vélo', icon: <Bike className="w-4 h-4" /> },
  { value: 'foot-walking', label: 'À pied', icon: <Footprints className="w-4 h-4" /> },
];

export function SitesMap({ 
  sites, 
  selectedSite, 
  onSiteSelect, 
  className = '',
  showLabels = false,
  lightMode = false
}: SitesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const labelsRef = useRef<any[]>([]);
  const isochroneLayerRef = useRef<any>(null);
  const permanentIsochronesRef = useRef<any[]>([]);
  const epicenterMarkerRef = useRef<any>(null);

  // Isochrone controls
  const [isochroneSite, setIsochroneSite] = useState<SiteConventionne | null>(null);
  const [transportProfile, setTransportProfile] = useState<TransportProfile>('driving-car');
  const [timeRange, setTimeRange] = useState(15); // minutes
  const [isLoadingIsochrone, setIsLoadingIsochrone] = useState(false);
  const [permanentIsochronesLoaded, setPermanentIsochronesLoaded] = useState(false);

  // Calculate center from sites with coordinates
  const sitesWithCoords = sites.filter(s => s.latitude && s.longitude);
  
  // Use epicenter as default center
  const center = EPICENTER;

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Fetch permanent isochrones for epicenter
  const fetchPermanentIsochrones = async (L: any, map: any) => {
    if (permanentIsochronesLoaded) return;
    
    try {
      // Draw isochrones in order: first one at bottom, last one on top
      for (const iso of PERMANENT_ISOCHRONES) {
        const { data, error } = await supabase.functions.invoke('isochrone', {
          body: {
            latitude: EPICENTER.lat,
            longitude: EPICENTER.lng,
            profile: 'driving-car',
            range: iso.minutes,
          },
        });

        if (error) {
          console.error(`Error fetching ${iso.minutes}min isochrone:`, error);
          continue;
        }

        if (data?.features) {
          // Use solid fill - the top layer will cover the center
          const layer = L.geoJSON(data, {
            style: {
              fillColor: iso.fillColor,
              fillOpacity: 0.35, // More opaque for better distinction
              color: iso.color,
              weight: 2,
            }
          }).addTo(map);
          
          permanentIsochronesRef.current.push(layer);
        }
      }
      
      setPermanentIsochronesLoaded(true);
    } catch (error) {
      console.error('Error fetching permanent isochrones:', error);
    }
  };

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create map centered on epicenter
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 10);
    mapInstanceRef.current = map;

    // Add tile layer - use lighter tiles for better performance
    const tileUrl = lightMode 
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png';
    
    const attribution = lightMode 
      ? '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>'
      : '© OpenStreetMap France';

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    }).addTo(map);

    // Add epicenter marker with app logo
    const epicenterIcon = L.divIcon({
      className: 'epicenter-marker',
      html: `
        <div class="relative">
          <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-primary ring-4 ring-primary/30">
            <img src="/logo.png" alt="Épicentre" class="w-10 h-10 object-contain" />
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-primary"></div>
        </div>
      `,
      iconSize: [56, 68],
      iconAnchor: [28, 68],
    });

    const epicenterMarker = L.marker([EPICENTER.lat, EPICENTER.lng], {
      icon: epicenterIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    epicenterMarker.bindPopup(`
      <div class="p-2 text-center">
        <h4 class="font-bold text-sm mb-1">Centre de Secours</h4>
        <p class="text-xs text-gray-600">${EPICENTER.address}</p>
      </div>
    `);

    epicenterMarkerRef.current = epicenterMarker;

    // Fetch permanent isochrones
    fetchPermanentIsochrones(L, map);

    // Create custom icon for sites
    const createIcon = (isSelected: boolean) => L.divIcon({
      className: 'custom-marker',
      html: `<div class="w-8 h-8 ${isSelected ? 'bg-primary' : 'bg-destructive'} rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Clear existing markers and labels
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    labelsRef.current.forEach(l => l.remove());
    labelsRef.current = [];

    // Add markers for sites with coordinates
    sitesWithCoords.forEach((site) => {
      const isSelected = selectedSite?.id === site.id;
      const marker = L.marker([site.latitude, site.longitude], {
        icon: createIcon(isSelected)
      }).addTo(map);

      // Add label with site name if showLabels is true
      if (showLabels) {
        const label = L.divIcon({
          className: 'site-label',
          html: `<div class="px-2 py-1 bg-card/95 backdrop-blur-sm text-xs font-medium rounded shadow-md border border-border whitespace-nowrap max-w-[150px] truncate">${site.name}</div>`,
          iconSize: [150, 24],
          iconAnchor: [-8, 16],
        });
        const labelMarker = L.marker([site.latitude, site.longitude], { 
          icon: label,
          interactive: false
        }).addTo(map);
        labelsRef.current.push(labelMarker);
      }

      // Create popup content - simplified
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 min-w-[180px]';
      popupContent.innerHTML = `
        <h4 class="font-semibold text-sm mb-1">${site.name}</h4>
        <p class="text-xs text-gray-600 mb-2">${site.commune}</p>
        <a href="/sites/${site.slug}" class="text-xs text-blue-600 hover:underline">
          Voir la fiche →
        </a>
      `;
      
      // Add isochrone button
      const isoButton = document.createElement('button');
      isoButton.className = 'mt-2 w-full px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 flex items-center justify-center gap-1';
      isoButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg> Isochrone';
      isoButton.onclick = () => {
        setIsochroneSite(site);
        marker.closePopup();
      };
      popupContent.appendChild(isoButton);
      
      marker.bindPopup(popupContent, { closeButton: true, maxWidth: 200 });

      marker.on('click', () => {
        onSiteSelect?.(site);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to include epicenter and all sites
    if (sitesWithCoords.length > 0) {
      const allPoints = [
        [EPICENTER.lat, EPICENTER.lng],
        ...sitesWithCoords.map(s => [s.latitude, s.longitude])
      ];
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      permanentIsochronesRef.current = [];
      setPermanentIsochronesLoaded(false);
    };
  }, [mapLoaded, sites, selectedSite, center.lat, center.lng, showLabels, lightMode]);

  // Fetch and display isochrone
  const fetchIsochrone = async () => {
    if (!isochroneSite?.latitude || !isochroneSite?.longitude) {
      toast.error("Ce site n'a pas de coordonnées GPS");
      return;
    }

    setIsLoadingIsochrone(true);
    const L = (window as any).L;

    try {
      const { data, error } = await supabase.functions.invoke('isochrone', {
        body: {
          latitude: isochroneSite.latitude,
          longitude: isochroneSite.longitude,
          profile: transportProfile,
          range: timeRange,
        },
      });

      if (error) throw error;

      // Remove existing isochrone layer
      if (isochroneLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(isochroneLayerRef.current);
      }

      // Add new isochrone layer
      if (data?.features && mapInstanceRef.current) {
        const isochroneLayer = L.geoJSON(data, {
          style: {
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
            color: '#1d4ed8',
            weight: 2,
          }
        }).addTo(mapInstanceRef.current);

        isochroneLayerRef.current = isochroneLayer;

        // Fit map to isochrone bounds
        mapInstanceRef.current.fitBounds(isochroneLayer.getBounds(), { padding: [30, 30] });

        toast.success(`Isochrone ${timeRange} min affiché`);
      }
    } catch (error) {
      console.error('Isochrone error:', error);
      toast.error("Erreur lors du calcul de l'isochrone");
    } finally {
      setIsLoadingIsochrone(false);
    }
  };

  // Close panel without clearing isochrone
  const closePanel = () => {
    setIsochroneSite(null);
  };

  // Clear isochrone completely
  const clearIsochrone = () => {
    if (isochroneLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(isochroneLayerRef.current);
      isochroneLayerRef.current = null;
    }
    setIsochroneSite(null);
  };

  if (sitesWithCoords.length === 0) {
    return (
      <div className={`bg-muted rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Aucun site avec coordonnées GPS
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoutez des coordonnées aux sites pour les voir sur la carte
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[300px]" />
      
      {/* Isochrone Controls Panel */}
      {isochroneSite && (
        <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border w-72 z-[1000]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Isochrone
            </h4>
            <Button variant="ghost" size="sm" onClick={closePanel} className="h-6 px-2 text-xs">
              ✕
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">
            Depuis : <span className="font-medium text-foreground">{isochroneSite.name}</span>
          </p>

          <div className="space-y-3">
            {/* Transport mode */}
            <div className="space-y-1">
              <Label className="text-xs">Mode de transport</Label>
              <Select value={transportProfile} onValueChange={(v) => setTransportProfile(v as TransportProfile)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSPORT_PROFILES.map((p) => (
                    <SelectItem key={p.value} value={p.value} className="text-xs">
                      <div className="flex items-center gap-2">
                        {p.icon}
                        {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time range slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Durée de trajet</Label>
                <span className="text-xs font-medium text-primary">{timeRange} min</span>
              </div>
              <Slider
                value={[timeRange]}
                onValueChange={(v) => setTimeRange(v[0])}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>

            {/* Calculate button */}
            <Button 
              onClick={fetchIsochrone} 
              disabled={isLoadingIsochrone}
              className="w-full h-8 text-xs"
            >
              {isLoadingIsochrone ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Calcul...
                </>
              ) : (
                'Calculer l\'isochrone'
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* Legend - positioned next to zoom controls (top-left) */}
      <div className="absolute top-4 left-14 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 text-xs z-[1000] flex items-center gap-4">
        {/* Epicenter */}
        <div className="flex items-center gap-1.5">
          <img src="/logo.png" alt="Centre" className="w-4 h-4" />
          <span className="font-medium">CS</span>
        </div>
        
        {/* Isochrones legend - display in reading order (15 min first, then 20 min) */}
        <div className="flex items-center gap-1.5">
          <div 
            className="w-3 h-3 rounded" 
            style={{ backgroundColor: '#3b82f6', opacity: 0.6 }} 
          />
          <span>0-15 min</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div 
            className="w-3 h-3 rounded" 
            style={{ backgroundColor: '#f97316', opacity: 0.6 }} 
          />
          <span>15-20 min</span>
        </div>
      </div>
      
      {/* Custom isochrone indicator if present */}
      {isochroneLayerRef.current && (
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 text-xs z-[1000]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/50 border border-primary rounded" />
            <span>Zone {timeRange} min</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearIsochrone}
              className="h-5 px-1.5 text-xs text-destructive hover:text-destructive ml-1"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
