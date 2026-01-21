import { useEffect, useRef, useState } from 'react';
import { SiteConventionne } from '@/types/site';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SitesMapProps {
  sites: SiteConventionne[];
  selectedSite?: SiteConventionne | null;
  onSiteSelect?: (site: SiteConventionne) => void;
  className?: string;
}

export function SitesMap({ sites, selectedSite, onSiteSelect, className = '' }: SitesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Calculate center from sites with coordinates
  const sitesWithCoords = sites.filter(s => s.latitude && s.longitude);
  const defaultCenter = { lat: 46.603354, lng: 1.888334 }; // France center
  
  const center = sitesWithCoords.length > 0
    ? {
        lat: sitesWithCoords.reduce((sum, s) => sum + (s.latitude || 0), 0) / sitesWithCoords.length,
        lng: sitesWithCoords.reduce((sum, s) => sum + (s.longitude || 0), 0) / sitesWithCoords.length,
      }
    : defaultCenter;

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

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create map
    const map = L.map(mapRef.current).setView([center.lat, center.lng], sitesWithCoords.length > 0 ? 7 : 5);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create custom icon
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

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add markers for sites with coordinates
    sitesWithCoords.forEach((site) => {
      const isSelected = selectedSite?.id === site.id;
      const marker = L.marker([site.latitude, site.longitude], {
        icon: createIcon(isSelected)
      }).addTo(map);

      // Create popup content
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h4 class="font-semibold text-sm mb-1">${site.name}</h4>
          <p class="text-xs text-gray-600 mb-2">${site.commune}</p>
          <a href="/sites/${site.slug}" class="text-xs text-blue-600 hover:underline">
            Voir la fiche →
          </a>
        </div>
      `;
      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSiteSelect?.(site);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if we have sites
    if (sitesWithCoords.length > 1) {
      const bounds = L.latLngBounds(sitesWithCoords.map(s => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (sitesWithCoords.length === 1) {
      map.setView([sitesWithCoords[0].latitude, sitesWithCoords[0].longitude], 14);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, sites, selectedSite, center.lat, center.lng]);

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
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[300px]" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-destructive rounded-full" />
          <span>{sitesWithCoords.length} site{sitesWithCoords.length > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
