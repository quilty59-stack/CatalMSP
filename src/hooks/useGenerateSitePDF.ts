import { useCallback, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { SiteConventionne } from '@/types/site';

export function useGenerateSitePDF() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [mapImageBase64, setMapImageBase64] = useState<string | undefined>();

  // Pre-load map image as base64 for PDF generation
  const loadMapImage = useCallback(async (site: SiteConventionne): Promise<string | undefined> => {
    if (!site.latitude || !site.longitude) return undefined;

    const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${site.latitude},${site.longitude}&zoom=17&size=400x200&maptype=mapnik&markers=${site.latitude},${site.longitude},red-pushpin`;

    try {
      const response = await fetch(mapUrl);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setMapImageBase64(base64);
          resolve(base64);
        };
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading map image:', error);
      return undefined;
    }
  }, []);

  const generatePDF = useCallback(async (site: SiteConventionne) => {
    if (!contentRef.current) return;

    try {
      // Pre-load map image first
      const mapBase64 = await loadMapImage(site);
      
      // Small delay to let the image render
      if (mapBase64) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create canvas from the HTML content
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Create PDF (A4 format)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit A4
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      
      // Center the image
      const x = (pdfWidth - scaledWidth) / 2;
      const y = 0;

      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

      // Generate filename
      const sanitizedName = site.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 50);
      
      const filename = `Fiche_Contact_${sanitizedName}.pdf`;
      
      // Download the PDF
      pdf.save(filename);

      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }, [loadMapImage]);

  return { contentRef, generatePDF, mapImageBase64, loadMapImage };
}
