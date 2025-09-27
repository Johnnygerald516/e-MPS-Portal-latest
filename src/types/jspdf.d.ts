declare module 'jspdf' {
  interface JsPDFOptions {
    orientation?: 'portrait' | 'landscape';
    unit?: 'pt' | 'mm' | 'cm' | 'in';
    format?: string | [number, number];
    compress?: boolean;
    precision?: number;
    filters?: string[];
    userUnit?: number;
    hotfixes?: string[];
    encryption?: {
      userPassword?: string;
      ownerPassword?: string;
      userPermissions?: string[];
    };
  }

  interface TextOptions {
    align?: 'left' | 'center' | 'right' | 'justify';
    baseline?: 'alphabetic' | 'ideographic' | 'bottom' | 'top' | 'middle' | 'hanging';
    angle?: number;
    rotationDirection?: 0 | 1;
    isInputVisual?: boolean;
    isOutputVisual?: boolean;
    isInputRtl?: boolean;
    isOutputRtl?: boolean;
    isSymmetricSwapping?: boolean;
  }

  interface JsPDF {
    addPage(format?: string | [number, number], orientation?: 'portrait' | 'landscape'): JsPDF;
    setPage(pageNumber: number): JsPDF;
    text(text: string | string[], x: number, y: number, options?: TextOptions | null): JsPDF;
    setFont(fontName: string, fontStyle?: string): JsPDF;
    setFontSize(size: number): JsPDF;
    setTextColor(r: number, g?: number, b?: number): JsPDF;
    setDrawColor(r: number, g?: number, b?: number): JsPDF;
    setFillColor(r: number, g?: number, b?: number): JsPDF;
    setLineWidth(width: number): JsPDF;
    rect(x: number, y: number, w: number, h: number, style?: 'S' | 'F' | 'DF' | 'FD'): JsPDF;
    line(x1: number, y1: number, x2: number, y2: number): JsPDF;
    addImage(
      imageData: string | HTMLImageElement | HTMLCanvasElement | Uint8Array,
      format: string,
      x: number,
      y: number,
      w: number,
      h: number,
      alias?: string,
      compression?: 'NONE' | 'FAST' | 'MEDIUM' | 'SLOW',
      rotation?: number
    ): JsPDF;
    save(filename?: string): JsPDF;
    output(type?: 'arraybuffer' | 'blob' | 'datauristring' | 'dataurlstring' | 'dataurlnewwindow' | 'dataurl' | 'save', options?: any): any;
    setProperties(properties: any): JsPDF;
    setLineDash(dashArray: number[], dashPhase?: number): JsPDF;
    setLineDashPattern(dashArray: number[], dashPhase?: number): JsPDF;
    circle(x: number, y: number, r: number, style?: 'S' | 'F' | 'DF' | 'FD'): JsPDF;
    ellipse(x: number, y: number, rx: number, ry: number, style?: 'S' | 'F' | 'DF' | 'FD'): JsPDF;
    triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, style?: 'S' | 'F' | 'DF' | 'FD'): JsPDF;
    roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style?: 'S' | 'F' | 'DF' | 'FD'): JsPDF;
    clip(rule?: 'evenodd'): JsPDF;
    clipEvenOdd(): JsPDF;
    discardPath(): JsPDF;
    autoPrint(options?: { variant: 'non-conform' | 'javascript' }): JsPDF;
    deletePage(pageNumber: number): JsPDF;
    getNumberOfPages(): number;
    getCurrentPageInfo(): { pageNumber: number; pageContext: any };
    getPageInfo(pageNumber: number): { pageNumber: number; pageContext: any };
    movePage(targetPage: number, beforePage: number): JsPDF;
    insertPage(beforePage?: number): JsPDF;
    setDisplayMode(zoom?: string | number, layout?: 'continuous' | 'single' | 'twoleft' | 'tworight' | 'two', pmode?: 'UseOutlines' | 'UseThumbs' | 'FullScreen'): JsPDF;
    setCreationDate(date?: Date | string): JsPDF;
    getCreationDate(type?: 'jsDate' | 'formatted'): Date | string;
    setFileId(value?: string): JsPDF;
    getFileId(): string;
  }

  interface JsPDFStatic {
    new(options?: JsPDFOptions): JsPDF;
  }

  const jsPDF: JsPDFStatic;
  export default jsPDF;
}
