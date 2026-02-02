import { useEffect, useRef } from 'react';

export function usePieceAnimation() {
  const gridElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function callback(mutations: MutationRecord[]) {
      let from = null, to = null, piece = null;
      for (const m of mutations) {
        if (m.addedNodes.length) { 
          to = m.target as Element; 
          piece = m.addedNodes[0] as Element; 
        } else if (m.removedNodes.length) { 
          from = m.target as Element; 
        }
      }
      if (from && to && piece) {
        const rFrom = from.getBoundingClientRect(), rTo = to.getBoundingClientRect();
        const dx = rFrom.x - rTo.x, dy = rFrom.y - rTo.y;
        piece.animate([
          { translate: `${dx}px ${dy}px` },
          { translate: "0px 0px" },
        ], { duration: 200, easing: "cubic-bezier(0.65, 0, 0.35, 1)" });
      }
    }
    
    if (gridElement.current) {
      const observer = new MutationObserver(callback);
      observer.observe(gridElement.current, { subtree: true, childList: true });
      return () => observer.disconnect();
    }
  }, []);

  return gridElement;
}