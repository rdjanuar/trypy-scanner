export const buttonTheme = {
  slots: {
    base: "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    loadingIcon: 'animate-spin shrink-0',
  },
  variants: {
    variant: {
      solid: { base: '' },
      outline: { base: 'border hover:opacity-80' },
      soft: { base: 'shadow-sm' },
      ghost: { base: 'hover:opacity-80' },
      link: { base: 'underline-offset-4 hover:underline' },
    },
    color: {
      primary: { base: '' },
      secondary: { base: '' },
      destructive: { base: '' },
      success: { base: '' },
      warning: { base: '' },
      gray: { base: '' },
    },
    size: {
      xs: { base: 'h-6 gap-1 rounded px-2 text-xs', loadingIcon: 'size-3' },
      sm: { base: 'h-7 gap-1 rounded-full px-2.5 text-[0.8rem]', loadingIcon: 'size-3.5' },
      md: { base: 'h-8 gap-1.5 px-3 text-sm', loadingIcon: 'size-4' },
      lg: { base: 'h-9 gap-1.5 rounded-full px-4 text-sm', loadingIcon: 'size-5' },
      xl: { base: 'h-11 gap-2 rounded-full px-4 text-base', loadingIcon: 'size-6' },
      icon: { base: 'size-8', loadingIcon: 'size-4' },
    },
    block: {
      true: { base: 'w-full flex' },
    },
    disabled: {
      true: { base: 'opacity-50 pointer-events-none' },
    },
    loading: {
      true: { base: 'pointer-events-none opacity-80' },
    },
  },
  compoundVariants: [
    // Primary
    {
      variant: 'solid',
      color: 'primary',
      class: {
        base: 'bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary/50',
      },
    },
    {
      variant: 'outline',
      color: 'primary',
      class: {
        base: 'border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary/50',
      },
    },
    {
      variant: 'soft',
      color: 'primary',
      class: {
        base: 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/50',
      },
    },
    {
      variant: 'ghost',
      color: 'primary',
      class: { base: 'text-primary hover:bg-primary/10 focus-visible:ring-primary/50' },
    },
    {
      variant: 'link',
      color: 'primary',
      class: { base: 'text-primary focus-visible:ring-primary/50' },
    },

    // Secondary
    {
      variant: 'solid',
      color: 'secondary',
      class: {
        base: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary/50',
      },
    },
    {
      variant: 'outline',
      color: 'secondary',
      class: {
        base: 'border-secondary text-secondary hover:bg-secondary/10 focus-visible:ring-secondary/50',
      },
    },
    {
      variant: 'soft',
      color: 'secondary',
      class: {
        base: 'bg-secondary/10 text-secondary hover:bg-secondary/20 focus-visible:ring-secondary/50',
      },
    },
    {
      variant: 'ghost',
      color: 'secondary',
      class: { base: 'text-secondary hover:bg-secondary/10 focus-visible:ring-secondary/50' },
    },
    {
      variant: 'link',
      color: 'secondary',
      class: { base: 'text-secondary focus-visible:ring-secondary/50' },
    },

    // Destructive
    {
      variant: 'solid',
      color: 'destructive',
      class: { base: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/50' },
    },
    {
      variant: 'outline',
      color: 'destructive',
      class: {
        base: 'border-red-600 text-red-600 hover:bg-red-50 focus-visible:ring-red-500/50 dark:hover:bg-red-950/50',
      },
    },
    {
      variant: 'soft',
      color: 'destructive',
      class: {
        base: 'bg-red-100 text-red-700 hover:bg-red-200 focus-visible:ring-red-500/50 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900',
      },
    },
    {
      variant: 'ghost',
      color: 'destructive',
      class: {
        base: 'text-red-600 hover:bg-red-50 focus-visible:ring-red-500/50 dark:text-red-500 dark:hover:bg-red-950/50',
      },
    },
    {
      variant: 'link',
      color: 'destructive',
      class: { base: 'text-red-600 focus-visible:ring-red-500/50 dark:text-red-500' },
    },

    // Success
    {
      variant: 'solid',
      color: 'success',
      class: { base: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500/50' },
    },
    {
      variant: 'outline',
      color: 'success',
      class: {
        base: 'border-green-600 text-green-600 hover:bg-green-50 focus-visible:ring-green-500/50 dark:hover:bg-green-950/50',
      },
    },
    {
      variant: 'soft',
      color: 'success',
      class: {
        base: 'bg-green-100 text-green-700 hover:bg-green-200 focus-visible:ring-green-500/50 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900',
      },
    },
    {
      variant: 'ghost',
      color: 'success',
      class: {
        base: 'text-green-600 hover:bg-green-50 focus-visible:ring-green-500/50 dark:text-green-500 dark:hover:bg-green-950/50',
      },
    },
    {
      variant: 'link',
      color: 'success',
      class: { base: 'text-green-600 focus-visible:ring-green-500/50 dark:text-green-500' },
    },

    // Warning
    {
      variant: 'solid',
      color: 'warning',
      class: { base: 'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/50' },
    },
    {
      variant: 'outline',
      color: 'warning',
      class: {
        base: 'border-amber-500 text-amber-600 hover:bg-amber-50 focus-visible:ring-amber-500/50 dark:hover:bg-amber-950/50 dark:text-amber-500',
      },
    },
    {
      variant: 'soft',
      color: 'warning',
      class: {
        base: 'bg-amber-100 text-amber-700 hover:bg-amber-200 focus-visible:ring-amber-500/50 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900',
      },
    },
    {
      variant: 'ghost',
      color: 'warning',
      class: {
        base: 'text-amber-600 hover:bg-amber-50 focus-visible:ring-amber-500/50 dark:text-amber-500 dark:hover:bg-amber-950/50',
      },
    },
    {
      variant: 'link',
      color: 'warning',
      class: { base: 'text-amber-600 focus-visible:ring-amber-500/50 dark:text-amber-500' },
    },

    // Gray
    {
      variant: 'solid',
      color: 'gray',
      class: {
        base: 'bg-zinc-800 text-zinc-50 hover:bg-zinc-900 focus-visible:ring-zinc-500/50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200',
      },
    },
    {
      variant: 'outline',
      color: 'gray',
      class: {
        base: 'border-zinc-300 text-zinc-700 hover:bg-zinc-50 focus-visible:ring-zinc-500/50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800',
      },
    },
    {
      variant: 'soft',
      color: 'gray',
      class: {
        base: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 focus-visible:ring-zinc-500/50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
      },
    },
    {
      variant: 'ghost',
      color: 'gray',
      class: {
        base: 'text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-500/50 dark:text-zinc-300 dark:hover:bg-zinc-800',
      },
    },
    {
      variant: 'link',
      color: 'gray',
      class: { base: 'text-zinc-700 focus-visible:ring-zinc-500/50 dark:text-zinc-300' },
    },
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'primary',
    size: 'md',
  },
}
