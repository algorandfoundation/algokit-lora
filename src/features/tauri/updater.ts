import { check, Update } from '@tauri-apps/plugin-updater'
import { ask } from '@tauri-apps/plugin-dialog'
import { relaunch } from '@tauri-apps/plugin-process'

export async function checkForAppUpdates() {
  const update = await check()

  if (update && needUpdate(update)) {
    const yes = await ask(
      `A newer version is available.
The current version is ${update.currentVersion}, new version is ${update.version}`,
      {
        title: 'New version available',
        kind: 'info',
        okLabel: 'Update',
        cancelLabel: 'Cancel',
      }
    )

    if (yes) {
      await update.downloadAndInstall()
      await relaunch()
    }
  }
}

const needUpdate = (update: Update) => {
  const { currentVersion, version } = update
  // On Windows, "beta" is removed from the version string. For example, 1.3.11-beta.6 becomes 1.3.11-6
  return update.available && currentVersion !== version.replace('beta.', '')
}
