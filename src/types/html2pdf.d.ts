declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    enableLinks?: boolean;
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      letterRendering?: boolean;
      allowTaint?: boolean;
      logging?: boolean;
      dpi?: number;
      backgroundColor?: string | null;
    };
    jsPDF?: {
      orientation?: 'portrait' | 'landscape';
      unit?: 'pt' | 'mm' | 'cm' | 'in';
      format?: string | [number, number];
      compress?: boolean;
      precision?: number;
      filters?: string[];
    };
    pagebreak?: {
      mode?: 'avoid-all' | 'css' | 'legacy';
      before?: string[];
      after?: string[];
      avoid?: string[];
    };
  }

  interface Html2Pdf {
    from(element: HTMLElement | string, options?: Html2PdfOptions): Html2Pdf;
    set(options: Html2PdfOptions): Html2Pdf;
    save(): Promise<void>;
    toPdf(): any;
    output(type: string, options?: any): any;
    outputPdf(type?: string, options?: any): any;
    outputImg(type?: string): Promise<string | Blob | Uint8Array>;
  }

  interface Html2PdfStatic {
    (element: HTMLElement | string, options?: Html2PdfOptions): Html2Pdf;
  }

  const html2pdf: Html2PdfStatic;
  export default html2pdf;
}
