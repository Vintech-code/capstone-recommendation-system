export const AVATAR_COLORS = [
  'bg-[#effcf3] text-[#1e7e34] border-[#abefc6]',
  'bg-[#eff8ff] text-[#175cd3] border-[#b2ddff]',
  'bg-[#f9f5ff] text-[#6941c6] border-[#e9d7fe]',
  'bg-[#fff4ed] text-[#b93815] border-[#fecdca]',
  'bg-[#fdf2fa] text-[#c11574] border-[#fcceee]',
  'bg-[#effcf3] text-[#1e7e34] border-[#abefc6] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
  'bg-[#eff8ff] text-[#175cd3] border-[#b2ddff] dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
  'bg-[#f9f5ff] text-[#6941c6] border-[#e9d7fe] dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
  'bg-[#fff4ed] text-[#b93815] border-[#fecdca] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
  'bg-[#fdf2fa] text-[#c11574] border-[#fcceee] dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/60',
]

export function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'AD'
  )
}

