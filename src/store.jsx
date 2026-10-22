import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { computeMonth } from './lib/budget.js'
import { createMonth, emptyData, normalizeData, uid } from './lib/model.js'
import { loadData, saveData } from './lib/storage.js'

const StoreContext = createContext(null)

function updateMonth(state, key, fn) {
  const month = state.months[key]
  if (!month) return state
  return { ...state, months: { ...state.months, [key]: fn(month) } }
}

function reducer(state, action) {
  switch (action.type) {
    case 'replace':
      return action.data
    case 'setCurrentMonth':
      return { ...state, currentMonth: action.key }
    case 'createMonth':
      return {
        ...state,
        currentMonth: action.key,
        months: { ...state.months, [action.key]: createMonth(action.key, action.copyFrom && state.months[action.copyFrom]) },
      }
    case 'deleteMonth': {
      const months = { ...state.months }
      delete months[action.key]
      return { ...state, months }
    }
    case 'patchMonth':
      return updateMonth(state, action.key, (m) => ({ ...m, ...action.patch }))
    // list: 'incomes' | 'needs' | 'wants' | 'savings'
    case 'saveRow':
      return updateMonth(state, action.key, (m) => {
        const rows = m[action.list]
        const row = { ...action.row, id: action.row.id || uid() }
        const exists = rows.some((r) => r.id === row.id)
        return { ...m, [action.list]: exists ? rows.map((r) => (r.id === row.id ? row : r)) : [...rows, row] }
      })
    case 'removeRow':
      return updateMonth(state, action.key, (m) => ({ ...m, [action.list]: m[action.list].filter((r) => r.id !== action.id) }))
    case 'addSpent':
      return updateMonth(state, action.key, (m) => ({
        ...m,
        [action.list]: m[action.list].map((r) =>
          r.id === action.id ? { ...r, spent: Math.round((Number(r.spent) + action.amount) * 100) / 100 } : r,
        ),
      }))
    case 'setSplit':
      return { ...state, settings: { ...state.settings, split: action.split } }
    default:
      throw new Error('Unknown action ' + action.type)
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, emptyData)
  const [ready, setReady] = useState(false)
  const loaded = useRef(false)

  useEffect(() => {
    loadData().then((saved) => {
      if (saved) dispatch({ type: 'replace', data: saved })
      loaded.current = true
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (loaded.current) saveData(state)
  }, [state])

  const value = useMemo(() => {
    const key = state.currentMonth
    const month = state.months[key] || null
    const actions = {
      setCurrentMonth: (k) => dispatch({ type: 'setCurrentMonth', key: k }),
      createMonth: (k, copyFrom) => dispatch({ type: 'createMonth', key: k, copyFrom }),
      deleteMonth: (k) => dispatch({ type: 'deleteMonth', key: k }),
      patchMonth: (patch) => dispatch({ type: 'patchMonth', key, patch }),
      saveRow: (list, row) => dispatch({ type: 'saveRow', key, list, row }),
      removeRow: (list, id) => dispatch({ type: 'removeRow', key, list, id }),
      addSpent: (list, id, amount) => dispatch({ type: 'addSpent', key, list, id, amount }),
      setSplit: (split) => dispatch({ type: 'setSplit', split }),
      replaceAll: (data) => dispatch({ type: 'replace', data: normalizeData(data) }),
    }
    return {
      ready,
      data: state,
      settings: state.settings,
      monthKey: key,
      month,
      summary: month ? computeMonth(month, state.settings.split) : null,
      ...actions,
    }
  }, [state, ready])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}
