import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Building2, Calendar } from 'lucide-react';
import { SiteConventionne } from '@/types/site';
import { Badge } from '@/components/ui/badge';
import { SITE_TYPES } from '@/types/msp';

interface SiteCardProps {
  site: SiteConventionne;
  index?: number;
}

export function SiteCard({ site, index = 0 }: SiteCardProps) {
  const isConventionValid = site.conventionExpiresAt 
    ? new Date(site.conventionExpiresAt) > new Date() 
    : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/sites/${site.slug}`} className="block">
        <div className="card-elevated p-4 hover:shadow-lg transition-shadow">
          <div className="flex gap-4">
            {/* Photo */}
            <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
              {site.photoUrl ? (
                <img 
                  src={site.photoUrl} 
                  alt={site.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {site.name}
                </h3>
                {!isConventionValid && (
                  <Badge variant="destructive" className="shrink-0 text-xs">
                    Expirée
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{site.commune}</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Building2 className="w-3 h-3" />
                <span>{SITE_TYPES[site.siteType as keyof typeof SITE_TYPES] || site.siteType}</span>
              </div>

              {/* Authorized Maneuvers */}
              {site.authorizedManeuvers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {site.authorizedManeuvers.slice(0, 2).map((maneuver) => (
                    <Badge key={maneuver} variant="secondary" className="text-xs">
                      {maneuver}
                    </Badge>
                  ))}
                  {site.authorizedManeuvers.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{site.authorizedManeuvers.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact quick info */}
          {(site.contactPhone || site.contactEmail) && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
              {site.contactPhone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{site.contactPhone}</span>
                </div>
              )}
              {site.contactEmail && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{site.contactEmail}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
