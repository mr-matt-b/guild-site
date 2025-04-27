export interface ZamModelViewer {
  container: HTMLElement;
  aspect: number;
  contentPath: string;
  setFullscreen(fullscreen: boolean): void;
  destroy(): void;
  setOffset(x: number, y: number): void;
  setZoom(level: number): void;
}

export interface WH {
  ZamModelViewer: new (options: {
    container: HTMLElement;
    aspect: number;
    contentPath: string;
  }) => ZamModelViewer;
}

declare global {
  interface Window {
    WH: WH;
  }
}
