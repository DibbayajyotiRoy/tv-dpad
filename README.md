# tv-dpad

Tiny, dependency-free spatial D-pad navigation for TV web apps: Fire TV / Vega WebView, Android TV, smart TVs. About 70 lines of TypeScript.

**Live demo:** https://d39pmf2ug2pe1j.cloudfront.net (SayTV, the app this was extracted from)

## Why, for TV

A TV remote has arrows, OK and Back, and nothing else. Browsers only move focus in DOM order with Tab, so a grid of posters feels broken. `tv-dpad` moves focus to the nearest focusable element in the direction pressed, using real on-screen geometry, so it works with any layout (grids, rails, full-width rows) without per-element wiring.

- Nearest focusable in the pressed direction, scored by gap, distance and alignment
- Text inputs keep their arrows until the caret reaches the edge, then release focus
- Modal scope: while an element matching `[data-modal]` exists, focus stays inside it
- Back: Escape, or Backspace when not typing, calls your `onBack`
- Focused elements are scrolled into view (`nearest`)

## Usage (vanilla)

```js
import { createDpad } from 'tv-dpad';

const dispose = createDpad(document, {
  onBack: () => history.back(),
  // focusable: 'button, input, select, a[href], [tabindex="0"]'  (default)
  // modal: '[data-modal]'                                         (default)
});
// dispose() removes the listeners
```

No bundler? `npm run build` also writes `dist/index.global.js`, a plain script that defines `createDpad` and `nearest` globally.

## Usage (React)

```tsx
import { useDpad } from 'tv-dpad/react';

function App() {
  useDpad(() => setOpen(false)); // onBack may change every render
  return <Grid />;
}
```

`react` is an optional peer dependency; the core has none.

## API

- `createDpad(root: Document | HTMLElement, opts?: { onBack?, focusable?, modal? }): () => void`
- `nearest(from: Rect, candidates: Rect[], key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'): number` is the pure geometry function (returns an index or -1), handy for tests.
- `useDpad(onBack, opts?)` from `tv-dpad/react`

## Develop

```sh
npm install
npm test            # tsc build, then node --test (Node 22.18+ runs the .ts test directly)
# then open examples/index.html in a browser (works from file:// after the build)
```

## Limits

- Focusables are queried on each key press (fine for hundreds of elements, not tens of thousands).
- `<textarea>` and `contenteditable` are not treated as text inputs.
- Scoring weights are hand-tuned for typical TV grids.

## License

MIT. Extracted from SayTV for the Amazon Developer Hackathon 2026.
