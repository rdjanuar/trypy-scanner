import { tv } from '../libs/tv';

export const drawerTheme = tv({
  slots: {
    wrapper: 'fixed inset-0 z-50 flex',
    overlay: 'fixed inset-0 bg-black/80 transition-opacity duration-300',
    base: 'relative flex flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out',
    header: 'px-4 py-4 sm:px-6',
    title: 'text-lg font-semibold leading-6 text-gray-900',
    description: 'mt-1 text-sm text-gray-500',
    body: 'relative flex-1 px-4 sm:px-6 overflow-y-auto',
    footer: 'px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6',
  },
  variants: {
    direction: {
      right: {
        wrapper: 'justify-end',
        base: 'w-screen max-w-md h-full inset-y-0 right-0',
      },
      left: {
        wrapper: 'justify-start',
        base: 'w-screen max-w-md h-full inset-y-0 left-0',
      },
      top: {
        wrapper: 'items-start',
        base: 'w-full h-auto max-h-[80vh] inset-x-0 top-0',
      },
      bottom: {
        wrapper: 'items-end',
        base: 'w-full h-auto max-h-[80vh] inset-x-0 bottom-0 rounded-t-xl',
      }
    },
    isOpen: {
      true: {
        overlay: 'opacity-100',
      },
      false: {
        overlay: 'opacity-0 pointer-events-none',
      }
    }
  },
  compoundVariants: [
    { direction: 'right', isOpen: false, class: { base: 'translate-x-full' } },
    { direction: 'right', isOpen: true, class: { base: 'translate-x-0' } },
    { direction: 'left', isOpen: false, class: { base: '-translate-x-full' } },
    { direction: 'left', isOpen: true, class: { base: 'translate-x-0' } },
    { direction: 'top', isOpen: false, class: { base: '-translate-y-full' } },
    { direction: 'top', isOpen: true, class: { base: 'translate-y-0' } },
    { direction: 'bottom', isOpen: false, class: { base: 'translate-y-full' } },
    { direction: 'bottom', isOpen: true, class: { base: 'translate-y-0' } }
  ],
  defaultVariants: {
    direction: 'right',
    isOpen: false
  }
});