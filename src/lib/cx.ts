import clsx, { type ClassValue } from 'clsx';

/** Tailwind class-name helper. Pure re-export of `clsx` under a shorter
 *  name so JSX stays terse: `<div className={cx('base', cond && 'extra')}>`. */
export const cx = (...args: ClassValue[]) => clsx(...args);
