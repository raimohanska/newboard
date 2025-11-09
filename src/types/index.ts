export interface Note {
  id: string;
  type: "Note";
  position: { x: number; y: number };
  content: string;
}

export type CanvasItem = Note;

export interface Workspace {
  items: Record<string, CanvasItem>;
}

