import { useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

interface MapEmbedProps {
  address: string;
  mapsLink?: string;
  className?: string;
}

export function MapEmbed({ address, mapsLink, className = '' }: MapEmbedProps) {
  const [imageError, setImageError] = useState(false);
  
  // Encode address for OpenStreetMap
  const encodedAddress = encodeURIComponent(address);
  
  // Create OpenStreetMap embed URL using Nominatim for geocoding
  const osmSearchUrl = `https://www.openstreetmap.org/search?query=${encodedAddress}`;
  
  // Static map image using OpenStreetMap tiles via a free service
  // Using a placeholder map image approach
  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${encodedAddress}&zoom=15&size=400x200&maptype=mapnik`;

  return (
    <div className={`relative overflow-hidden rounded-lg bg-muted ${className}`}>
      {!imageError ? (
        <div className="relative">
          <iframe
            title="Localisation du site"
            width="100%"
            height="180"
            frameBorder="0"
            scrolling="no"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=auto&layer=mapnik&marker=auto`}
            style={{ border: 0, display: 'none' }}
          />
          {/* Fallback static display with link */}
          <a
            href={mapsLink || osmSearchUrl}
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
                  {/* Roads */}
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
        </div>
      ) : (
        <a
          href={mapsLink || osmSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center h-[180px] gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-sm">Voir sur la carte</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
