## Newboard

Online whiteboard tool to create and share diagrams, charts, and notes with others.

Similar to Miro, but free and open source. We'll start with a simple whiteboard and then add more features as we go.

## Features

- 10000*10000px canvas, which is scrollable

## Tech Stack

- React
- Vite
- Styled components
- Redux Toolkit

## Technical implementation

- Only frontend, no backend
- UI consists of a left sidebar and a main canvas
- The main canvas contains CanvasItems, which currently contains only TextItems, which are like sticky notes
- The main canvas and items are rendered as HTML divs and have absolute positioning
- Around the main canvas, there's a wrapper div that has overflow: scroll and is the size of the canvas. This is the scrollable area.

## Data model

The main object is the Workspace, 

```typescript
interface Workspace {
    items: Record<string, CanvasItem>;
}
```

Each CanvasItem has a unique id, a type, and a position.

```typescript
interface Note {
    id: string;
    type: "Note";
    position: { x: number; y: number };
    content: string;
}

// For, now, there's only one type of item, but we'll add more types as we go.
type CanvasItem = Note;
```

## Actions

### Create Note
The sidebar has Note which can be dragged to the canvas. When the user drags a Note to the canvas, a new Note item is created in the Workspace.

```typescript
interface CreateItemAction {
    type: "CREATE_ITEM";
    payload: CanvasItem;
}
```

### Move Note

A Note can be moved by dragging it. When the user drags a Note, the Note's position is updated in the Workspace. The note is not actually moved until the user releases the mouse button.

```typescript
interface MoveItemAction {
    type: "MOVE_ITEM";
    payload: {
        id: string;
        position: { x: number; y: number };
    };
}
```