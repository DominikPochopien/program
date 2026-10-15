const MIN_DISTANCE_PX = 60;      // minimalna długość przesunięcia palcem
const MAX_VERTICAL_RATIO = 0.6;  // część pionowa gestu nie może przeważać nad poziomą

// Obsługa przesunięcia palcem w lewo / w prawo (telefon, tablet).
export function bindSwipe(element, { onSwipeLeft, onSwipeRight }) {
  let start = null;

  element.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { start = null; return; } // ignorujemy gest dwoma palcami (np. zoom)
    start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  element.addEventListener('touchend', (e) => {
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    start = null;

    if (Math.abs(dx) < MIN_DISTANCE_PX || Math.abs(dy) > Math.abs(dx) * MAX_VERTICAL_RATIO) return;
    (dx < 0 ? onSwipeLeft : onSwipeRight)();
  }, { passive: true });

  element.addEventListener('touchcancel', () => { start = null; }, { passive: true });
}
