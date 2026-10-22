import { IconBag, IconHome, IconPiggy } from './Icons.jsx'

export const GROUP_ICONS = { needs: IconHome, wants: IconBag, savings: IconPiggy }

// The group's icon on a tinted chip in the group colour. Used wherever
// Needs / Wants / Savings are named, matching the tab bar.
export default function GroupIcon({ group, size = 'md' }) {
  const Icon = GROUP_ICONS[group]
  return (
    <span className={`gicon gicon-${size} c-${group}`} aria-hidden="true">
      <Icon />
    </span>
  )
}
