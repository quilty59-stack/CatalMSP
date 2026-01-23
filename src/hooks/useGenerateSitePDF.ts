import { useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { SiteConventionne } from '@/types/site';

export function useGenerateSitePDF() {
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = useCallback(async (site: SiteConventionne) => {
    if (!contentRef.current) return;

    try {
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
  }, []);

  return { contentRef, generatePDF };
}
