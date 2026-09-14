export const AVATAR_COLORS = [
  'bg-[#effcf3] text-[#1e7e34] border-[#abefc6]',
  'bg-[#eff8ff] text-[#175cd3] border-[#b2ddff]',
  'bg-[#f9f5ff] text-[#6941c6] border-[#e9d7fe]',
  'bg-[#fff4ed] text-[#b93815] border-[#fecdca]',
  'bg-[#fdf2fa] text-[#c11574] border-[#fcceee]',
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

