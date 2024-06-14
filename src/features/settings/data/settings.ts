import { createStore } from 'jotai'

export let settingsStore = createStore()

export function resetSettingsStore() {
  settingsStore = createStore()
}
