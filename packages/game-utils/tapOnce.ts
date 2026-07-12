import type { TouchEvent, MouseEvent } from 'react';

// Booth kiosk screens are React `onClick`-driven, but touch input needs
// `onTouchStart` too — a real click alone waits for touchend + the browser's
// synthesized "click" (slow, and blocked by CSS `touch-action` in odd ways).
// Firing on `touchstart` gives an instant response, but the browser still
// fires a compatibility `click` afterward regardless of what the touch
// handler does (React's touchstart listener is passive, so
// `preventDefault()` can't suppress it) — so without this guard, a single
// tap would run `fn` twice. Tag the DOM node on touch and swallow the very
// next click on it.
export function tapOnce<T extends HTMLElement = HTMLElement>(fn: () => void) {
  return {
    onTouchStart: (e: TouchEvent<T>) => {
      const el = e.currentTarget;
      el.dataset.wkTapped = '1';
      setTimeout(() => { delete el.dataset.wkTapped; }, 700);
      fn();
    },
    onClick: (e: MouseEvent<T>) => {
      if (e.currentTarget.dataset.wkTapped) {
        delete e.currentTarget.dataset.wkTapped;
        return;
      }
      fn();
    },
  };
}

// Same ghost-event problem as tapOnce, for press-and-hold controls: a real
// touchstart is followed by a compatibility mousedown+mouseup pair, which
// would otherwise call onDown/onUp a second time (e.g. starting a second
// hold-to-launch timer that onUp can never cancel). Tag the node while a
// touch is active and ignore the mouse events it spawns.
export function pressOnce<T extends HTMLElement = HTMLElement>(onDown: () => void, onUp: () => void) {
  const isTouching = (el: T) => !!el.dataset.wkTouching;
  return {
    onTouchStart: (e: TouchEvent<T>) => {
      const el = e.currentTarget;
      el.dataset.wkTouching = '1';
      setTimeout(() => { delete el.dataset.wkTouching; }, 700);
      onDown();
    },
    onTouchEnd: () => onUp(),
    onTouchCancel: () => onUp(),
    onMouseDown: (e: MouseEvent<T>) => { if (!isTouching(e.currentTarget)) onDown(); },
    onMouseUp: (e: MouseEvent<T>) => { if (!isTouching(e.currentTarget)) onUp(); },
    onMouseLeave: (e: MouseEvent<T>) => { if (!isTouching(e.currentTarget)) onUp(); },
  };
}
