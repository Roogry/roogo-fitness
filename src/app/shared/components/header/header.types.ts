import type { VariantProps } from 'class-variance-authority';
import type { headerVariants } from './header.variants';

export type HeaderVariants = NonNullable<VariantProps<typeof headerVariants>['transparent']>;
