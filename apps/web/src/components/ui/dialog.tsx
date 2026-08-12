import type { ComponentProps } from 'react'
import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close
const DialogPortal = DialogPrimitive.Portal

function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity data-[state=closed]:opacity-0 data-[state=open]:opacity-100', className)} {...props} />
}

function DialogContent({ className, children, closeLabel = 'Close dialog', ...props }: ComponentProps<typeof DialogPrimitive.Content> & { closeLabel?: string }) {
  return <DialogPortal><DialogOverlay /><DialogPrimitive.Content className={cn('fixed left-1/2 top-1/2 z-50 max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-background p-0 shadow-2xl outline-none transition data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100', className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><X aria-hidden="true" className="size-5" /><span className="sr-only">{closeLabel}</span></DialogPrimitive.Close></DialogPrimitive.Content></DialogPortal>
}

function DialogHeader({ className, ...props }: ComponentProps<'div'>) { return <div className={cn('flex flex-col gap-1.5', className)} {...props} /> }
function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title className={cn('font-display text-2xl font-semibold tracking-tight', className)} {...props} /> }
function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description className={cn('text-sm leading-6 text-muted-foreground', className)} {...props} /> }

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger }
