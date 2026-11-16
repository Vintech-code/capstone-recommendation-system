import { toast } from 'sonner'

const DEFAULT_TOAST_DURATION = 4_000

const appToast = {
  success(title: string, description?: string) {
    toast.success(title, {
      description,
      duration: DEFAULT_TOAST_DURATION,
    })
  },
  error(title: string, description?: string) {
    toast.error(title, {
      description,
      duration: DEFAULT_TOAST_DURATION,
    })
  },
}

export { appToast }
