import { cva, type VariantProps } from 'class-variance-authority';

export const headerVariants = cva('block sticky top-0 left-0 right-0 w-full z-99 flex flex-col', {
  variants: {
    transparent: {
      false: 'min-h-[80px] py-2 mb-5 bg-background border-b',
      true: 'pt-8 pb-12 bg-linear-to-t from-background/10 via-background/80 via-20% to-background/100 to-90%',
    },
  },
  defaultVariants: {
    transparent: false,
  },
});

export type HeaderVariants = NonNullable<VariantProps<typeof headerVariants>['transparent']>;
