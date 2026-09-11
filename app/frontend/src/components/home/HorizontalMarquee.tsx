import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

function duplicateForLoop(children: ReactNode, pass: 'a' | 'b') {
  return Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{ key?: string | number }>;
    return cloneElement(el, { key: `${pass}-${String(el.key ?? index)}` });
  });
}

type HorizontalMarqueeProps = {
  children: ReactNode;
  /** Pixels per frame — matches QuickActions default */
  speed?: number;
  className?: string;
  trackClassName?: string;
  pauseOnHover?: boolean;
};

export default function HorizontalMarquee({
  children,
  speed = 0.5,
  className = '',
  trackClassName = 'flex w-max gap-4',
  pauseOnHover = true,
}: HorizontalMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMq = window.matchMedia('(max-width: 767px)');

    const sync = () => {
      setReduceMotion(motionMq.matches);
      setIsMobile(mobileMq.matches);
    };

    sync();
    motionMq.addEventListener('change', sync);
    mobileMq.addEventListener('change', sync);
    return () => {
      motionMq.removeEventListener('change', sync);
      mobileMq.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || isMobile) return;

    const track = trackRef.current;
    if (!track) return;

    let x = 0;
    let frame = 0;

    const animate = () => {
      if (!paused) {
        x += speed;
        const loopWidth = track.scrollWidth / 2;
        if (loopWidth > 0 && x >= loopWidth) {
          x = 0;
        }
        track.style.transform = `translateX(${x}px)`;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [paused, reduceMotion, isMobile, speed]);

  const animateEnabled = !reduceMotion && !isMobile;

  return (
    <div
      className={`${animateEnabled ? 'overflow-hidden' : 'overflow-x-auto touch-pan-x'} ${className}`}
      dir="rtl"
      onMouseEnter={() => pauseOnHover && animateEnabled && setPaused(true)}
      onMouseLeave={() => pauseOnHover && animateEnabled && setPaused(false)}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div
        ref={trackRef}
        className={`${trackClassName} ${animateEnabled ? '' : 'snap-x snap-mandatory'}`}
        style={animateEnabled ? undefined : { transform: 'none' }}
      >
        {duplicateForLoop(children, 'a')}
        {duplicateForLoop(children, 'b')}
      </div>
    </div>
  );
}
