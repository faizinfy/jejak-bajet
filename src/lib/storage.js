// Persistence layer. Everything the app saves goes through loadData/saveData,
// so swapping localStorage for Supabase later only touches this file.
// The functions are async on purpose to match a remote backend.

import { normalizeData } from './model.js'

const KEY = 'jejak-bajet:data'

export async function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? normalizeData(JSON.parse(raw)) : null
  } catch (err) {
    console.warn('Could not read saved data', err)
    return null
  }
}

export async function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
    return true
  } catch (err) {
    console.warn('Could not save data', err)
    return false
  }
}

export async function clearData() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
