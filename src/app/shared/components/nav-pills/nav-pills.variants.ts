import { cva } from 'class-variance-authority';

export const pillVariants = cva(
  'flex-1 py-2 text-sm font-semibold rounded-full transition-all text-center cursor-pointer select-none outline-none border border-transparent',
  {
    variants: {
      active: {
        true: 'bg-background text-foreground shadow-sm border-border/10',
        false: 'text-muted-foreground hover:text-foreground hover:bg-muted/10',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);
