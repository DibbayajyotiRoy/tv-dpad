export type Rect = { left: number; right: number; top: number; bottom: number };
export type Options = {
  /** Called on Escape, or Backspace when not typing in an input. */
  onBack?: () => void;
  /** Selector for focusable elements. */
  focusable?: string;
  /** If an element matching this exists, only its focusables are reachable (dialogs). */
  modal?: string;
};

const SEL = 'button, input, select, a[href], [tabindex="0"]';
const typing = (el: Element | null): el is HTMLInputElement =>
  el instanceof HTMLInputElement && !['button', 'checkbox', 'radio', 'range'].includes(el.type);

/** Index in `list` of the best rect to move to from `a` in the arrow direction `key`, or -1. Pure: no DOM. */
export function nearest(a: Rect, list: Rect[], key: string): number {
  const horiz = key === 'ArrowLeft' || key === 'ArrowRight';
  const sign = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
  let best = -1, bestScore = Infinity;
  list.forEach((b, i) => {
    const main = horiz ? (b.left + b.right - a.left - a.right) / 2 : (b.top + b.bottom - a.top - a.bottom) / 2;
    if (main * sign <= 1) return; // behind, or the source itself
    const gap = horiz ? Math.max(b.left - a.right, a.left - b.right, 0) : Math.max(b.top - a.bottom, a.top - b.bottom, 0);
    // Cross-axis distance from the source's centre to the candidate's extent: 0 for anything directly in line,
    // so a full-width row is reachable from a chip instead of losing to a narrow neighbour off to the side.
    const c = horiz ? (a.top + a.bottom) / 2 : (a.left + a.right) / 2;
    const cross = Math.max((horiz ? b.top : b.left) - c, c - (horiz ? b.bottom : b.right), 0);
    const score = gap + Math.abs(main) * 0.1 + cross * 2; // ponytail: hand-tuned weights, expose them if a layout needs it
    if (score < bestScore) { bestScore = score; best = i; }
  });
  return best;
}

/** Spatial D-pad navigation under `root`. Returns a dispose function. */
export function createDpad(root: Document | HTMLElement, opts: Options = {}): () => void {
  const { onBack, focusable = SEL, modal = '[data-modal]' } = opts;
  const target = root as Document; // Document and HTMLElement share the listener API we use

  const onKey = (e: KeyboardEvent) => {
    const cur = document.activeElement as HTMLElement | null;
    if (e.key.startsWith('Arrow')) {
      if (typing(cur) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const { selectionStart: s, selectionEnd: n, value } = cur;
        if (!(s === n && (e.key === 'ArrowLeft' ? s === 0 : s === value.length))) return; // let the caret move
      }
      if (cur?.tagName === 'SELECT' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) cur.blur(); // else it changes value
      e.preventDefault();
      const els = Array.from((root.querySelector(modal) ?? root).querySelectorAll<HTMLElement>(focusable))
        .filter((el) => { const r = el.getBoundingClientRect(); return !(el as HTMLButtonElement).disabled && r.width > 0 && r.height > 0; });
      if (!cur || !els.includes(cur)) return els[0]?.focus();
      els[nearest(cur.getBoundingClientRect(), els.map((el) => el.getBoundingClientRect()), e.key)]?.focus();
    } else if (onBack && (e.key === 'Escape' || (e.key === 'Backspace' && !typing(document.activeElement)))) {
      e.preventDefault();
      onBack();
    }
  };
  const onFocus = (e: FocusEvent) => (e.target as HTMLElement).scrollIntoView?.({ block: 'nearest', inline: 'nearest' });

  target.addEventListener('keydown', onKey);
  target.addEventListener('focusin', onFocus);
  return () => { target.removeEventListener('keydown', onKey); target.removeEventListener('focusin', onFocus); };
}
