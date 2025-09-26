import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (element: HTMLElement, filename: string = 'document.pdf'): Promise<Blob> => {
  try {
    console.log('Starting high-quality PDF generation for element:', element);
    console.log('Element dimensions:', element.offsetWidth, 'x', element.offsetHeight);
    
    // Create a clone of the element to avoid modifying the original
    // Use a safer cloning approach
    let clone: HTMLElement;
    try {
      // First try the standard cloning approach
      clone = element.cloneNode(true) as HTMLElement;
    } catch (cloneError) {
      console.error('Error cloning element, using fallback method:', cloneError);
      // Fallback: create a new div and copy the innerHTML
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
      console.warn('Error applying styles to clone:', styleError);
      // Continue anyway - some styles might have applied
    }
    
    // Add the clone to the document body temporarily - with error handling
    try {
      document.body.appendChild(clone);
    } catch (appendError) {
      console.error('Error appending clone to body:', appendError);
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
                  console.warn('Error applying styles to element:', elementStyleError);
                }
              }
            });
          } catch (oncloneError) {
            console.warn('Error in onclone function:', oncloneError);
          }
        }
      }).catch(canvasError => {
        console.error('html2canvas error:', canvasError);
        throw new Error('Failed to create canvas: ' + canvasError.message);
      });
      
      console.log('Canvas created successfully:', canvas.width, 'x', canvas.height);

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
        console.error('Error creating PDF:', pdfError);
        throw new Error('Failed to create PDF document: ' + pdfError);
      }
      
      // Convert to image with error handling
      let imgData;
      try {
        // Use JPEG format for better compatibility
        imgData = canvas.toDataURL('image/jpeg', 0.95);
        console.log('Image data generated successfully');
      } catch (imgError) {
        console.error('Error generating image data:', imgError);
        throw new Error('Failed to generate image data: ' + imgError);
      }

      // Add image to PDF with error handling
      try {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        console.log('Image added to PDF successfully');
      } catch (addImageError) {
        console.error('Error adding image to PDF:', addImageError);
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
        console.warn('Error setting PDF properties:', propError);
        // Continue anyway - properties are not critical
      }

      // Return as blob
      const blob = pdf.output('blob');
      console.log('High-quality PDF blob created, size:', blob.size);
      return blob;
    } finally {
      // Remove the clone from the document
      if (clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
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
    console.error('Error downloading PDF:', error);
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
    console.error('Error opening PDF:', error);
    throw error;
  }
};
