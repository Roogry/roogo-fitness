import { cva, VariantProps } from 'class-variance-authority';

import { mergeClasses } from '@/shared/utils/merge-classes';

export const cardVariants = cva('bg-card text-card-foreground flex flex-col gap-4', {
  variants: {
    zRounded: {
      sm: 'rounded-lg sm:rounded-xl',
      default: 'rounded-2xl sm:rounded-4xl',
    },
    zLessPadding: {
      true: 'py-1 sm:py-2',
      false: 'py-4 sm:py-6',
    },
  },
  defaultVariants: {
    zLessPadding: false,
    zRounded: 'default',
  },
});

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
