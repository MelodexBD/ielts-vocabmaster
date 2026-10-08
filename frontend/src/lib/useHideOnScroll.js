import { useEffect, useState } from 'react';

// True while the visitor scrolls down the page, false again as soon as they scroll back up
// (or reach the top), so a sticky bar can slide out of the way of the content.
export default function useHideOnScroll(threshold = 8, topOffset = 80) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const diff = y - lastY;
      if (y <= topOffset) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(diff) >= threshold) {
        setHidden(diff > 0);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold, topOffset]);

  return hidden;
}
