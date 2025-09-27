declare module 'html2canvas' {
  interface Html2CanvasOptions {
    /** Whether to allow cross-origin images to taint the canvas */
    allowTaint?: boolean;
    /** Canvas background color, if none is specified in DOM. Set null for transparent */
    backgroundColor?: string | null;
    /** Use canvas.toDataURL to return a data URI */
    canvas?: HTMLCanvasElement;
    /** Whether to use ForeignObject rendering if the browser supports it */
    foreignObjectRendering?: boolean;
    /** Logging level */
    logging?: boolean;
    /** Scale to use for rendering */
    scale?: number;
    /** Whether to include the letter-spacing CSS property in text rendering */
    letterRendering?: boolean;
    /** Whether to attempt to load cross-origin images as CORS served, before reverting back to proxy */
    useCORS?: boolean;
    /** Whether to attempt using proxies for same-origin or CORS requests */
    proxy?: string | null;
    /** Timeout for loading images, in milliseconds. Setting it to 0 will result in no timeout */
    imageTimeout?: number;
    /** Whether to render each clipped element to a separate canvas and then render those on top of the main canvas */
    removeContainer?: boolean;
    /** The width of the canvas */
    width?: number;
    /** The height of the canvas */
    height?: number;
    /** The x-coordinate to place the canvas at */
    x?: number;
    /** The y-coordinate to place the canvas at */
    y?: number;
    /** The scroll X position to use for drawing */
    scrollX?: number;
    /** The scroll Y position to use for drawing */
    scrollY?: number;
    /** Window width to use when rendering */
    windowWidth?: number;
    /** Window height to use when rendering */
    windowHeight?: number;
  }

  interface Html2CanvasResult {
    canvas: HTMLCanvasElement;
  }

  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
  
  export default html2canvas;
}
