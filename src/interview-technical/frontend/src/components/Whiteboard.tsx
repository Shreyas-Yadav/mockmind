"use client";

import { useCallback, useRef, useEffect } from "react";
import { Tldraw, useEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

const JPEG_QUALITY = 0.7;

function EditorCapture({
  onReady,
}: {
  onReady: (getDiagramBase64: () => Promise<string>) => void;
}) {
  const editor = useEditor();

  useEffect(() => {
    if (!editor) return;

    const getDiagramBase64 = async (): Promise<string> => {
      try {
        const shapeIds = Array.from(editor.getCurrentPageShapeIds());
        if (shapeIds.length === 0) return "";

        const { blob } = await editor.toImage(shapeIds, {
          format: "jpeg",
          quality: JPEG_QUALITY,
          background: true,
        });

        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(",")[1] ?? "";
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch {
        return "";
      }
    };

    onReady(getDiagramBase64);
  }, [editor, onReady]);

  return null;
}

export interface WhiteboardRef {
  getDiagramBase64: () => Promise<string>;
}

export default function Whiteboard({
  whiteboardRef,
}: {
  whiteboardRef: React.RefObject<WhiteboardRef | null>;
}) {
  const getDiagramRef = useRef<(() => Promise<string>) | null>(null);

  const handleReady = useCallback((getDiagramBase64: () => Promise<string>) => {
    getDiagramRef.current = getDiagramBase64;
  }, []);

  useEffect(() => {
    if (!whiteboardRef) return;
    (whiteboardRef as React.MutableRefObject<WhiteboardRef | null>).current = {
      getDiagramBase64: async () => getDiagramRef.current?.() ?? "",
    };
    return () => {
      (whiteboardRef as React.MutableRefObject<WhiteboardRef | null>).current = null;
    };
  }, [whiteboardRef]);

  const handleMount = useCallback((editor: { user: { updateUserPreferences: (prefs: { colorScheme: string }) => void } }) => {
    editor.user.updateUserPreferences({ colorScheme: "dark" });
  }, []);

  return (
    <div className="h-full min-h-0 w-full border-2 border-[#3f3f3f] rounded-sm overflow-hidden">
      <Tldraw onMount={handleMount}>
        <EditorCapture onReady={handleReady} />
      </Tldraw>
    </div>
  );
}
