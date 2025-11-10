## Performance optimizations

### Use a state store

Using React's `useState` will lead to component re-rendering on each change. That's not suitable for application level state. Instead, use a state store such as Redux so that you can select more precicely which piece of state your component should re-render on, using the `useSelector` hook.

### Use minimal state selectors

Make sure your root component is not re-rendered unnecessarily. In this case, [`Canvas`](frontend/src/components/Canvas.tsx) must not re-render when a [`Note`](frontend/src/components/Note.tsx) is moved. For this, it must only use the list of item ids from the store. With Redux, make your `useSelector` calls return just the necessary piece of state.

- Before: Canvas component had `useSelector` that reacted to changes in all items
- After: Canvas component only tracks the list of IDs, and doesn't need to re-render

Commit: 0136a181e7333ca680c26ee5ad7dc5ae8d600de7

### Use memoized selectors

Make sure to use memoized selectors, to avoid rendering when nothing relevant has changed. For instance, two arrays are not equal by `===` even if they have the same contents. If your selector returns an array, it will re-render each time unless you memoize correctly.

Use `fast-deep-equal` or similar for comparing objects. In Redux, you can use `createSelector` with `memoizeOptions`.

Commit: 0136a181e7333ca680c26ee5ad7dc5ae8d600de7

### Split to components based on update frequency

If your component reacts to state slices with different update frequency, consider splitting it so as to minimize unnecessary rendering.

For instance in [`Note.tsx`](frontend/src/components/Note.tsx), I extracted the more render-heavy stuff into an inner component `NoteContent`, that doesn't need to be re-rendered if note position changes. Memoization is of course needed to prevent the inner component from rendering each time the outer one is rendered!

Commit: 2b1a741d19bb5c05c1c9f7fa2f790016e5af7401

### Use non-reactive state access in event handlers

If you need some state in event handlers, consider taking the state directly from your state store in the handler, instead of using `useSelector`. Otherwise your component will render whenever this state changes, even though you only need the data in an event handler.

Commit: 60393d7d58c669af50ce154ebbcf2208c9b95212

### Consider a mutable state store

Consider mutable state store. If your state is large, it will be expensive to clone it on every change. Using, for instance, a Y.js document may prove more performant, as there's no cloning.

In this case I moved document state to Y.js document (see [`ItemStore.ts`](frontend/src/store/ItemStore.ts)), which is a mutable state store (among other things). 

Commit: 7fa88b1232b1bd6cc63f703bf352089f4c4b8e9b

### Lazy initialization with viewport detection

Initialize expensive stuff only if your component is actually in viewport. Create a `useIsInViewPort` hook. Note: this hook was later removed from this project when we switched to conditional rendering instead.

Commit: 1f46f47fa1a7d036007b867221d9393e71a180ed

### Conditional rendering

Initialize expensive stuff only when needed. Quill text editor, for instance, is a bit expensive if instantiated for thousands of texts. You may use a simpler component for a read-only view. In this case, a `PlainTextView` component is used instead for Notes that are not selected. See [`Note.tsx`](frontend/src/components/Note.tsx) and [`QuillEditor.tsx`](frontend/src/components/QuillEditor.tsx).

Commit: 14bae23ff3e6f136ce4fdc2cbf6184cfb367b0cc

### CSS content-visibility

Consider CSS `content-visibility: auto`, which might speed things up if browser painting is a bottleneck. This may become relevant after you've already eliminated unnecessary React rendering, but the browser still takes its time painting. 

See the `ItemPositionerContainer` styled component in [`ItemPositioner.tsx`](frontend/src/components/ItemPositioner.tsx).

Commit: 2b1a741d19bb5c05c1c9f7fa2f790016e5af7401

## Performance measurements

Make sure your optimizations actually work! It's not enough to think they work. You need to verify.

1. Create an easy way to populate your application with a meaningfully large set of data. Now you can see how it performs in realistic worst case. In my case, there's an "Add 1000 notes" button in [`Sidebar.tsx`](frontend/src/components/Sidebar.tsx).
2. Measure before optimization. Repeat the measurement after optimization to verify it took effect.
3. For React components, create a simple render counter so you can observe how often a component is rendered. See [`renderCounts.ts`](frontend/src/utils/renderCounts.ts).
4. Add automatic tests that assert render counts, so that you won't accidentally break performance optimizations. You can make your renderCounts object visible to your tests by exporting it to the Window object.

For this project, there's no Playwright tests yet, but that would be the next step to lock in all the React optimizations.