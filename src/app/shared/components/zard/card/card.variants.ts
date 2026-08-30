import { cva, VariantProps } from 'class-variance-authority';

import { mergeClasses } from '@/shared/utils/merge-classes';

export const cardVariants = cva(
  'bg-card text-card-foreground flex flex-col gap-4 border border-border',
  {
    variants: {
      zVariant: {
        default: 'bg-card text-card-foreground border-border', // Hairline - resting surface
        forest: 'bg-forest text-forest-foreground border-forest', // Forest fill - active tracker, timers
        lime: 'bg-primary text-primary-foreground border-primary', // Lime accent - primary action & live progress only
      },
      zRounded: {
        sm: 'rounded-xl sm:rounded-2xl', // 12px -> 16px
        default: 'rounded-2xl sm:rounded-[28px]', // 16px -> 28px (hairline card)
        lg: 'rounded-[24px] sm:rounded-[32px]', // 24px -> 32px
      },
      zLessPadding: {
        true: 'py-1 sm:py-2',
        false: 'py-4 sm:py-6',
      },
    },
    defaultVariants: {
      zVariant: 'default',
      zLessPadding: false,
      zRounded: 'default',
    },
  },
);

export const cardHeaderVariants = cva(
  mergeClasses(
    '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2',
    'has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4 sm:[.border-b]:pb-6',
  ),
  {
    variants: {
      zLessPadding: {
        true: 'px-1 sm:px-2',
        false: 'px-4 sm:px-6',
      },
    },
    defaultVariants: {
      zLessPadding: false,
    },
  },
);

export const cardActionVariants = cva(
  'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
);

export const cardBodyVariants = cva('flex-1 ', {
  variants: {
    zLessPadding: {
      true: 'px-1 sm:px-2',
      false: 'px-4 sm:px-6',
    },
  },
  defaultVariants: {
    zLessPadding: false,
  },
});

export const cardFooterVariants = cva('flex flex-col gap-2 items-center', {
  variants: {
    zLessPadding: {
      true: 'px-1 sm:px-2',
      false: 'px-4 sm:px-6 [.border-t]:pt-4 sm:[.border-t]:pt-6',
    },
  },
  defaultVariants: {
    zLessPadding: false,
  },
});

export type ZardCardRoundedVariants = NonNullable<VariantProps<typeof cardVariants>['zRounded']>;
export type ZardCardNoPaddingVariants = NonNullable<
  VariantProps<typeof cardVariants>['zLessPadding']
>;
export type ZardCardVariant = NonNullable<VariantProps<typeof cardVariants>['zVariant']>;
