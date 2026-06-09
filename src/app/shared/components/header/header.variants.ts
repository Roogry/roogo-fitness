import { cva, type VariantProps } from 'class-variance-authority';

export const headerVariants = cva('block sticky top-0 left-0 right-0 w-full z-99', {
  variants: {
    isTransparant: {
      false: 'h-[80px] mb-8 bg-background border-b',
      true: 'pt-8 pb-12 bg-linear-to-t from-background/10 via-background/80 via-20% to-background/100 to-90%',
    },
  },
  defaultVariants: {
    isTransparant: false,
  },
});

export type HeaderVariants = NonNullable<VariantProps<typeof headerVariants>['isTransparant']>;
