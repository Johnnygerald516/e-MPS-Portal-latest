import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (element: HTMLElement, filename: string = 'document.pdf'): Promise<Blob> => {
  try {
    let clone: HTMLElement;
    try {
      // First try the standard cloning approach
      clone = element.cloneNode(true) as HTMLElement;
    } catch (cloneError) {
    clone = document.createElement('div');
      clone.innerHTML = element.innerHTML;
    }
    
    // Apply styles to ensure proper rendering - use try/catch for each operation
    try {
      clone.style.width = '210mm';
      clone.style.height = '297mm';
      clone.style.display = 'block';
      clone.style.visibility = 'visible';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.backgroundColor = '#ffffff';
      clone.style.margin = '0';
      clone.style.padding = '0';
      clone.style.boxSizing = 'border-box';
    } catch (styleError) {
   }
    
    // Add the clone to the document body temporarily - with error handling
    try {
      document.body.appendChild(clone);
    } catch (appendError) {
     throw new Error('Could not append clone to document body: ' + appendError);
    }
    
    try {
      // Create canvas with more reliable settings
      const canvas = await html2canvas(clone, {
        scale: 2, // Reduced scale for better reliability while maintaining quality
        useCORS: true,
        allowTaint: true,
        logging: true, // Enable logging for debugging
        backgroundColor: '#ffffff',
        imageTimeout: 5000, // Reduced timeout to avoid hanging
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc, clonedElement) => {
          try {
            // Apply additional styles to ensure all content is visible
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                try {
                  el.style.visibility = 'visible';
                  el.style.opacity = '1';
                } catch (elementStyleError) {
                 
                }
              }
            });
          } catch (oncloneError) {
            
          }
        }
      }).catch(canvasError => {
        throw new Error('Failed to create canvas: ' + canvasError.message);
      });
      
      

      // A4 dimensions in mm
      const imgWidth = 210;
      const imgHeight = 297;

      // Create PDF with more reliable settings
      let pdf;
      try {
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true, // Enable compression for better compatibility
        });
      } catch (pdfError) {
        throw new Error('Failed to create PDF document: ' + pdfError);
      }
      
      // Convert to image with error handling
      let imgData;
      try {
        // Use JPEG format for better compatibility
        imgData = canvas.toDataURL('image/jpeg', 0.95);
      } catch (imgError) {
        throw new Error('Failed to generate image data: ' + imgError);
      }

      // Add image to PDF with error handling
      try {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } catch (addImageError) {
        throw new Error('Failed to add image to PDF: ' + addImageError);
      }

      // Set document properties with error handling
      try {
        pdf.setProperties({
          title: filename.replace('.pdf', ''),
          subject: 'Migrant Pass',
          creator: 'eMPS Portal',
          author: 'Immigration Department'
        });
      } catch (propError) {
     }

      // Return as blob
      const blob = pdf.output('blob');
     return blob;
    } finally {
      // Remove the clone from the document
      if (clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
    }
  } catch (error) {
    throw error;
  }
};

export const downloadPDF = async (element: HTMLElement, filename: string = 'document.pdf'): Promise<void> => {
  try {
    const pdfBlob = await generatePDF(element, filename);
    const url = URL.createObjectURL(pdfBlob);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
   throw error;
  }
};

export const openPDFInNewTab = async (element: HTMLElement, filename: string = 'document.pdf'): Promise<void> => {
  try {
    // Create a placeholder window first to improve perceived performance
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(
        '<html><head><title>Loading PDF...</title></head><body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh;background-color:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;"><div style="text-align:center;"><div style="display:inline-block;width:40px;height:40px;border:3px solid rgba(0,0,0,.1);border-radius:50%;border-top-color:#4f46e5;animation:spin 1s linear infinite;"></div><p style="margin-top:20px;color:#4b5563;">Preparing your PDF...</p></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style></body></html>'
      );
      newWindow.document.close();
    }

    // Generate the PDF with optimized settings
    const pdfBlob = await generatePDF(element, filename);
    const url = URL.createObjectURL(pdfBlob);
    
    // Update the existing window with the PDF URL
    if (newWindow) {
      newWindow.location.href = url;
    } else {
      // Fallback if the window was blocked
      window.open(url, '_blank');
    }
    
    // Clean up the URL object after a shorter time (30 seconds)
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30000);
  } catch (error) {
   throw error;
  }
};
