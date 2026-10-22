import { useEffect, useRef } from 'react';
import { createDpad, type Options } from './index.js';

/** D-pad navigation for the whole document. `onBack` may change every render; `opts` is read once. */
export function useDpad(onBack: () => void, opts: Omit<Options, 'onBack'> = {}) {
  const back = useRef(onBack);
  back.current = onBack;
  useEffect(() => createDpad(document, { ...opts, onBack: () => back.current() }), []); // eslint-disable-line react-hooks/exhaustive-deps
}
