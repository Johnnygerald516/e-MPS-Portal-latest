declare module 'react-barcode' {
  import { Component } from 'react';

  interface ReactBarcodeProps {
    value: string;
    renderer?: 'svg' | 'canvas';
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    text?: string;
    fontOptions?: string;
    font?: string;
    textAlign?: string;
    textPosition?: string;
    textMargin?: number;
    fontSize?: number;
    background?: string;
    lineColor?: string;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    flat?: boolean;
  }

  export default class Barcode extends Component<ReactBarcodeProps> {}
}
