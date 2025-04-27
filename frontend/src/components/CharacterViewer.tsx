import React, { useEffect, useRef, useState } from "react";
import { generateModels } from "wow-model-viewer";

interface ModelInstance {
  destroy?: () => void;
  setFullscreen?: (fullscreen: boolean) => void;
  setDistance?: (distance: number) => void;
  get currentCharacterOptions(): unknown;
  renderer: {
    resize: (width: number, height: number) => void;
    gl: {
      clearColor: (r: number, g: number, b: number, a: number) => void;
    };
    textureCache: Map<string, { c: boolean }>;
    actors: Array<{
      materials: Array<{
        layers: Array<{
          texture: string | null;
        }>;
      }>;
    }>;
    context: WebGLRenderingContext;
  };
  canvas: HTMLCanvasElement;
  aspect: number;
  onModelLoaded?: () => void;
  loaded?: boolean;
}

// Declare WowModelViewer as a global variable
declare global {
  interface Window {
    ZamModelViewer: new (options: {
      container: JQuery<HTMLElement>;
      aspect: number;
      contentPath: string;
      type: number;
    }) => {
      setOffset(x: number, y: number): void;
      setZoom(level: number): void;
      reset(): void;
    };
    CONTENT_PATH: string;
  }
}

interface CharacterViewerProps {
  race: number;
  gender: number;
  items: [number, number][];
  skin: number;
  face: number;
  hairStyle: number;
  hairColor: number;
  facialStyle: number;
  id: string;
  resizeKey?: number;
  onRenderComplete?: () => void;
}

const CharacterViewer: React.FC<CharacterViewerProps> = ({
  race,
  gender,
  items,
  skin,
  face,
  hairStyle,
  hairColor,
  facialStyle,
  id,
  onRenderComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<ModelInstance | null>(null);
  const previousHeightRef = useRef<number>(0);

  useEffect(() => {
    const initModel = () => {
      console.log("initing model");

      try {
        const container = containerRef.current;
        if (!container) {
          throw new Error("Container not available");
        }

        // Store the previous height
        previousHeightRef.current = container.clientHeight;

        // Clear any existing content
        container.innerHTML = "";

        // Add an ID to the container for the selector
        container.id = "character-viewer-container-" + id;

        const character = {
          race,
          gender,
          items,
          skin,
          face,
          hairStyle,
          hairColor,
          facialStyle,
        };

        // Clean up any existing model
        if (modelRef.current?.destroy) {
          try {
            modelRef.current.destroy();
            modelRef.current = null;
          } catch (e) {
            console.error("Error cleaning up model:", e);
          }
        }

        // this is the only way i can tell if the model is loaded
        function isCanvasNonBlack(modelInstance: ModelInstance): boolean {
          const gl = modelInstance.renderer.context;
          const pixel = new Uint8Array(4);

          // Read 1 pixel from center of canvas
          const x = Math.floor(gl.drawingBufferWidth / 2);
          const y = Math.floor(gl.drawingBufferHeight / 2);

          gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

          const [r, g, b, a] = pixel;

          // Check if pixel is "not black" (or transparent)
          return r !== 0 || g !== 0 || b !== 0 || a !== 0;
        }

        async function waitForCanvasToRender(
          modelInstance: ModelInstance
        ): Promise<void> {
          return new Promise<void>((resolve) => {
            const check = () => {
              if (isCanvasNonBlack(modelInstance)) {
                resolve();
              } else {
                requestAnimationFrame(check);
              }
            };
            check();
          });
        }

        generateModels(
          16 / 9,
          "#character-viewer-container-" + id,
          character
        ).then((newModel) => {
          // set the modelRef to new model
          modelRef.current = newModel as unknown as ModelInstance;

          console.log("modelRef.current", modelRef.current);

          waitForCanvasToRender(modelRef.current).then(() => {
            console.log("All textures loaded");
            requestAnimationFrame(() => {
              onRenderComplete?.();
            });
          });
        });
      } catch (error) {
        console.error("Error initializing model:", error);
        setError(
          error instanceof Error ? error.message : "Failed to initialize model"
        );
      }
    };

    initModel();

    window.addEventListener("resize", () => {
      const container = containerRef.current;
      if (!container) return;

      const modelInstance = modelRef.current;
      if (!modelInstance) return;

      // seems like i need to subtract 1 to stop the horizontal scrollbar from appearing (i think it's roun)
      const width = container.offsetWidth - 1;
      const height = Math.round(width / (modelInstance.aspect ?? 16 / 9));

      modelInstance.renderer.resize(width, height);
    });

    // Default cleanup if viewer wasn't initialized
    return () => {
      console.log("Unmounting CharacterViewer");
      if (modelRef.current?.destroy) {
        try {
          modelRef.current.destroy();
          modelRef.current = null;
        } catch (e) {
          console.error("Error cleaning up model:", e);
        }
      }
      const container = containerRef.current;
      if (container) {
        container.id = "";
      }
    };
  }, [
    race,
    gender,
    items,
    skin,
    face,
    hairStyle,
    hairColor,
    facialStyle,
    id,
    onRenderComplete,
  ]);

  useEffect(() => {
    console.log("CharacterViewer mounted");
    return () => console.log("CharacterViewer unmounted");
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="pointer-events-none touch-none w-full h-full"
        style={{
          width: "100%",
          height: "100%",
          position: "relative" as const,
        }}
      />
      {error && <div>Error: {error}</div>}
    </div>
  );
};

export default CharacterViewer;
