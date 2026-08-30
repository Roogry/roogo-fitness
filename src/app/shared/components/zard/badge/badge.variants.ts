import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center justify-center border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      zType: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90 h-5',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 h-5',
        destructive:
          'border-transparent bg-error text-white [a&]:hover:bg-error/90 focus-visible:ring-error/20 dark:focus-visible:ring-error/40 h-5',
        outline: 'border-border bg-card text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success: 'border-transparent bg-success text-white [a&]:hover:bg-success/90 h-5',
        warning: 'border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90 h-5',
        info: 'border-transparent bg-info text-white [a&]:hover:bg-info/90 h-5',
        forest: 'border-transparent bg-forest text-forest-foreground [a&]:hover:bg-forest/90 h-5',
      },
      zShape: {
        default: 'rounded-md',
        square: 'rounded-none',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      zType: 'default',
      zShape: 'default',
    },
  },
);

export type ZardBadgeTypeVariants = NonNullable<VariantProps<typeof badgeVariants>['zType']>;
export type ZardBadgeShapeVariants = NonNullable<VariantProps<typeof badgeVariants>['zShape']>;
