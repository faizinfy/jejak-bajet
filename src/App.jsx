import { useEffect, useState } from 'react'
import { useStore } from './store.jsx'
import { IconBag, IconGear, IconHome, IconIncome, IconPiggy, IconSummary } from './components/Icons.jsx'
import MonthBar from './components/MonthBar.jsx'
import EmptyMonth from './components/EmptyMonth.jsx'
import Summary from './views/Summary.jsx'
import Income from './views/Income.jsx'
import Group from './views/Group.jsx'
import Settings from './views/Settings.jsx'

const TABS = [
  { id: 'summary', label: 'Summary', Icon: IconSummary },
  { id: 'income', label: 'Income', Icon: IconIncome },
  { id: 'needs', label: 'Needs', Icon: IconHome },
  { id: 'wants', label: 'Wants', Icon: IconBag },
  { id: 'savings', label: 'Savings', Icon: IconPiggy },
]

const TAB_KEY = 'jejak-bajet:tab'

function readTab() {
  try {
    const t = localStorage.getItem(TAB_KEY)
    return TABS.some((x) => x.id === t) ? t : 'summary'
  } catch {
    return 'summary'
  }
}

export default function App() {
  const { ready, month } = useStore()
  const [tab, setTab] = useState(readTab)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, tab)
    } catch {
      // ignore
    }
    window.scrollTo(0, 0)
  }, [tab, settingsOpen])

  if (!ready) return <div className="app" />

  if (settingsOpen) {
    return (
      <div className="app">
        <Settings onBack={() => setSettingsOpen(false)} />
      </div>
    )
  }

  let view
  if (!month) view = <EmptyMonth />
  else if (tab === 'summary') view = <Summary goTo={setTab} />
  else if (tab === 'income') view = <Income />
  else view = <Group key={tab} group={tab} />

  return (
    <div className="app">
      <header className="topbar">
        <MonthBar />
        <button type="button" className="icon-btn" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
          <IconGear />
        </button>
      </header>

      <main className="content">{view}</main>

      <nav className="tabbar" aria-label="Sections">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? 'active' : ''}`}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => setTab(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
