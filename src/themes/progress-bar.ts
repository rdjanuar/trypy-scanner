import { tv } from '../libs/tv';

export const progressBarTheme = tv({
  slots: {
    base: 'w-full bg-gray-200 rounded-full overflow-hidden flex',
    indicator: 'bg-gradient-to-r from-[#ED0226] to-[#FDA22B] h-full rounded-full transition-all duration-300 ease-in-out',
  },
  variants: {
    size: {
      sm: { base: 'h-1.5' },
      md: { base: 'h-2' },
      lg: { base: 'h-3' },
    }
  },
  defaultVariants: {
    size: 'md'
  }
});
