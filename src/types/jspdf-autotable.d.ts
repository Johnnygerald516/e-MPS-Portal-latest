declare module 'jspdf-autotable' {
  import { JsPDF } from 'jspdf';

  interface AutoTableSettings {
    html?: string | HTMLTableElement;
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    columns?: Array<{
      header?: string;
      dataKey?: string | number;
      title?: string;
      key?: string;
    }>;
    startY?: number;
    margin?: Margin;
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableLineWidth?: number;
    tableLineColor?: string;
    tableId?: string;
    theme?: 'striped' | 'grid' | 'plain';
    styles?: Styles;
    headStyles?: Styles;
    bodyStyles?: Styles;
    footStyles?: Styles;
    alternateRowStyles?: Styles;
    columnStyles?: {
      [key: string]: Styles;
    };
    didParseCell?: (data: CellHookData) => void;
    willDrawCell?: (data: CellHookData) => void;
    didDrawCell?: (data: CellHookData) => void;
    didDrawPage?: (data: HookData) => void;
  }

  interface Margin {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  }

  interface Styles {
    font?: string;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    fillColor?: string | number[];
    textColor?: string | number[];
    halign?: 'left' | 'center' | 'right' | 'justify';
    valign?: 'top' | 'middle' | 'bottom';
    fontSize?: number;
    cellPadding?: number;
    lineColor?: string | number[];
    lineWidth?: number;
    cellWidth?: 'auto' | 'wrap' | number;
    minCellHeight?: number;
    minCellWidth?: number;
  }

  interface CellHookData {
    table: any;
    cell: any;
    column: any;
    row: any;
    settings: any;
    cursor: any;
    doc: any;
    pageNumber: number;
  }

  interface HookData {
    table: any;
    cursor: any;
    settings: any;
    doc: any;
    pageNumber: number;
  }

  interface UserOptions {
    autoTable: (options: AutoTableSettings) => void;
  }

  function autoTable(doc: JsPDF, options: AutoTableSettings): void;
  export default autoTable;
}
