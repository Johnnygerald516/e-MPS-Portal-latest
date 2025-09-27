declare module 'qrcode' {
  interface QRCodeOptions {
    version?: number;
    errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H';
    maskPattern?: number;
    toSJISFunc?: (codePoint: string) => number;
    margin?: number;
    scale?: number;
    small?: boolean;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  interface QRCodeToDataURLOptions extends QRCodeOptions {
    type?: string;
    rendererOpts?: {
      quality?: number;
    };
  }

  interface QRCodeToStringOptions extends QRCodeOptions {
    type?: string;
  }

  interface QRCodeToFileOptions extends QRCodeOptions {
    type?: string;
    rendererOpts?: {
      quality?: number;
    };
  }

  interface QRCodeToBufferOptions extends QRCodeOptions {
    type?: string;
    rendererOpts?: {
      quality?: number;
    };
  }

  interface QRCode {
    toCanvas(
      canvas: HTMLCanvasElement | string,
      text: string,
      options?: QRCodeOptions
    ): Promise<HTMLCanvasElement>;
    
    toCanvas(
      text: string,
      options?: QRCodeOptions
    ): Promise<HTMLCanvasElement>;
    
    toDataURL(
      text: string,
      options?: QRCodeToDataURLOptions
    ): Promise<string>;
    
    toString(
      text: string,
      options?: QRCodeToStringOptions
    ): Promise<string>;
    
    toFile(
      path: string,
      text: string,
      options?: QRCodeToFileOptions
    ): Promise<void>;
    
    toBuffer(
      text: string,
      options?: QRCodeToBufferOptions
    ): Promise<Buffer>;
  }

  const QRCode: QRCode;
  export default QRCode;
}
