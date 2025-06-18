import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface UsePdfGeneratorOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export const usePdfGenerator = (options: UsePdfGeneratorOptions = {}) => {
  const {
    filename = 'document.pdf',
    format = 'a4',
    orientation = 'portrait'
  } = options;

  const generatePdf = useCallback(async (elementRef: HTMLElement | null) => {
    if (!elementRef) {
      console.error('Element reference is null');
      return;
    }

    try {
      // Configure html2canvas options
      const canvas = await html2canvas(elementRef, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: elementRef.scrollWidth,
        height: elementRef.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: elementRef.scrollWidth,
        windowHeight: elementRef.scrollHeight
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(filename);

      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }, [filename, format, orientation]);

  return { generatePdf };
}; 