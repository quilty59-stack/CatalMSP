import { useState, useEffect } from 'react';
import { ExternalLink, MapPin, Loader2 } from 'lucide-react';

interface MapEmbedProps {
  address: string;
  mapsLink?: string;
  latitude?: number;
  longitude?: number;
  className?: string;
}

interface Coordinates {
  lat: number;
  lon: number;
}

export function MapEmbed({ address, mapsLink, latitude, longitude, className = '' }: MapEmbedProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(
    latitude && longitude ? { lat: latitude, lon: longitude } : null
  );
  const [isLoading, setIsLoading] = useState(!latitude || !longitude);
  const [error, setError] = useState(false);
  
  // Encode address for OpenStreetMap search
  const encodedAddress = encodeURIComponent(address);
  const osmSearchUrl = `https://www.openstreetmap.org/search?query=${encodedAddress}`;

  // Geocode the address using Nominatim (only if no coords provided)
  useEffect(() => {
    // Skip geocoding if we already have coordinates
    if (latitude && longitude) {
      setCoordinates({ lat: latitude, lon: longitude });
      setIsLoading(false);
      return;
    }

    const geocodeAddress = async () => {
      setIsLoading(true);
      setError(false);
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        
        if (!response.ok) throw new Error('Geocoding failed');
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (address) {
      geocodeAddress();
    }
  }, [address, encodedAddress, latitude, longitude]);

  // Create OpenStreetMap embed URL with coordinates - zoomed in for street-level view
  const getMapEmbedUrl = () => {
    if (!coordinates) return null;
    // Smaller bbox = more zoom (street level)
    const bbox = `${coordinates.lon - 0.002},${coordinates.lat - 0.001},${coordinates.lon + 0.002},${coordinates.lat + 0.001}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coordinates.lat},${coordinates.lon}`;
  };
  
  // Use provided mapsLink (Google Maps) or fallback to OSM
  const externalMapLink = mapsLink || osmSearchUrl;

  const mapUrl = getMapEmbedUrl();

  return (
    <div className={`relative overflow-hidden rounded-xl bg-muted shadow-lg ring-1 ring-border/50 ${className}`}>
      {isLoading ? (
        <div className="h-[180px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Chargement de la carte...</span>
          </div>
        </div>
      ) : coordinates && mapUrl ? (
        <div className="relative group">
          <iframe
            title="Localisation du site"
            width="100%"
            height="180"
            frameBorder="0"
            scrolling="no"
            src={mapUrl}
            className="rounded-xl"
            style={{ border: 0 }}
          />
          {/* Overlay link for opening in Google Maps */}
          <a
            href={externalMapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 text-sm font-medium text-foreground hover:bg-background transition-colors">
              <ExternalLink className="w-3.5 h-3.5 text-primary" />
              Ouvrir dans Maps
            </div>
          </a>
        </div>
      ) : (
        <a
          href={externalMapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative group"
        >
          <div className="h-[180px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 flex items-center justify-center relative overflow-hidden">
            {/* Decorative map pattern */}
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-300 dark:text-blue-700" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <path d="M 0 100 Q 100 80 200 100 T 400 90" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-300 dark:text-gray-600" />
                <path d="M 150 0 Q 160 100 140 200" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-300 dark:text-gray-600" />
                <path d="M 280 0 Q 300 100 270 200" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-300 dark:text-gray-600" />
              </svg>
            </div>
            
            {/* Center marker */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 bg-destructive rounded-full flex items-center justify-center shadow-lg mb-2 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                <p className="text-xs font-medium text-foreground text-center max-w-[200px] truncate">
                  {address}
                </p>
              </div>
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Ouvrir dans Maps</span>
              </div>
            </div>
          </div>
        </a>
      )}
    </div>
  );
}
