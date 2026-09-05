import { cva, type VariantProps } from 'class-variance-authority';

import { mergeClasses } from '@/shared/utils/merge-classes';

export const buttonVariants = cva(
  mergeClasses(
    'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
    'aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg border border-transparent bg-clip-padding',
    "text-base font-bold focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-5 inline-flex items-center",
    'justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none',
    'shrink-0 [&_svg]:shrink-0 outline-none group/button select-none cursor-pointer touch-manipulation select-none',
  ),
  {
    variants: {
      zType: {
        default: 'bg-ink text-ink-foreground hover:bg-forest border border-ink',
        lime: 'bg-primary text-primary-foreground hover:bg-lime-600 border-primary',
        destructive:
          'bg-error text-white hover:bg-error/90 focus-visible:ring-error/20 dark:focus-visible:ring-error/40 border border-error',
        outline:
          'border-border hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground',
        dashed:
          'border-2 border-ink/25 border-dashed hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground border border-transparent',
        ghost:
          'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground border border-transparent',
        link: 'text-primary underline-offset-4 hover:underline border-transparent',
      },
      zSize: {
        default:
          'h-12 gap-2 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 gap-1.5 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-14 gap-2 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        icon: 'size-12',
        'icon-xs':
          "size-9 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-4",
        'icon-sm':
          'size-10 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-14',
      },
      zShape: {
        default: 'rounded-md',
        circle: 'rounded-full',
        square: 'rounded-none',
      },
      zFull: {
        true: 'w-full',
      },
      zLoading: {
        true: 'pointer-events-none opacity-50',
      },
      zDisabled: {
        true: 'pointer-events-none opacity-50',
      },
    },
    defaultVariants: {
      zType: 'default',
      zSize: 'default',
      zShape: 'circle',
    },
    compoundVariants: [
      { zShape: 'circle', zSize: 'default', class: 'px-4' },
      { zShape: 'circle', zSize: 'xs', class: 'px-2' },
      { zShape: 'circle', zSize: 'sm', class: 'px-3' },
      { zShape: 'circle', zSize: 'lg', class: 'px-5' },
    ],
  },
);
export type ZardButtonShapeVariants = NonNullable<VariantProps<typeof buttonVariants>['zShape']>;
export type ZardButtonSizeVariants = NonNullable<VariantProps<typeof buttonVariants>['zSize']>;
export type ZardButtonTypeVariants = NonNullable<VariantProps<typeof buttonVariants>['zType']>;
