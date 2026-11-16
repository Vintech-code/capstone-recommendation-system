import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group rounded-xl border border-[var(--toast-border)] !bg-[var(--toast-surface)] text-[var(--toast-foreground)] shadow-sm',
          title: 'font-semibold text-[var(--toast-foreground)]',
          description: 'text-sm text-[var(--toast-muted)]',
          actionButton: 'rounded-lg bg-primary text-primary-foreground',
          cancelButton: 'rounded-lg bg-muted text-muted-foreground',
          closeButton:
            'border-[var(--toast-border)] bg-[var(--toast-surface)] text-[var(--toast-muted)]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
