// The illustrated couple as live SVG: they blink now and then, the bride's sbai sways
// and her crown catches the light. CSS animations only (paused under reduced motion).
import { useMemo } from 'react';
import { couple, resetIds } from '../art/characters';

export default function AnimatedCouple({ className = '' }) {
  const markup = useMemo(() => {
    resetIds();
    // ids are prefixed so the gradients never clash with other SVGs on the page
    return couple({ eyes: 'open' }).replace(/id="(\w+)"/g, 'id="ac-$1"').replace(/url\(#(\w+)\)/g, 'url(#ac-$1)');
  }, []);
  return (
    <svg className={`anim-couple ${className}`} viewBox="-300 -1130 600 1150" role="img" aria-label="" dangerouslySetInnerHTML={{ __html: markup }} />
  );
}
