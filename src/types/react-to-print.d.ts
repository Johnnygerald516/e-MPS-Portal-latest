declare module 'react-to-print' {
  import { ReactInstance, Component, RefObject } from 'react';

  export interface PrintContextConsumerProps {
    handlePrint: () => void;
  }

  export interface ReactToPrintProps {
    /** Class to pass to the print window body */
    bodyClass?: string;
    /** Content to be printed */
    content: () => ReactInstance | null;
    /** Copy styles over into print window. Default: true */
    copyStyles?: boolean;
    /** Set the title for printing when saving as a PDF */
    documentTitle?: string;
    /** Callback function to trigger after print */
    onAfterPrint?: () => void;
    /** Callback function to trigger before page content is retrieved for printing */
    onBeforeGetContent?: () => void | Promise<void>;
    /** Callback function to trigger before print */
    onBeforePrint?: () => void | Promise<void>;
    /** Override default print window styling */
    pageStyle?: string | (() => string);
    /** Remove the iframe after printing. */
    removeAfterPrint?: boolean;
    /** Trigger action used to open browser print */
    trigger?: <T>() => React.ReactElement<T>;
    /** Delay in ms before printing, to ensure everything is rendered. Default: 500 */
    suppressErrors?: boolean;
    /** Print the first page only */
    print?: (target: HTMLIFrameElement) => void;
  }

  export interface UseReactToPrintOptions {
    /** Class to pass to the print window body */
    bodyClass?: string;
    /** Content to be printed (target) */
    content: RefObject<ReactInstance> | null;
    /** Copy styles over into print window. Default: true */
    copyStyles?: boolean;
    /** Set the title for printing when saving as a PDF */
    documentTitle?: string;
    /** Callback function to trigger after print */
    onAfterPrint?: () => void;
    /** Callback function to trigger before page content is retrieved for printing */
    onBeforeGetContent?: () => void | Promise<void>;
    /** Callback function to trigger before print */
    onBeforePrint?: () => void | Promise<void>;
    /** Override default print window styling */
    pageStyle?: string | (() => string);
    /** Remove the iframe after printing. */
    removeAfterPrint?: boolean;
    /** Delay in ms before printing, to ensure everything is rendered. Default: 500 */
    suppressErrors?: boolean;
    /** Print the first page only */
    print?: (target: HTMLIFrameElement) => void;
  }

  export interface UseReactToPrintResponse {
    /** Function to trigger printing */
    handlePrint: () => void;
    /** Whether the component is currently printing */
    isPrinting: boolean;
  }

  export function useReactToPrint(options: UseReactToPrintOptions): UseReactToPrintResponse;

  export default class ReactToPrint extends Component<ReactToPrintProps> {}
}
