import { forwardRef } from 'react';
import { SiteConventionne } from '@/types/site';
import logoSrc from '@/assets/logo.png';

interface SiteContactPDFProps {
  site: SiteConventionne;
}

export const SiteContactPDF = forwardRef<HTMLDivElement, SiteContactPDFProps>(
  ({ site }, ref) => {
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '___/___/______';
      return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    const today = new Date().toLocaleDateString('fr-FR');

    return (
      <div 
        ref={ref}
        className="bg-white text-black p-8 w-[210mm] min-h-[297mm] font-sans text-sm"
        style={{ 
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.4',
        }}
      >
        {/* Header */}
        <div className="border-2 border-red-700 mb-6">
          <div className="bg-red-700 text-white px-4 py-3 text-center">
            <h1 className="text-xl font-bold tracking-wide">FICHE CONTACT SITE DE MANŒUVRE</h1>
            <p className="text-xs mt-1 opacity-90">Document de suivi des partenariats - Formation et Entraînement</p>
          </div>
        </div>

        {/* IDENTIFICATION DU PARTENAIRE */}
        <div className="mb-6">
          <div className="bg-red-700 text-white px-3 py-1.5 font-bold text-sm mb-0">
            IDENTIFICATION DU PARTENAIRE
          </div>
          <div className="border border-gray-300 border-t-0">
            <div className="grid grid-cols-3 gap-0">
              {/* Left side - Info */}
              <div className="col-span-2 p-3 space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="font-semibold text-gray-700">Partenaire :</span>
                  <span className="border-b border-gray-300 pb-1 min-h-[20px]">{site.name}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                  <span className="font-semibold text-gray-700">Représentant :</span>
                  <div className="space-y-1">
                    <div className="flex gap-4">
                      <span className="text-xs text-gray-500">Nom :</span>
                      <span className="border-b border-gray-300 flex-1 pb-1 min-h-[18px]">
                        {site.contactName?.split(' ')[0] || ''}
                      </span>
                      <span className="text-xs text-gray-500">Prénom :</span>
                      <span className="border-b border-gray-300 flex-1 pb-1 min-h-[18px]">
                        {site.contactName?.split(' ').slice(1).join(' ') || ''}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-xs text-gray-500">Fonction :</span>
                      <span className="border-b border-gray-300 flex-1 pb-1 min-h-[18px]"></span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="font-semibold text-gray-700">Téléphone :</span>
                  <div className="flex gap-4">
                    <span className="border-b border-gray-300 flex-1 pb-1 min-h-[18px]">{site.contactPhone || ''}</span>
                    <span className="text-xs text-gray-500">Email :</span>
                    <span className="border-b border-gray-300 flex-1 pb-1 min-h-[18px]">{site.contactEmail || ''}</span>
                  </div>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="font-semibold text-gray-700">Adresse :</span>
                  <span className="border-b border-gray-300 pb-1 min-h-[20px]">
                    {site.address}{site.postalCode ? `, ${site.postalCode}` : ''} {site.commune}
                  </span>
                </div>
              </div>
              
              {/* Right side - Logo/Photo */}
              <div className="border-l border-gray-300 p-3 flex flex-col items-center justify-center bg-gray-50">
                {site.photoUrl ? (
                  <img 
                    src={site.photoUrl} 
                    alt={site.name}
                    className="w-24 h-24 object-cover rounded"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400 text-center">LOGO<br/>Partenaire</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONVENTION */}
        <div className="mb-6">
          <div className="bg-red-700 text-white px-3 py-1.5 font-bold text-sm mb-0">
            CONVENTION
          </div>
          <div className="border border-gray-300 border-t-0 p-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-gray-500">Lien convention :</span>
                <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]"></div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Date début :</span>
                <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]">
                  {formatDate(site.conventionSignedAt)}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Date fin :</span>
                <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]">
                  {formatDate(site.conventionExpiresAt)}
                </div>
              </div>
            </div>
            {site.conventionNotes && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500">Notes :</span>
                <p className="text-sm mt-1">{site.conventionNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* SITE DE MANŒUVRE */}
        <div className="mb-6">
          <div className="bg-red-700 text-white px-3 py-1.5 font-bold text-sm mb-0">
            SITE DE MANŒUVRE
          </div>
          <div className="border border-gray-300 border-t-0">
            <div className="grid grid-cols-2 gap-0">
              {/* Left - Details */}
              <div className="p-3 space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Adresse du site :</span>
                  <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]">
                    {site.address}{site.postalCode ? `, ${site.postalCode}` : ''} {site.commune}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Description :</span>
                  <div className="border border-gray-200 mt-1 p-2 min-h-[80px] bg-gray-50 text-sm">
                    {site.notes || ''}
                  </div>
                </div>
              </div>
              
              {/* Right - Photos with actual content */}
              <div className="border-l border-gray-300 p-3 bg-gray-50">
                <span className="text-xs text-gray-500 block mb-2">PHOTOS DU SITE</span>
                <div className="space-y-2">
                  {/* Photo 1: Vue générale - Site photo */}
                  <div className="border border-gray-300 rounded overflow-hidden bg-white">
                    <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 border-b border-gray-200">
                      📷 Photo 1 : Vue générale
                    </div>
                    {site.photoUrl ? (
                      <img 
                        src={site.photoUrl} 
                        alt="Vue générale"
                        className="w-full h-16 object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="h-16 flex items-center justify-center text-gray-400 text-xs">
                        Aucune photo
                      </div>
                    )}
                  </div>
                  
                  {/* Photo 2: Accès - Full address */}
                  <div className="border border-gray-300 rounded overflow-hidden bg-white">
                    <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 border-b border-gray-200">
                      📷 Photo 2 : Accès
                    </div>
                    <div className="h-16 flex items-center justify-center text-gray-500 text-xs p-2 text-center">
                      {site.address}{site.postalCode ? `\n${site.postalCode}` : ''} {site.commune}
                    </div>
                  </div>
                  
                  {/* Photo 3: Plan - Static map using free OpenStreetMap service */}
                  <div className="border border-gray-300 rounded overflow-hidden bg-white">
                    <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 border-b border-gray-200">
                      📷 Photo 3 : Plan
                    </div>
                    {site.latitude && site.longitude ? (
                      <img 
                        src={`https://staticmap.openstreetmap.de/staticmap.php?center=${site.latitude},${site.longitude}&zoom=17&size=300x120&maptype=mapnik&markers=${site.latitude},${site.longitude},red-pushpin`}
                        alt="Plan du site"
                        className="w-full h-16 object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="h-16 flex items-center justify-center text-gray-400 text-xs">
                        Coordonnées GPS non disponibles
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODALITÉS D'ACCÈS ET UTILISATION */}
        <div className="mb-6">
          <div className="bg-red-700 text-white px-3 py-1.5 font-bold text-sm mb-0">
            MODALITÉS D'ACCÈS ET UTILISATION
          </div>
          <div className="border border-gray-300 border-t-0 p-3 space-y-2">
            <div className="grid grid-cols-[150px_1fr] gap-2 items-center">
              <span className="text-xs text-gray-500">Accès / Clés :</span>
              <div className="border-b border-gray-300 pb-1 min-h-[18px]"></div>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-2 items-center">
              <span className="text-xs text-gray-500">Récurrence :</span>
              <div className="border-b border-gray-300 pb-1 min-h-[18px]">{site.openingHours || ''}</div>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-2 items-start">
              <span className="text-xs text-gray-500">Modalités spécifiques :</span>
              <div className="border-b border-gray-300 pb-1 min-h-[36px]"></div>
            </div>
          </div>
        </div>

        {/* TYPES DE MANŒUVRES */}
        <div className="mb-6">
          <div className="bg-red-700 text-white px-3 py-1.5 font-bold text-sm mb-0">
            TYPES DE MANŒUVRES
          </div>
          <div className="border border-gray-300 border-t-0 p-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-green-700">✓ Autorisés :</span>
                <div className="border border-gray-200 mt-1 p-2 min-h-[50px] bg-green-50/50 text-sm">
                  {site.domains.length > 0 ? site.domains.join(', ') : ''}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-red-700">✗ Non autorisés :</span>
                <div className="border border-gray-200 mt-1 p-2 min-h-[50px] bg-red-50/50 text-sm">
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* POINTS D'ATTENTION */}
        <div className="mb-6">
          <div className="bg-amber-500 text-white px-3 py-1.5 font-bold text-sm mb-0 flex items-center gap-2">
            ⚠ POINTS D'ATTENTION / REMARQUES IMPORTANTES
          </div>
          <div className="border border-gray-300 border-t-0 p-3">
            <div className="border border-amber-200 bg-amber-50/50 p-3 min-h-[60px] text-sm">
              {site.conventionNotes || site.notes || ''}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-3 mt-auto flex justify-between items-center text-xs text-gray-500">
          <div className="flex gap-6">
            <span>Date de création : {formatDate(site.createdAt)}</span>
            <span>Dernière mise à jour : {formatDate(site.updatedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={logoSrc} alt="CatalMSP" className="h-6" />
            <span className="font-semibold">CatalMSP</span>
          </div>
        </div>
      </div>
    );
  }
);

SiteContactPDF.displayName = 'SiteContactPDF';
