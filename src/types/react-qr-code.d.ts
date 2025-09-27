declare module 'react-qr-code' {
  import { FC } from 'react';

  interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    style?: React.CSSProperties;
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      height: number;
      width: number;
      excavate: boolean;
      x?: number;
      y?: number;
    };
  }

  const QRCode: FC<QRCodeProps>;
  export default QRCode;
}
