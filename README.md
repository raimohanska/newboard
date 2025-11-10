## Newboard

An experimental online whiteboard tool to create and share diagrams, charts, and notes with others.

Status: development, only supports yellow sticky notes

Demo at https://newboard.fly.dev/

This is an experiment on recreating something like ourboard.io but with a standard React stack and Y.js CRDT for document storage. It's also an experiment on AI assisted coding - I haven't written many lines of code manually here, but mostly instructing Cursor how to proceed in small batches.

## Features

- 10000*10000px canvas, which is scrollable

## Tech Stack

### Frontend
- React
- Vite
- Styled components
- Redux Toolkit (UI state)
- Y.js (collaborative data structures)
- Quill (rich text editor)
- React Router (workspace routing)

### Backend
- HocusPocus (Y.js WebSocket server)
- Node.js
- PostgreSQL (persistence)

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables (optional):**
   ```bash
   export DATABASE_URL=postgresql://newboard:newboard_dev_password@localhost:5432/newboard
   export PORT=1234
   ```
   Note: These have sensible defaults, only set if you need to override.

3. **Start development:**
   ```bash
   npm run dev
   ```
   This will:
   - Start PostgreSQL (Docker container)
   - Run database migrations automatically
   - Start frontend dev server (http://localhost:5173)
   - Start backend WebSocket server (ws://localhost:1234)

For database management commands, see [DOCKER.md](./DOCKER.md).  
For database migrations, see [backend/MIGRATIONS.md](./backend/MIGRATIONS.md).

## Technical implementation

- Monorepo structure with `frontend/` and `backend/` directories
- UI consists of a left sidebar and a main canvas
- The main canvas contains CanvasItems (sticky notes with rich text)
- The main canvas and items are rendered as HTML divs and have absolute positioning
- Around the main canvas, there's a wrapper div that has overflow: scroll and is the size of the canvas. This is the scrollable area.
- Y.js CRDTs provide real-time collaboration and local-first data sync
- Each workspace has its own URL (`/w/{workspace-id}`) and isolated data

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