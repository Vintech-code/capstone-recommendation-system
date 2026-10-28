import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold whitespace-nowrap shadow-[var(--shadow-clay-sm)] transition-[color,background-color,border-color,box-shadow] duration-200 outline-none hover:shadow-[var(--shadow-clay-sm)] active:shadow-[inset_0_1px_2px_var(--shadow-button-clay-pressed)] focus-visible:ring-3 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:shadow-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30',
        outline:
          'border border-input bg-background hover:border-primary/30 hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'shadow-none hover:bg-accent hover:text-accent-foreground hover:shadow-none active:shadow-none',
        link:
          'text-primary-ink shadow-none underline-offset-4 hover:shadow-none hover:underline active:shadow-none',
        clay:
          'assessment-btn-clay text-foreground hover:text-foreground',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-10 px-4 text-xs',
        lg: 'h-12 px-7',
        icon: 'size-11',
        'icon-sm': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export { buttonVariants }
