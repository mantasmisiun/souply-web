import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

/**
 * Tweens to a new numeric value with an ease-out count-up and a subtle
 * one-shot scale "pop" when the value changes — used for the live
 * collective-savings tile on the creator dashboard, which updates when
 * the templates poll picks up new server-side savings. Deliberately
 * restrained (≈0.7 s, 1.12× pop) so it reads as "this just grew" without
 * being distracting. No animation on first mount (starts at the value).
 */
export function AnimatedNumber({
    value,
    format,
    durationSec = 0.7,
}: {
    value: number;
    format?: (n: number) => string;
    durationSec?: number;
}) {
    const [display, setDisplay] = useState(value);
    const prev = useRef(value);
    const controls = useAnimationControls();

    useEffect(() => {
        const from = prev.current;
        const to = value;
        prev.current = to;
        if (from === to) { setDisplay(to); return; }

        controls.start({ scale: [1, 1.12, 1] }, { duration: 0.45, ease: 'easeOut' });

        const ms = durationSec * 1000;
        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
            const p = Math.min(1, (now - start) / ms);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            setDisplay(from + (to - from) * eased);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, durationSec, controls]);

    return (
        <motion.span animate={controls} style={{ display: 'inline-block' }}>
            {format ? format(display) : Math.round(display).toString()}
        </motion.span>
    );
}
