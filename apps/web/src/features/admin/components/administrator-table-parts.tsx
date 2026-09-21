import { humanize } from '@/features/admin/data/admin-formatters'

export function StatusBadge({ status }: { status: string }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf3] px-2.5 py-0.5 text-xs font-medium text-[#027a48] border border-[#a6f4c5] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
        <span className="size-1.5 rounded-full bg-[#12b76a] dark:bg-emerald-400" />
        Active
      </span>
    )
  }
  if (status === 'suspended') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3f2] px-2.5 py-0.5 text-xs font-medium text-[#b42318] border border-[#fecdca] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60">
        <span className="size-1.5 rounded-full bg-[#f04438] dark:bg-rose-400" />
        Suspended
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffaeb] px-2.5 py-0.5 text-xs font-medium text-[#b54708] border border-[#fedf89] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
        <span className="size-1.5 rounded-full bg-[#f79009] dark:bg-amber-400" />
        Pending
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border">
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      {humanize(status)}
    </span>
  )
}

export function AccessBadges({ canManage }: { canManage: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {canManage ? (
        <>
          <span className="inline-flex items-center rounded-md bg-[#effcf3] px-2 py-0.5 text-xs font-medium text-[#1e7e34] border border-[#abefc6] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
            Admin
          </span>
          <span className="inline-flex items-center rounded-md bg-[#eff8ff] px-2 py-0.5 text-xs font-medium text-[#175cd3] border border-[#b2ddff] dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60">
            Account Manager
          </span>
        </>
      ) : (
        <span className="inline-flex items-center rounded-md bg-[#f8f9fa] px-2 py-0.5 text-xs font-medium text-[#475467] border border-[#eaecf0] dark:bg-muted/40 dark:text-muted-foreground dark:border-border">
          Standard
        </span>
      )}
    </div>
  )
}

